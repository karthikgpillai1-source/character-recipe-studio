use rusqlite::{params, Connection, Result as SqlResult};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

use crate::models::RecipeRecord;

pub struct Database {
    pub conn: Connection,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> Result<Self, String> {
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .map_err(|_| "Failed to resolve app data directory")?;

        if !app_dir.exists() {
            fs::create_dir_all(&app_dir).map_err(|e| format!("Failed to create app dir: {}", e))?;
        }

        let db_path: PathBuf = app_dir.join("recipes.db");
        let conn = Connection::open(db_path).map_err(|e| format!("Failed to open db: {}", e))?;

        let db = Self { conn };
        db.init()
            .map_err(|e| format!("Failed to initialize db: {}", e))?;

        Ok(db)
    }

    fn init(&self) -> SqlResult<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS recipes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;
        Ok(())
    }

    pub fn save_recipe(&self, record: RecipeRecord) -> Result<(), String> {
        self.conn
            .execute(
                "INSERT INTO recipes (id, name, data, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5)
                 ON CONFLICT(id) DO UPDATE SET
                 name = excluded.name,
                 data = excluded.data,
                 updated_at = CURRENT_TIMESTAMP",
                params![
                    record.id,
                    record.name,
                    record.data,
                    record.created_at,
                    record.updated_at
                ],
            )
            .map_err(|e| format!("Failed to save recipe: {}", e))?;
        Ok(())
    }

    pub fn get_recipes(&self) -> Result<Vec<RecipeRecord>, String> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, name, data, created_at, updated_at FROM recipes ORDER BY updated_at DESC")
            .map_err(|e| e.to_string())?;

        let recipe_iter = stmt
            .query_map([], |row| {
                Ok(RecipeRecord {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    data: row.get(2)?,
                    created_at: row.get(3)?,
                    updated_at: row.get(4)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut recipes = Vec::new();
        for recipe in recipe_iter {
            if let Ok(r) = recipe {
                recipes.push(r);
            }
        }

        Ok(recipes)
    }

    pub fn delete_recipe(&self, id: &str) -> Result<(), String> {
        self.conn
            .execute("DELETE FROM recipes WHERE id = ?1", params![id])
            .map_err(|e| format!("Failed to delete recipe: {}", e))?;
        Ok(())
    }
}
