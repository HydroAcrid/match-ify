const express = require("express");
const router = express.Router();

// Import sub-routers
const spotifyRoutes = require("./spotifyRoutes");

// Attach sub-routers
router.use("/spotify", spotifyRoutes);

// Example: if you had user routes
// const userRoutes = require("./userRoutes");
// router.use("/users", userRoutes);

// Root route
router.get("/", (req, res) => res.send("Matchify Backend API"));

module.exports = router;
