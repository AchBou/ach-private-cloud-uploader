use dotenv::dotenv;
use std::env;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    dotenv().ok(); // Load .env

    let access_key = env::var("AWS_ACCESS_KEY_ID").expect("AWS key not set");
    let secret_key = env::var("AWS_SECRET_ACCESS_KEY").expect("AWS secret not set");

    println!("Access Key: {}", access_key);
    println!("AWS_SECRET_ACCESS_KEY:{}", secret_key);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
