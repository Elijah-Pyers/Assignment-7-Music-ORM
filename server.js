/**
 * - Starts a web server on http://localhost:3000 
 * - Connects to SQLite via Sequelize (from setup.js).
 * - Defines CRUD routes for tracks.
 */

const express = require("express");
require("dotenv").config(); // loads PORT and DB vars from .env
const { db, Track } = require("./database/setup"); // our DB connection + model

const app = express();
const PORT = process.env.PORT || 3000;

// This lets Express read JSON bodies (so POST/PUT can send JSON)
app.use(express.json());

// Tiny request logger so you can see every request path
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//  Health route 
app.get("/", (req, res) => {
  res.json({ ok: true, service: "Music ORM API" });
});

//  sanity-check DB connection on boot
(async () => {
  try {
    await db.authenticate();
    console.log(" DB connection OK (server boot).");
  } catch (e) {
    console.error(" DB connection failed:", e);
  }
})();

/**
 * CRUD ROUTES FOR TRACKS
 * NOTE: We use our Sequelize model "Track" to talk to the DB.
 */

// GET /api/tracks  -> return all tracks
app.get("/api/tracks", async (req, res) => {
  try {
    const tracks = await Track.findAll();
    res.json(tracks); // returns an array (could be empty)
  } catch (err) {
    console.error("GET /api/tracks error:", err);
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

// GET /api/tracks/:id  -> return a single track by primary key (trackId)
app.get("/api/tracks/:id", async (req, res) => {
  try {
    const track = await Track.findByPk(req.params.id);
    if (!track) return res.status(404).json({ error: "Track not found" });
    res.json(track);
  } catch (err) {
    console.error("GET /api/tracks/:id error:", err);
    res.status(500).json({ error: "Failed to fetch track" });
  }
});

// POST /api/tracks  -> create a new track
app.post("/api/tracks", async (req, res) => {
  try {
    // Pull fields from the request body (the JSON you send)
    const { songTitle, artistName, albumName, genre, duration, releaseYear } = req.body;

    // Basic validation
    if (!songTitle || !artistName || !albumName || !genre) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "songTitle, artistName, albumName, and genre are required"
      });
    }

    // Create in DB and return the newly created row
    const newTrack = await Track.create({
      songTitle, artistName, albumName, genre, duration, releaseYear
    });

    res.status(201).json(newTrack);
  } catch (err) {
    console.error("POST /api/tracks error:", err);
    res.status(500).json({ error: "Failed to create track" });
  }
});

// PUT /api/tracks/:id  -> update an existing track by id
app.put("/api/tracks/:id", async (req, res) => {
  try {
    const { songTitle, artistName, albumName, genre, duration, releaseYear } = req.body;

    // Update returns [numberOfUpdatedRows]. If 0, nothing matched that id.
    const [updated] = await Track.update(
      { songTitle, artistName, albumName, genre, duration, releaseYear },
      { where: { trackId: req.params.id } }
    );

    if (updated === 0) {
      return res.status(404).json({ error: "Track not found" });
    }

    // Fetch the updated row so we can show the client the current data
    const updatedTrack = await Track.findByPk(req.params.id);
    res.json(updatedTrack);
  } catch (err) {
    console.error("PUT /api/tracks/:id error:", err);
    res.status(500).json({ error: "Failed to update track" });
  }
});

// DELETE /api/tracks/:id  -> delete a track by id
app.delete("/api/tracks/:id", async (req, res) => {
  try {
    const deleted = await Track.destroy({ where: { trackId: req.params.id } });
    if (deleted === 0) {
      return res.status(404).json({ error: "Track not found" });
    }
    res.json({ message: "Track deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/tracks/:id error:", err);
    res.status(500).json({ error: "Failed to delete track" });
  }
});

// START THE SERVER 
app.listen(PORT, () => {
  console.log(` Music ORM API listening at http://localhost:${PORT}`);
});
