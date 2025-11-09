require("dotenv").config();
var express = require("express");
var router = express.Router();

// Database configuration - supports both PostgreSQL and SQLite
const DB_TYPE = process.env.DB_TYPE || "postgresql";

let db;
if (DB_TYPE === "postgresql") {
  const { Pool } = require("pg");
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  console.log("Using PostgreSQL database");
} else {
  const sqlite3 = require("sqlite3").verbose();
  const path = require("path");
  const dbPath = process.env.SQLITE_PATH || "./recipe.sqlite";
  console.log("Using SQLite database at:", dbPath);
}

/* GET recipe search */
router.get("/", async function (req, res, next) {
  try {
    if (Object.keys(req.query).length === 0) {
      return res.status(400).json({
        error: "No query parameter provided. Use ?q=searchterm",
      });
    }

    const searchQuery = req.query.q;

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({
        error: "Query parameter 'q' cannot be empty",
      });
    }

    if (DB_TYPE === "postgresql") {
      // PostgreSQL query
      const result = await db.query(
        `SELECT id, "RecipeName", "TranslatedRecipeName", 
                "Ingredients", "TranslatedIngredients",
                "PrepTimeInMins", "CookTimeInMins", "TotalTimeInMins",
                "Servings", "Cuisine", "Course", "Diet",
                "Instructions", "TranslatedInstructions",
                "URL", "ImageURL", created_at
         FROM recipes 
         WHERE LOWER("RecipeName") LIKE LOWER($1) 
         OR LOWER("TranslatedRecipeName") LIKE LOWER($1)
         ORDER BY "RecipeName" 
         LIMIT 100`,
        [`%${searchQuery}%`]
      );
      res.json(result.rows);
    } else {
      // SQLite query (fallback)
      const sqlite3 = require("sqlite3").verbose();
      const path = require("path");
      const sqliteDb = new sqlite3.Database(
        path.resolve(__dirname, "../recipe.sqlite")
      );

      const SQLquery = `SELECT * FROM recipe WHERE RecipeName LIKE '%${searchQuery}%' LIMIT 100`;

      sqliteDb.all(SQLquery, [], (err, rows) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
      });

      sqliteDb.close();
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Database error",
      message: error.message,
    });
  }
});

module.exports = router;
