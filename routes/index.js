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

/* GET all recipes with pagination */
router.get("/recipes", async function (req, res, next) {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        error: "Page number must be greater than 0",
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Limit must be between 1 and 100",
      });
    }

    if (DB_TYPE === "postgresql") {
      // Get total count
      const countResult = await db.query("SELECT COUNT(*) FROM recipes");
      const totalRecipes = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalRecipes / limit);

      // Get recipes for current page
      const result = await db.query(
        `SELECT id, "RecipeName", "TranslatedRecipeName", 
                "Ingredients", "TranslatedIngredients",
                "PrepTimeInMins", "CookTimeInMins", "TotalTimeInMins",
                "Servings", "Cuisine", "Course", "Diet",
                "Instructions", "TranslatedInstructions",
                "URL", "ImageURL", created_at
         FROM recipes 
         ORDER BY "RecipeName" 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      res.json({
        page: page,
        limit: limit,
        totalRecipes: totalRecipes,
        totalPages: totalPages,
        recipes: result.rows,
      });
    } else {
      // SQLite query (fallback)
      const sqlite3 = require("sqlite3").verbose();
      const path = require("path");
      const sqliteDb = new sqlite3.Database(
        path.resolve(__dirname, "../recipe.sqlite")
      );

      // Get total count
      sqliteDb.get("SELECT COUNT(*) as count FROM recipe", [], (err, row) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: "Database error" });
        }

        const totalRecipes = row.count;
        const totalPages = Math.ceil(totalRecipes / limit);

        // Get recipes for current page
        const SQLquery = `SELECT * FROM recipe ORDER BY RecipeName LIMIT ${limit} OFFSET ${offset}`;

        sqliteDb.all(SQLquery, [], (err, rows) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({
            page: page,
            limit: limit,
            totalRecipes: totalRecipes,
            totalPages: totalPages,
            recipes: rows,
          });
        });

        sqliteDb.close();
      });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Database error",
      message: error.message,
    });
  }
});

/* GET recipe search with pagination */
router.get("/", async function (req, res, next) {
  try {
    if (Object.keys(req.query).length === 0) {
      return res.status(400).json({
        error:
          "No query parameter provided. Use ?q=searchterm or /recipes for all recipes",
      });
    }

    const searchQuery = req.query.q;

    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({
        error: "Query parameter 'q' cannot be empty",
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        error: "Page number must be greater than 0",
      });
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Limit must be between 1 and 100",
      });
    }

    if (DB_TYPE === "postgresql") {
      // Get total count of search results
      const countResult = await db.query(
        `SELECT COUNT(*) FROM recipes 
         WHERE LOWER("RecipeName") LIKE LOWER($1) 
         OR LOWER("TranslatedRecipeName") LIKE LOWER($1)`,
        [`%${searchQuery}%`]
      );
      const totalRecipes = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalRecipes / limit);

      // PostgreSQL query with pagination
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
         LIMIT $2 OFFSET $3`,
        [`%${searchQuery}%`, limit, offset]
      );

      res.json({
        page: page,
        limit: limit,
        totalRecipes: totalRecipes,
        totalPages: totalPages,
        searchQuery: searchQuery,
        recipes: result.rows,
      });
    } else {
      // SQLite query (fallback)
      const sqlite3 = require("sqlite3").verbose();
      const path = require("path");
      const sqliteDb = new sqlite3.Database(
        path.resolve(__dirname, "../recipe.sqlite")
      );

      // Get total count of search results
      const countQuery = `SELECT COUNT(*) as count FROM recipe WHERE RecipeName LIKE '%${searchQuery}%'`;

      sqliteDb.get(countQuery, [], (err, row) => {
        if (err) {
          console.error(err.message);
          return res.status(500).json({ error: "Database error" });
        }

        const totalRecipes = row.count;
        const totalPages = Math.ceil(totalRecipes / limit);

        // Get recipes for current page
        const SQLquery = `SELECT * FROM recipe WHERE RecipeName LIKE '%${searchQuery}%' ORDER BY RecipeName LIMIT ${limit} OFFSET ${offset}`;

        sqliteDb.all(SQLquery, [], (err, rows) => {
          if (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Database error" });
          }

          res.json({
            page: page,
            limit: limit,
            totalRecipes: totalRecipes,
            totalPages: totalPages,
            searchQuery: searchQuery,
            recipes: rows,
          });
        });

        sqliteDb.close();
      });
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
