const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let chatWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
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

    // Process command line argument if present
    // In development: electron . path/to/file
    // In production: SubtitleAdjuster.exe path/to/file
    const isDev = !app.isPackaged;
    const argPath = isDev ? process.argv[2] : process.argv[1];
    if (argPath) {
        console.log('argPath', argPath);
        mainWindow.webContents.on('did-finish-load', () => {
            processPath(argPath).then(result => {
                if (result) {
                    mainWindow.webContents.send('command-line-path', result);
                }
            });
        });
    }

    // Add chat button handler
    ipcMain.handle('open-chat', () => {
        if (chatWindow) {
            chatWindow.focus();
            return;
        }

        // Get main window bounds
        const mainBounds = mainWindow.getBounds();
        const chatWidth = Math.floor(mainBounds.width * 2/3);
        const chatHeight = mainBounds.height;
        const chatX = mainBounds.x + mainBounds.width;
        const chatY = mainBounds.y;

        chatWindow = new BrowserWindow({
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
                chatWindow.setPosition(newBounds.x + newBounds.width, newBounds.y);
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
            // Remove all event listeners
            mainWindow.removeListener('move', moveHandler);
            mainWindow.removeListener('focus', mainFocusHandler);
            chatWindow.removeListener('focus', chatFocusHandler);
            chatWindow = null;
        });
    });
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
    return result.filePaths;
});

// Handle file selection for chat interface
ipcMain.handle('select-files', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: options?.filters || [{ name: 'Subtitle Files', extensions: ['ass', 'srt'] }]
    });
    return result.filePaths;
});

ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    if (result.filePaths[0]) {
        return result.filePaths[0];
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
ipcMain.handle('process-subtitles', async (event, { files, folder, delayMs }) => {
    try {
        let filesToProcess = [];
        
        // If files are provided, use them
        if (files && files.length > 0) {
            filesToProcess = files;
        }
        
        // If folder is provided, scan for subtitle files
        if (folder) {
            const folderFiles = fs.readdirSync(folder)
                .filter(file => file.toLowerCase().endsWith('.ass') || file.toLowerCase().endsWith('.srt'))
                .map(file => path.join(folder, file));
            filesToProcess.push(...folderFiles);
        }
        
        if (filesToProcess.length === 0) {
            throw new Error('No subtitle files found to process');
        }
        
        // Process each file
        for (const file of filesToProcess) {
            await processSubtitleFile(file, delayMs);
        }
        
        return { 
            success: true, 
            processedCount: filesToProcess.length,
            message: `${filesToProcess.length} file${filesToProcess.length !== 1 ? 's' : ''} processed successfully`
        };
    } catch (error) {
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
