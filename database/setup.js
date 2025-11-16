/**
 * - Creates a SQLite DB file (database/music_library.db).
 * - Connects with Sequelize (ORM: helps us avoid raw SQL).
 * - Defines a Track model (table "Tracks").
 * - Syncs (creates tables).
 */

const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Make sure the "database" folder exists
const dbFolder = __dirname;
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder, { recursive: true });
}

// Create a Sequelize connection to a local SQLite file.
// 
const db = new Sequelize({
  dialect: process.env.DB_TYPE || "sqlite",
  storage: path.join(__dirname, process.env.DB_NAME || "music_library.db"),
  logging: console.log // shows the SQL it runs; helpful while learning
});

// Define a "Track" model 
// 
const Track = db.define("Track", {
  // PRIMARY KEY column: integer, auto-increment
  trackId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // IMPORTANT required fields (NOT NULL)
  songTitle: { type: DataTypes.STRING, allowNull: false },
  artistName: { type: DataTypes.STRING, allowNull: false },
  albumName: { type: DataTypes.STRING, allowNull: false },
  genre: { type: DataTypes.STRING, allowNull: false },

  // OPTIONAL fields
  duration: { type: DataTypes.INTEGER, allowNull: true },   // seconds
  releaseYear: { type: DataTypes.INTEGER, allowNull: true } // e.g., 2003
});

/**
 * This function:
 * 1) Connects to the DB.
 * 2) Syncs models (creates tables). force:true = drop + recreate (dev only!)
 * 3) Closes the DB.
 */
async function setupDatabase() {
  try {
    await db.authenticate();
    console.log(" Connected to SQLite database (setup step).");

    
    await db.sync({ force: true });
    console.log(" Tables created/synced:", db.options.storage);
  } catch (err) {
    console.error(" SETUP ERROR:", err);
  } finally {
    await db.close();
    console.log("ℹ  Database connection closed (setup done).");
  }
}

// 
if (require.main === module) {
  setupDatabase();
}

// Export the db connection + model so other files (server, seed) can use them
module.exports = { db, Track };
