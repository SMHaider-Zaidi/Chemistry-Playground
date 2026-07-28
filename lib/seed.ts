import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from project root before importing db connection
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import fs from 'fs';
import { Reaction, sequelize } from './db';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync models with MySQL (alter: true ensures new schema columns like 'category' get added)
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized.');

    // Read extracted.json from project root
    const filePath = path.join(process.cwd(), 'extracted.json');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at: ${filePath}`);
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const reactions = JSON.parse(rawData);

    console.log(`Found ${reactions.length} total entries in JSON. Starting database seed...`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const item of reactions) {
      // Format reactants: [{"molecule": "hydrogen", "coefficient": 2}]
      const reactants = (item.reactants || []).map((r: any) => ({
        molecule: String(r.molecule || r.name || '').trim(),
        coefficient: Number(r.coefficient) || 1,
      }));

      // Format products: [{"molecule": "water", "coefficient": 2}]
      const products = (item.products || []).map((p: any) => ({
        molecule: String(p.molecule || p.name || '').trim(),
        coefficient: Number(p.coefficient) || 1,
      }));

      // Extract category ("organic" | "inorganic")
      const category = String(item.category || 'inorganic').toLowerCase().trim();

      // Derive reaction name (equation)
      const reactionName = String(item.name || item.equation || `Reaction ${insertedCount + 1}`).trim();
      
      const description = item.conditions && item.conditions !== 'None' 
        ? `Conditions: ${item.conditions}` 
        : `Reaction of ${reactants.map((r: any) => r.molecule).filter(Boolean).join(' and ')}`;

      // Check if reaction already exists
      const existing = await Reaction.findOne({ where: { name: reactionName } });

      if (existing) {
        // Update existing reaction with the new category and details
        await existing.update({
          category: category,
          description: description,
          reactants: reactants,
          products: products,
        });
        updatedCount++;
      } else {
        // Insert new reaction entry
        await Reaction.create({
          name: reactionName,
          category: category,
          description: description,
          reactants: reactants,
          products: products,
        });
        insertedCount++;
      }
    }

    console.log(`\n🎉 Database Seeding Completed!`);
    console.log(`✅ Newly Inserted: ${insertedCount}`);
    console.log(`🔄 Updated Entries with Category: ${updatedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}

seedDatabase();