pub mod db;
pub mod models;

use db::Database;
use models::RecipeRecord;
use std::sync::Mutex;
use tauri::{Manager, State};

struct AppState {
    db: Mutex<Database>,
}

#[tauri::command]
fn save_recipe(state: State<AppState>, record: RecipeRecord) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Failed to lock database")?;
    db.save_recipe(record)
}

#[tauri::command]
fn get_recipes(state: State<AppState>) -> Result<Vec<RecipeRecord>, String> {
    let db = state.db.lock().map_err(|_| "Failed to lock database")?;
    db.get_recipes()
}

#[tauri::command]
fn delete_recipe(state: State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|_| "Failed to lock database")?;
    db.delete_recipe(&id)
}
#[tauri::command]
fn get_app_data_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    app_handle.path().app_data_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let db = Database::new(app.handle()).map_err(|e| {
                Box::new(std::io::Error::new(std::io::ErrorKind::Other, e))
                    as Box<dyn std::error::Error>
            })?;
            app.manage(AppState { db: Mutex::new(db) });
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_recipe, get_recipes, delete_recipe, get_app_data_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
