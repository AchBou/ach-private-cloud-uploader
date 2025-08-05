<script lang="ts">
  import { open } from "@tauri-apps/plugin-dialog";
  import {readDir, watch} from "@tauri-apps/plugin-fs";
  import type { UnwatchFn } from "@tauri-apps/plugin-fs";
  import { onDestroy } from "svelte";
  import { uploadFile } from "$lib/functions/uploadFile.js";
  import { uploadThumbnail } from "$lib/functions/uploadThumbnail.js";


  interface FileEntry {
    name: string;
    path: string;
    isDirectory: boolean;
  }

  let selectedPath = $state("");
  let files = $state<FileEntry[]>([]);
  let isLoading = $state(false);
  let errorMessage = $state("");
  let unwatchFn: UnwatchFn | null = $state(null);
  let lastChangeDetected = $state<Date | null>(null);
  let isWatching = $state(false);
  let updateTimeout: number | null = $state(null);
  let pendingUpdates = $state(0);
  let isUploading = $state(false);
  let uploadStatus = $state<{[key: string]: string}>({});
  let uploadedFiles = $state<string[]>([]);

  async function selectFolder(): Promise<void> {
    try {
      errorMessage = "";
      isLoading = true;
      
      // Unwatch previous folder if any
      if (unwatchFn) {
        unwatchFn();
        unwatchFn = null;
      }
      
      // Reset watching state
      isWatching = false;
      lastChangeDetected = null;
      
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select a folder"
      });

      if (selected) {
        selectedPath = selected;
        await loadFiles(selected);
        
        // Set up file watcher for the selected directory
        await setupFileWatcher(selected);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errorMessage = `Error selecting folder: ${errorMsg}`;
    } finally {
      isLoading = false;
    }
  }

  async function setupFileWatcher(path: string): Promise<void> {
    try {
      // Normalize path for Windows
      const normalizedPath = path.replace(/\//g, '\\');
      
      // Set up a file watcher for the directory
      unwatchFn = await watch(normalizedPath, async (event) => {
        console.log("File system event:", event);
        
        try {
          // Update last change timestamp
          lastChangeDetected = new Date();
          
          // Determine what kind of event occurred for better error handling
          let eventType = "change";
          if (typeof event.type !== 'string' && 'create' in event.type) {
            eventType = "create";
          } else if (typeof event.type !== 'string' && 'remove' in event.type) {
            eventType = "remove";
          } else if (typeof event.type !== 'string' && 'modify' in event.type) {
            eventType = "modify";
          }
          
          console.log(`Detected ${eventType} event for:`, event.paths);
          
          // Increment pending updates counter
          pendingUpdates++;
          
          // Throttle updates to prevent excessive UI refreshes
          if (updateTimeout) {
            // Clear existing timeout if there's one
            clearTimeout(updateTimeout);
          }
          
          // Set a new timeout to update files after a delay
          updateTimeout = setTimeout(async () => {
            try {
              // Reload files when changes are detected
              await loadFiles(normalizedPath);
              console.log(`Processed ${pendingUpdates} file system events`);
            } catch (timeoutError) {
              console.error("Error in delayed file update:", timeoutError);
            } finally {
              // Reset pending updates counter
              pendingUpdates = 0;
              updateTimeout = null;
            }
          }, 500) as unknown as number; // TypeScript needs this cast for setTimeout
        } catch (eventError) {
          console.error("Error handling file system event:", eventError);
          const eventErrorMsg = eventError instanceof Error ? eventError.message : "Unknown error";
          errorMessage = `Error handling file system event: ${eventErrorMsg}`;
          // Don't stop watching on event errors
        }
      }, { 
        recursive: true, // Watch subdirectories
        delayMs: 300 // Increased debounce delay for better performance
      });
      
      // Set watching state to true
      isWatching = true;
      console.log("File watcher set up for:", normalizedPath);
    } catch (error) {
      console.error("Error setting up file watcher:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errorMessage = `Error setting up file watcher: ${errorMsg}`;
      isWatching = false;
    }
  }

  async function loadFiles(path: string): Promise<void> {
    try {
      errorMessage = "";
      isLoading = true;
      
      const normalizedPath = path.replace(/\//g, '\\');
      const entries = await readDir(normalizedPath);
      
      files = entries.map(entry => {
        //  TODO: Fix this
        // Ensure we have the full path by combining the directory path with the file name if entry.path is not available
        let entryPath = (entry as any).path ? (entry as any).path.replace(/\//g, '\\') : '';
        
        // If the path is not complete, construct it from the current directory and file name
        if (!entryPath || !entryPath.includes(':\\')) {
          entryPath = normalizedPath + '\\' + (entry.name || '');
        }
        
        return {
          name: entry.name || '',
          path: entryPath,
          isDirectory: entry.isDirectory
        };
      });
    } catch (error) {
      console.error("Error loading files:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errorMessage = `Error loading files: ${errorMsg}`;
      files = [];
    } finally {
      isLoading = false;
    }
  }

  async function navigateToDirectory(file: FileEntry): Promise<void> {
    if (file.isDirectory) {
      // Unwatch previous folder
      if (unwatchFn) {
        unwatchFn();
        unwatchFn = null;
      }
      
      // Reset watching state
      isWatching = false;
      lastChangeDetected = null;
      
      await loadFiles(file.path);
      
      // Set up new watcher for the navigated directory
      setupFileWatcher(file.path);
    }
  }
  
  // Function to upload a file
  async function handleFileUpload(file: FileEntry): Promise<void> {
    if (file.isDirectory) {
      return; // Skip directories
    }
    try {
      // Update status
      uploadStatus[file.path] = "uploading";
      isUploading = true;
      
      // Upload the file
      const fileHash = await uploadFile(file.path);
      
      // If it's an image file, also upload a thumbnail
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (imageExtensions.includes(fileExt)) {
        try {
          await uploadThumbnail(file.path, fileHash);
        } catch (thumbnailError) {
          console.error("Error uploading thumbnail:", thumbnailError);
          // Continue even if thumbnail upload fails
        }
      }
      
      // Update status
      uploadStatus[file.path] = "completed";
      uploadedFiles = [...uploadedFiles, file.path];
      
    } catch (error) {
      console.error("Error uploading file:", error);
      uploadStatus[file.path] = "failed";
      errorMessage = `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
    } finally {
      // Check if all uploads are complete
      const activeUploads = Object.values(uploadStatus).filter(status => status === "uploading");
      if (activeUploads.length === 0) {
        isUploading = false;
      }
    }
  }

  // Clean up watcher and any pending timeouts when component is destroyed
  onDestroy(() => {
    if (unwatchFn) {
      unwatchFn();
      unwatchFn = null;
      isWatching = false;
    }
    
    // Clear any pending timeouts
    if (updateTimeout) {
      clearTimeout(updateTimeout);
      updateTimeout = null;
    }
  });
</script>

<main class="container">
  <h1 class="app-title">The Horny Grail Uploader</h1>

  <div class="file-explorer">
    <div class="controls">
      <button onclick={selectFolder} class="sync-button">Sync Folder</button>
      {#if selectedPath}
        <p class="selected-path">Sync folder: {selectedPath}</p>
        {#if isWatching}
          <p class="watch-status watching">
            <span class="watch-indicator"></span> Watching for changes
            {#if lastChangeDetected}
              <span class="last-change">
                (Last change: {lastChangeDetected.toLocaleTimeString()})
                {#if pendingUpdates > 0}
                  <span class="pending-updates">{pendingUpdates} updates pending...</span>
                {/if}
              </span>
            {/if}
          </p>
        {:else}
          <p class="watch-status">Not watching</p>
        {/if}
      {/if}
    </div>

    {#if errorMessage}
      <div class="error-message">
        <p>⚠️ {errorMessage}</p>
        <button class="close-error" onclick={() => errorMessage = ""}>×</button>
      </div>
    {/if}

    <div class="file-list">
      {#if isLoading}
        <p>Loading...</p>
      {:else if files.length === 0}
        <p>No files found. Select a folder to view its contents.</p>
      {:else}
        <ul>
          {#each files as file}
            <li class="file-item">
              <button 
                onclick={() => navigateToDirectory(file)}
                class="file-button"
              >
                {file.isDirectory ? '📁' : '📄'} {file.name}
              </button>
              
              {#if !file.isDirectory}
                <button 
                  onclick={() => handleFileUpload(file)}
                  class="upload-button"
                  disabled={isUploading && uploadStatus[file.path] === "uploading"}
                >
                  {#if uploadStatus[file.path] === "uploading"}
                    Uploading...
                  {:else if uploadStatus[file.path] === "completed"}
                    ✓ Uploaded
                  {:else if uploadStatus[file.path] === "failed"}
                    ❌ Failed
                  {:else}
                    Upload
                  {/if}
                </button>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</main>

<style>
  .container {
    margin: 0 auto;
    padding: 2rem;
    max-width: 1200px;
  }

  h1 {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .app-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #3b82f6;
    text-align: center;
    margin-bottom: 1.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    letter-spacing: 1px;
    position: relative;
    padding-bottom: 0.5rem;
  }
  
  .app-title::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  }

  .file-explorer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .sync-button {
    min-width: 150px;
  }

  .selected-path {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background-color: #f5f5f5;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    max-width: 100%;
    text-align: center;
  }
  
  .watch-status {
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
    color: #666;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .watch-status.watching {
    color: #2563eb;
  }
  
  .watch-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #2563eb;
    animation: pulse 1.5s infinite;
  }
  
  .last-change {
    font-size: 0.8rem;
    color: #666;
    margin-left: 0.5rem;
  }
  
  .pending-updates {
    font-weight: bold;
    color: #f59e0b;
    margin-left: 0.5rem;
    animation: pulse-text 1s infinite;
  }
  
  @keyframes pulse-text {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }
  
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.2);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff3f3;
    border: 1px solid #ffcdd2;
    border-radius: 4px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    color: #d32f2f;
  }

  .error-message p {
    margin: 0;
    flex: 1;
  }

  .close-error {
    background: none;
    border: none;
    color: #d32f2f;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    margin-left: 0.5rem;
    line-height: 1;
  }

  .file-list {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 1rem;
    overflow-y: auto;
    background-color: #f9f9f9;
    height: 400px;
  }

  .file-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .file-list li {
    margin-bottom: 0.25rem;
  }
  
  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .file-button {
    flex: 1;
    text-align: left;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: inherit;
    font-size: inherit;
    box-shadow: none;
  }
  
  .upload-button {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    min-width: 80px;
    text-align: center;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .upload-button:hover:not(:disabled) {
    background-color: #45a049;
  }
  
  .upload-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .file-button:hover {
    background-color: #eee;
  }

  button {
    border-radius: 8px;
    border: 1px solid #ddd;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    background-color: #3b82f6;
    color: white;
    cursor: pointer;
  }

  button:hover {
    background-color: #2563eb;
  }

  @media (prefers-color-scheme: dark) {
    .file-explorer {
      background-color: #333;
      border-color: #444;
    }

    .file-list {
      background-color: #2a2a2a;
      border-color: #444;
    }

    .file-button:hover {
      background-color: #444;
    }

    .error-message {
      background-color: #3a2222;
      border-color: #5c2626;
      color: #ff6b6b;
    }

    .close-error {
      color: #ff6b6b;
    }

    .selected-path {
      color: #aaa;
      background-color: #2a2a2a;
      border-color: #444;
    }
    
    .watch-status {
      color: #888;
    }
    
    .watch-status.watching {
      color: #60a5fa;
    }
    
    .watch-indicator {
      background-color: #60a5fa;
    }
    
    .last-change {
      color: #888;
    }
    
    .pending-updates {
      color: #fbbf24;
    }

    button {
      background-color: #3b82f6;
      color: white;
      border-color: #555;
    }

    button:hover {
      background-color: #2563eb;
    }
    
    .app-title {
      color: #60a5fa;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .app-title::after {
      background: linear-gradient(90deg, transparent, #60a5fa, transparent);
    }
  }
</style>