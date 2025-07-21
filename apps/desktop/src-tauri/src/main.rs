// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, Window};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct FileContent {
    path: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct AIRequest {
    message: String,
    model: String,
    context: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct AIResponse {
    response: String,
    model: String,
    tokens_used: Option<u32>,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn read_file_content(path: String) -> Result<String, String> {
    match std::fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Failed to read file {}: {}", path, e)),
    }
}

#[tauri::command]
async fn write_file_content(path: String, content: String) -> Result<(), String> {
    match std::fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file {}: {}", path, e)),
    }
}

#[tauri::command]
async fn list_directory(path: String) -> Result<Vec<String>, String> {
    match std::fs::read_dir(&path) {
        Ok(entries) => {
            let mut files = Vec::new();
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Some(name) = entry.file_name().to_str() {
                        files.push(name.to_string());
                    }
                }
            }
            Ok(files)
        }
        Err(e) => Err(format!("Failed to list directory {}: {}", path, e)),
    }
}

#[tauri::command]
async fn execute_command(command: String) -> Result<String, String> {
    use std::process::Command;
    
    let output = if cfg!(target_os = "windows") {
        Command::new("cmd")
            .args(["/C", &command])
            .output()
    } else {
        Command::new("sh")
            .arg("-c")
            .arg(&command)
            .output()
    };

    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let stderr = String::from_utf8_lossy(&output.stderr);
            
            if output.status.success() {
                Ok(stdout.to_string())
            } else {
                Err(stderr.to_string())
            }
        }
        Err(e) => Err(format!("Failed to execute command: {}", e)),
    }
}

#[tauri::command]
async fn get_system_info() -> Result<serde_json::Value, String> {
    let info = serde_json::json!({
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "home_dir": std::env::var("HOME").or_else(|_| std::env::var("USERPROFILE")).unwrap_or_default(),
        "current_dir": std::env::current_dir().map(|p| p.to_string_lossy().to_string()).unwrap_or_default()
    });
    
    Ok(info)
}

#[tauri::command]
async fn send_ai_request(request: AIRequest) -> Result<AIResponse, String> {
    // This is a placeholder for AI integration
    // In a real implementation, this would call Claude/GPT APIs
    
    let response = AIResponse {
        response: format!("Demo response to: '{}' using model: {}", request.message, request.model),
        model: request.model,
        tokens_used: Some(42),
    };
    
    Ok(response)
}

#[tauri::command]
async fn minimize_window(window: Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
async fn maximize_window(window: Window) -> Result<(), String> {
    window.maximize().map_err(|e| e.to_string())
}

#[tauri::command]
async fn close_window(window: Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            read_file_content,
            write_file_content,
            list_directory,
            execute_command,
            get_system_info,
            send_ai_request,
            minimize_window,
            maximize_window,
            close_window
        ])
        .setup(|app| {
            // Create application data directory
            let app_handle = app.handle();
            let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
            std::fs::create_dir_all(&app_dir).unwrap();
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 