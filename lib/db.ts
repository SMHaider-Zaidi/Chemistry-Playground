import dotenv from "dotenv";
import path from "path";
import { Sequelize, DataTypes, Model, Optional } from "sequelize";

// Load environment variables from .env.local before Sequelize initialization
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Initialize Sequelize connection using our root environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || "chemistry_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: false, // Disables distracting SQL log outputs in your command terminal
  }
);

// ==========================================
// 1. MOLECULE MODEL
// ==========================================
export interface MoleculeAttributes {
  id: number;
  molecule: string;      // Name of the compound (e.g., "methane")
  formula: string;       // Chemical formula (e.g., "CH4")
  category: string;      // "basic", "organic", "inorganic", or "biomolecules"
  description: string;   // Brief description for the textbook cards
  atoms: object;         // Stores the array of atomic positions as JSON
  bonds: object;         // Stores the array of bond links as JSON
}

interface MoleculeCreationAttributes extends Optional<MoleculeAttributes, "id"> {}

export class Molecule extends Model<MoleculeAttributes, MoleculeCreationAttributes> implements MoleculeAttributes {
  declare public id: number;
  declare public molecule: string;
  declare public formula: string;
  declare public category: string;
  declare public description: string;
  declare public atoms: object;
  declare public bonds: object;
}

// Register only if the model is not already registered on this sequelize instance
if (!sequelize.models.Molecule) {
  Molecule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      molecule: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "idx_unique_molecule",
      },
      formula: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "basic",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      atoms: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      bonds: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Molecule",
      tableName: "molecules",
      timestamps: true,
    }
  );
}

// ==========================================
// 2. USER MODEL
// ==========================================
export interface UserAttributes {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  institution: string; // School or College Name
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "resetToken" | "resetTokenExpiry"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare public id: number;
  declare public email: string;
  declare public passwordHash: string;
  declare public name: string;
  declare public institution: string;
  declare public resetToken: string | null;
  declare public resetTokenExpiry: Date | null;
  declare public readonly createdAt: Date;
  declare public readonly updatedAt: Date;
}

if (!sequelize.models.User) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "idx_unique_user_email",
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      institution: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );
}

// ==========================================
// 3. REACTION MODEL (For 3D simulator)
// ==========================================
export interface ReactionAttributes {
  id: number;
  name: string;
  category: string;  // "organic" or "inorganic"
  description: string;
  reactants: object; // Stores JSON: Array<{ molecule: string, coefficient: number }>
  products: object;  // Stores JSON: Array<{ molecule: string, coefficient: number }>
}

interface ReactionCreationAttributes extends Optional<ReactionAttributes, "id" | "category"> {}

export class Reaction extends Model<ReactionAttributes, ReactionCreationAttributes> implements ReactionAttributes {
  declare public id: number;
  declare public name: string;
  declare public category: string;
  declare public description: string;
  declare public reactants: object;
  declare public products: object;
}

if (!sequelize.models.Reaction) {
  Reaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: "idx_unique_reaction_name",
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "inorganic", // Default category ("organic" | "inorganic")
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reactants: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      products: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Reaction",
      tableName: "reactions",
      timestamps: true,
    }
  );
}

// ==========================================
// DATABASE ASSOCIATION & SYNC
// ==========================================
let syncPromise: Promise<void> | null = null;

export async function ensureDbSynced(): Promise<void> {
  if (!syncPromise) {
    syncPromise = sequelize
      .sync({ alter: true }) // Adjusts table schemas to match our definitions automatically
      .then(() => {
        console.log("MySQL Database synced successfully via Sequelize!");
      })
      .catch((err) => {
        syncPromise = null;
        console.error("Sequelize sync failed:", err);
        throw err;
      });
  }

  return syncPromise;
}

// Start schema sync immediately when this module loads
void ensureDbSynced();

// Clean exports
export { sequelize };