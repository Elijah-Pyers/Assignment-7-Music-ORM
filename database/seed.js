// database/seed.js  (CommonJS)
const { db, Track } = require('./setup');

const sampleTracks = [
  { songTitle: "Everlong", artistName: "Foo Fighters", albumName: "The Colour and the Shape", genre: "Rock", duration: 250, releaseYear: 1997 },
  { songTitle: "Lose Yourself", artistName: "Eminem", albumName: "8 Mile", genre: "Hip-Hop", duration: 326, releaseYear: 2002 },
  { songTitle: "Viva La Vida", artistName: "Coldplay", albumName: "Viva La Vida or Death and All His Friends", genre: "Alternative", duration: 242, releaseYear: 2008 }
];

async function seedDatabase() {
  try {
    await db.authenticate();
    console.log(' Connected for seeding.');
    await Track.bulkCreate(sampleTracks);
    console.log(' Inserted sample tracks.');
    console.log('ℹ  Total rows:', await Track.count());
  } catch (err) {
    console.error(' SEED ERROR:', err);
  } finally {
    await db.close();
    console.log('ℹ  DB closed (seed done).');
  }
}

// Only run when you execute this file directly: node database/seed.js
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
