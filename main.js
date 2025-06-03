const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let chatWindow;

// Chat window state management
const stateFilePath = path.join(app.getPath('userData'), 'chat-window-state.json');

// Add shared state management
let sharedState = {
    selectedFiles: [],
    selectedFolder: null,
    delayTime: 0,
    processingStatus: null
};

function broadcastStateToWindows(state) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('state-sync', state);
    }
    if (chatWindow && !chatWindow.isDestroyed()) {
        chatWindow.webContents.send('state-sync', state);
    }
}

function updateSharedState(updates) {
    sharedState = { ...sharedState, ...updates };
    broadcastStateToWindows(sharedState);
}

function saveChatWindowState(isOpen) {
    try {
        const state = { chatWindowOpen: isOpen };
        fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
    } catch (error) {
        console.error('Error saving chat window state:', error);
    }
}

function loadChatWindowState() {
    try {
        if (fs.existsSync(stateFilePath)) {
            const state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
            return state.chatWindowOpen || false;
        }
    } catch (error) {
        console.error('Error loading chat window state:', error);
    }
    return false;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        title: 'Subtitle Adjuster',
        width: 600,
        height: 600,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: true
        },
        icon: path.join(__dirname, 'build/icon.ico')
    });

    // Remove default menu
    Menu.setApplicationMenu(null);

    mainWindow.loadFile('index.html');
    
    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Handle drag and drop
    mainWindow.webContents.on('will-navigate', (event, url) => {
        event.preventDefault();
    });

    // Add F12 support for DevTools
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12') {
            mainWindow.webContents.toggleDevTools();
            event.preventDefault();
        }
    });

    // Close all windows when main window is closed
    mainWindow.on('closed', () => {
        if (chatWindow) {
            chatWindow.removeAllListeners();
            chatWindow.close();
        }
        app.quit();
    });

    // Restore chat window state after main window loads
    mainWindow.webContents.on('did-finish-load', () => {
        // Process command line argument if present
        const isDev = !app.isPackaged;
        const argPath = isDev ? process.argv[2] : process.argv[1];
        if (argPath) {
            console.log('argPath', argPath);
            processPath(argPath).then(result => {
                if (result) {
                    mainWindow.webContents.send('command-line-path', result);
                }
            });
        }

        // Restore chat window if it was previously open
        const shouldOpenChat = loadChatWindowState();
        if (shouldOpenChat) {
            // Delay opening to ensure main window is fully ready
            setTimeout(() => {
                openChatWindow();
            }, 500);
        }
    });

    // Add chat button handler
    ipcMain.handle('toggle-chat', () => {
        toggleChatWindow();
    });

    // Add handler to get current chat state
    ipcMain.handle('get-chat-state', () => {
        return chatWindow && !chatWindow.isDestroyed();
    });

    // Add handler to get app version
    ipcMain.handle('get-app-version', () => {
        return app.getVersion();
    });
}

function openChatWindow() {
    if (chatWindow) {
        chatWindow.focus();
        return;
    }

    // Get main window bounds
    const mainBounds = mainWindow.getBounds();
    const chatWidth = Math.floor(mainBounds.width * 4/5);
    const chatHeight = mainBounds.height;
    const chatX = mainBounds.x + mainBounds.width;
    const chatY = mainBounds.y;

    chatWindow = new BrowserWindow({
        title: 'AI Chat',
        width: chatWidth,
        height: chatHeight,
        x: chatX,
        y: chatY,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: true,
            experimentalFeatures: true
        },
        icon: path.join(__dirname, 'build/icon.ico')
    });

    chatWindow.loadFile('chat.html');

    // Save state that chat window is open
    saveChatWindowState(true);

    // Notify renderer that chat window is now open
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('chat-state-changed', true);
    }

    // Add F12 support for DevTools in chat window
    chatWindow.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F12') {
            chatWindow.webContents.toggleDevTools();
            event.preventDefault();
        }
    });

    // Update chat window position when main window moves
    const moveHandler = () => {
        if (chatWindow && !chatWindow.isDestroyed()) {
            const newBounds = mainWindow.getBounds();
            chatWindow.setBounds({
                x: newBounds.x + newBounds.width,
                y: newBounds.y,
                width: chatWidth,
                height: chatHeight
            });
        }
    };
    mainWindow.on('move', moveHandler);

    // Keep windows together when either is focused
    const mainFocusHandler = () => {
        if (chatWindow && !chatWindow.isDestroyed()) {
            chatWindow.moveTop();
        }
    };
    mainWindow.on('focus', mainFocusHandler);

    const chatFocusHandler = () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.moveTop();
        }
    };
    chatWindow.on('focus', chatFocusHandler);

    chatWindow.on('closed', () => {
        // Save state that chat window is closed
        saveChatWindowState(false);
        
        // Notify renderer that chat window is now closed
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('chat-state-changed', false);
        }
        
        // Remove all event listeners
        mainWindow.removeListener('move', moveHandler);
        mainWindow.removeListener('focus', mainFocusHandler);
        chatWindow.removeListener('focus', chatFocusHandler);
        chatWindow = null;
    });
}

function toggleChatWindow() {
    if (chatWindow && !chatWindow.isDestroyed()) {
        // Chat window is open, close it
        chatWindow.close();
    } else {
        // Chat window is closed, open it
        openChatWindow();
    }
}

// Function to process a path from command line
async function processPath(filePath) {
    try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            const files = fs.readdirSync(filePath)
                .filter(file => file.toLowerCase().endsWith('.ass') || file.toLowerCase().endsWith('.srt'))
                .map(file => path.join(filePath, file));
            return { 
                path: filePath, 
                assCount: files.length,
                files: files 
            };
        } else if (filePath.toLowerCase().endsWith('.ass') || filePath.toLowerCase().endsWith('.srt')) {
            return {
                success: true,
                paths: [filePath],
                fileCount: 1
            };
        }
    } catch (error) {
        console.error('Error processing command line path:', error);
    }
    return null;
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle file/folder selection
ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'Subtitle Files', extensions: ['ass', 'srt'] }]
    });
    
    if (result.filePaths && result.filePaths.length > 0) {
        updateSharedState({
            selectedFiles: result.filePaths,
            selectedFolder: null
        });
    }
    
    return result.filePaths;
});

// Handle file selection for chat interface
ipcMain.handle('select-files', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: options?.filters || [{ name: 'Subtitle Files', extensions: ['ass', 'srt'] }]
    });
    
    if (result.filePaths && result.filePaths.length > 0) {
        updateSharedState({
            selectedFiles: result.filePaths,
            selectedFolder: null
        });
    }
    
    return result.filePaths;
});

ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.filePaths[0]) {
        // Scan for subtitle files in the folder
        const folderPath = result.filePaths[0];
        try {
            const files = fs.readdirSync(folderPath)
                .filter(file => file.toLowerCase().endsWith('.ass') || file.toLowerCase().endsWith('.srt'))
                .map(file => path.join(folderPath, file));
            
            updateSharedState({
                selectedFiles: files,
                selectedFolder: folderPath
            });
            
            // Return in format expected by main window
            return {
                path: folderPath,
                files: files,
                assCount: files.length
            };
        } catch (error) {
            console.error('Error scanning folder:', error);
            return result.filePaths[0]; // Fallback to old format
        }
    }
    return null;
});

// Handle dropped files/folders
ipcMain.handle('handle-drop', async (event, filePaths) => {
    console.log('Received drop paths:', filePaths);
    try {
        if (!Array.isArray(filePaths)) {
            filePaths = [filePaths];
        }

        const validFiles = [];

        for (const filePath of filePaths) {
            if (!filePath || typeof filePath !== 'string') {
                continue;
            }

            try {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    const files = fs.readdirSync(filePath)
                        .filter(file => file.toLowerCase().endsWith('.ass') || file.toLowerCase().endsWith('.srt'))
                        .map(file => path.join(filePath, file));
                    validFiles.push(...files);
                } else if (filePath.toLowerCase().endsWith('.ass') || filePath.toLowerCase().endsWith('.srt')) {
                    validFiles.push(filePath);
                }
            } catch (error) {
                console.error(`Error processing ${filePath}:`, error);
            }
        }

        if (validFiles.length === 0) {
            return { 
                success: false, 
                message: 'No valid subtitle files found'
            };
        }

        // Update shared state
        updateSharedState({
            selectedFiles: validFiles,
            selectedFolder: null
        });

        return { 
            success: true, 
            paths: validFiles,
            fileCount: validFiles.length
        };
    } catch (error) {
        console.error('Error in handle-drop:', error);
        return { success: false, message: `Error: ${error.message}` };
    }
});

// Handle file processing for chat interface
ipcMain.handle('process-subtitles', async (event, { files, folder, delayMs, paths, adjustment }) => {
    try {
        // Set processing status
        updateSharedState({ processingStatus: 'processing' });
        
        let filesToProcess = [];
        let adjustmentToUse = delayMs || adjustment || 0;
        
        // Handle different input formats for compatibility
        if (files && files.length > 0) {
            filesToProcess = files;
        } else if (paths && paths.length > 0) {
            filesToProcess = paths;
        }
        
        // If folder is provided, scan for subtitle files
        if (folder) {
            const folderFiles = fs.readdirSync(folder)
                .filter(file => file.toLowerCase().endsWith('.ass') || file.toLowerCase().endsWith('.srt'))
                .map(file => path.join(folder, file));
            filesToProcess.push(...folderFiles);
        }
        
        if (filesToProcess.length === 0) {
            updateSharedState({ processingStatus: null });
            throw new Error('No subtitle files found to process');
        }
        
        // Process each file
        for (const file of filesToProcess) {
            await processSubtitleFile(file, adjustmentToUse);
        }
        
        // Format timing information for the message
        const timingInfo = formatTimingAdjustment(adjustmentToUse);
        
        // Reset state after successful processing
        updateSharedState({ 
            processingStatus: 'completed',
            delayTime: 0,
            lastProcessingResult: {
                processedCount: filesToProcess.length,
                timingInfo: timingInfo
            }
        });
        
        // Clear processing status after a short delay
        setTimeout(() => {
            updateSharedState({ processingStatus: null });
        }, 2000);
        
        return { 
            success: true, 
            processedCount: filesToProcess.length,
            adjustmentMs: adjustmentToUse,
            timingInfo: timingInfo,
            message: `${filesToProcess.length} file${filesToProcess.length !== 1 ? 's' : ''} processed successfully - ${timingInfo}`
        };
    } catch (error) {
        updateSharedState({ processingStatus: 'error' });
        setTimeout(() => {
            updateSharedState({ processingStatus: null });
        }, 3000);
        throw new Error(`Processing failed: ${error.message}`);
    }
});

// Function to convert time string to milliseconds
function timeToMs(timeStr, format) {
    if (format === 'srt') {
        const [time, milliseconds] = timeStr.split(',');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (hours * 3600 + minutes * 60 + seconds) * 1000 + parseInt(milliseconds);
    } else { // ass format
        const [time, centiseconds] = timeStr.split('.');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (hours * 3600 + minutes * 60 + seconds) * 1000 + (centiseconds ? parseInt(centiseconds) * 10 : 0);
    }
}

// Function to convert milliseconds to time string
function msToTime(ms, format) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (format === 'srt') {
        const milliseconds = ms % 1000;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
    } else { // ass format
        const centiseconds = Math.floor((ms % 1000) / 10);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }
}

// Function to format timing adjustment for display
function formatTimingAdjustment(adjustmentMs) {
    const absMs = Math.abs(adjustmentMs);
    const direction = adjustmentMs > 0 ? 'delayed' : 'advanced';
    
    const seconds = Math.floor(absMs / 1000);
    const milliseconds = absMs % 1000;
    
    let parts = [];
    if (seconds > 0) {
        parts.push(`${seconds}s`);
    }
    if (milliseconds > 0) {
        parts.push(`${milliseconds}ms`);
    }
    
    const timeStr = parts.length > 0 ? parts.join(' and ') : '0ms';
    return `${direction} ${timeStr}`;
}

// Function to process a single subtitle file
async function processSubtitleFile(filePath, adjustment) {
    const content = fs.readFileSync(filePath, 'utf8');
    const format = filePath.toLowerCase().endsWith('.srt') ? 'srt' : 'ass';
    const lines = content.split('\n');
    
    if (format === 'srt') {
        const processedLines = [];
        let i = 0;
        while (i < lines.length) {
            // Skip empty lines and subtitle numbers
            if (lines[i].trim() === '' || /^\d+$/.test(lines[i].trim())) {
                processedLines.push(lines[i]);
                i++;
                continue;
            }
            
            // Process time line
            if (lines[i].includes('-->')) {
                const [startTime, endTime] = lines[i].split(' --> ').map(t => t.trim());
                const startMs = timeToMs(startTime, 'srt');
                const endMs = timeToMs(endTime, 'srt');
                
                const newStartMs = startMs + adjustment;
                const newEndMs = endMs + adjustment;
                
                const newStartTime = msToTime(newStartMs, 'srt');
                const newEndTime = msToTime(newEndMs, 'srt');
                
                processedLines.push(`${newStartTime} --> ${newEndTime}`);
            } else {
                processedLines.push(lines[i]);
            }
            i++;
        }
        fs.writeFileSync(filePath, processedLines.join('\n'));
    } else { // ass format
        const processedLines = lines.map(line => {
            if (line.startsWith('Dialogue:')) {
                const fields = line.split(',');
                if (fields.length >= 3) {
                    const startTime = fields[1];
                    const endTime = fields[2];
                    
                    const startMs = timeToMs(startTime, 'ass');
                    const endMs = timeToMs(endTime, 'ass');
                    
                    const newStartMs = startMs + adjustment;
                    const newEndMs = endMs + adjustment;
                    
                    fields[1] = msToTime(newStartMs, 'ass');
                    fields[2] = msToTime(newEndMs, 'ass');
                    
                    return fields.join(',');
                }
            }
            return line;
        });
        fs.writeFileSync(filePath, processedLines.join('\n'));
    }
}

// Add new IPC handlers for state sync
ipcMain.handle('sync-timing', (event, delayTime) => {
    updateSharedState({ delayTime });
    return true;
});

ipcMain.handle('sync-files', (event, files) => {
    updateSharedState({ 
        selectedFiles: files,
        selectedFolder: null 
    });
    return true;
});

ipcMain.handle('sync-folder', (event, folder, files) => {
    updateSharedState({ 
        selectedFiles: files || [],
        selectedFolder: folder 
    });
    return true;
});

ipcMain.handle('get-shared-state', () => {
    return sharedState;
});

ipcMain.handle('set-processing-status', (event, status) => {
    updateSharedState({ processingStatus: status });
    return true;
}); 
