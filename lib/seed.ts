import dotenv from 'dotenv';
import path from 'path';

// Load .env.local from project root before importing db connection
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import fs from 'fs';
import { Molecule, Reaction, Chapter, Question, sequelize } from './db';

// Helper to safely resolve and parse JSON files from src/data/
function loadJsonData<T>(fileName: string): T {
  const filePath = path.join(process.cwd(), 'src', 'data', fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found at: ${filePath}`);
  }
  const rawData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(rawData) as T;
}

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.\n');

    // ==========================================
    // 1. SEED MOLECULES (Reactions3D_Details.json)
    // ==========================================
    console.log('📦 Seeding Molecules...');
    const moleculesData = loadJsonData<any[]>('Reactions3D_Details.json');
    let molInserted = 0;
    let molUpdated = 0;

    for (const mol of moleculesData) {
      const existing = await Molecule.findOne({ where: { molecule: mol.molecule } });
      const payload = {
        molecule: mol.molecule,
        formula: mol.formula,
        category: mol.category || 'basic',
        description: mol.description || null,
        atoms: mol.atoms,
        bonds: mol.bonds,
      };

      if (existing) {
        await existing.update(payload);
        molUpdated++;
      } else {
        await Molecule.create(payload);
        molInserted++;
      }
    }
    console.log(`✅ Molecules: ${molInserted} inserted, ${molUpdated} updated.`);

    // ==========================================
    // 2. SEED REACTIONS (Reactions.json)
    // ==========================================
    console.log('🧪 Seeding Reactions...');
    const reactionsData = loadJsonData<any[]>('Reactions.json');
    let rxnInserted = 0;
    let rxnUpdated = 0;

    for (const item of reactionsData) {
      const reactants = (item.reactants || []).map((r: any) => ({
        molecule: String(r.molecule || r.name || '').trim(),
        coefficient: Number(r.coefficient) || 1,
      }));

      const products = (item.products || []).map((p: any) => ({
        molecule: String(p.molecule || p.name || '').trim(),
        coefficient: Number(p.coefficient) || 1,
      }));

      const category = String(item.category || 'inorganic').toLowerCase().trim();
      const reactionName = String(item.name || item.equation || `Reaction ${rxnInserted + 1}`).trim();
      
      const description = item.conditions && item.conditions !== 'None' 
        ? `Conditions: ${item.conditions}` 
        : `Reaction of ${reactants.map((r: any) => r.molecule).filter(Boolean).join(' and ')}`;

      const existing = await Reaction.findOne({ where: { name: reactionName } });
      const payload = {
        name: reactionName,
        category: category,
        description: description,
        reactants: reactants,
        products: products,
      };

      if (existing) {
        await existing.update(payload);
        rxnUpdated++;
      } else {
        await Reaction.create(payload);
        rxnInserted++;
      }
    }
    console.log(`✅ Reactions: ${rxnInserted} inserted, ${rxnUpdated} updated.`);

    // ==========================================
    // 3. SEED QUIZZES (Quizzes.json)
    // ==========================================
    console.log('📚 Seeding Chapters & Questions...');
    const quizzesData = loadJsonData<any[]>('Quizzes.json');
    let chaptersProcessed = 0;
    let qInserted = 0;
    let qUpdated = 0;

    for (const chapterData of quizzesData) {
      const [chapter] = await Chapter.findOrCreate({
        where: {
          class: chapterData.class_level,
          chapterNumber: chapterData.chapter_number,
        },
        defaults: {
          class: chapterData.class_level,
          chapterNumber: chapterData.chapter_number,
          chapterTitle: chapterData.chapter_title,
        },
      });

      if (chapter.chapterTitle !== chapterData.chapter_title) {
        await chapter.update({ chapterTitle: chapterData.chapter_title });
      }
      chaptersProcessed++;

      if (Array.isArray(chapterData.questions)) {
        for (const q of chapterData.questions) {
          let correctOption = String(q.correct_option).trim().toUpperCase();
          if (correctOption.startsWith('OPTION_')) {
            correctOption = correctOption.replace('OPTION_', '');
          }

          const existingQuestion = await Question.findOne({
            where: {
              chapterId: chapter.id,
              questionText: q.question,
            },
          });

          const qPayload = {
            chapterId: chapter.id,
            questionText: q.question,
            optionA: q.option_a,
            optionB: q.option_b,
            optionC: q.option_c,
            optionD: q.option_d,
            correctOption: correctOption as 'A' | 'B' | 'C' | 'D',
            explanation: q.explanation || null,
            difficulty: q.difficulty || 'medium',
            topic: q.topic || null,
          };

          if (existingQuestion) {
            await existingQuestion.update(qPayload);
            qUpdated++;
          } else {
            await Question.create(qPayload);
            qInserted++;
          }
        }
      }
    }
    console.log(`✅ Quizzes: ${chaptersProcessed} Chapters processed, ${qInserted} Questions inserted, ${qUpdated} Questions updated.`);

    console.log(`\n🎉 Database Seeding Completed Successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}

seedDatabase();