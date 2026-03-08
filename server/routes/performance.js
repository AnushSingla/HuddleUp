const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middleware/auth");
const { getQueryStats, resetQueryStats } = require("../middleware/queryMonitor");
const mongoose = require("mongoose");

router.get("/query-stats", verifyToken, isAdmin, (req, res) => {
  try {
    const stats = getQueryStats();
    res.json({
      success: true,
      stats,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching query stats",
      error: error.message,
    });
  }
});

router.post("/query-stats/reset", verifyToken, isAdmin, (req, res) => {
  try {
    resetQueryStats();
    res.json({
      success: true,
      message: "Query stats reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting query stats",
      error: error.message,
    });
  }
});

router.get("/db-stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    const collections = await db.listCollections().toArray();
    const collectionStats = await Promise.all(
      collections.map(async (col) => {
        const colStats = await db.collection(col.name).stats();
        return {
          name: col.name,
          count: colStats.count,
          size: colStats.size,
          avgObjSize: colStats.avgObjSize,
          storageSize: colStats.storageSize,
          indexes: colStats.nindexes,
          totalIndexSize: colStats.totalIndexSize,
        };
      })
    );

    res.json({
      success: true,
      database: {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
      },
      collections: collectionStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching database stats",
      error: error.message,
    });
  }
});

router.get("/connection-pool", verifyToken, isAdmin, (req, res) => {
  try {
    const poolStats = {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };

    res.json({
      success: true,
      pool: poolStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching connection pool stats",
      error: error.message,
    });
  }
});

module.exports = router;
