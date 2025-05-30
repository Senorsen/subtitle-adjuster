#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check arguments
if (process.argv.length !== 4) {
    console.log('Usage: node adjust_subtitles.js <subtitle_folder> <time_adjustment_ms>');
    console.log('Example: node adjust_subtitles.js ./subtitles 1000    # Delay by 1 second');
    console.log('Example: node adjust_subtitles.js ./subtitles -1000   # Advance by 1 second');
    process.exit(1);
}

const folder = process.argv[2];
const adjustment = parseInt(process.argv[3]);

// Validate folder exists
if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
    console.error(`Error: Folder '${folder}' does not exist`);
    process.exit(1);
}

// Validate adjustment is a number
if (isNaN(adjustment)) {
    console.error('Error: Time adjustment must be a valid integer');
    process.exit(1);
}

// Function to convert time string to milliseconds
function timeToMs(timeStr) {
    const [time, centiseconds] = timeStr.split('.');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return (hours * 3600 + minutes * 60 + seconds) * 1000 + (centiseconds ? parseInt(centiseconds) * 10 : 0);
}

// Function to convert milliseconds to time string
function msToTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

// Function to process a single file
function processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    // Read the entire file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Split into lines and process
    const lines = content.split('\n');
    const processedLines = lines.map(line => {
        if (line.startsWith('Dialogue:')) {
            const fields = line.split(',');
            if (fields.length >= 3) {
                // Get and adjust times
                const startTime = fields[1];
                const endTime = fields[2];
                
                const startMs = timeToMs(startTime);
                const endMs = timeToMs(endTime);
                
                const newStartMs = startMs + adjustment;
                const newEndMs = endMs + adjustment;
                
                // Update the times in the fields
                fields[1] = msToTime(newStartMs);
                fields[2] = msToTime(newEndMs);
                
                return fields.join(',');
            }
        }
        return line;
    });
    
    // Write the entire file back
    fs.writeFileSync(filePath, processedLines.join('\n'));
    console.log(`Completed: ${filePath}`);
}

// Find and process all .ass files
try {
    const files = fs.readdirSync(folder)
        .filter(file => file.toLowerCase().endsWith('.ass'))
        .map(file => path.join(folder, file));
    
    if (files.length === 0) {
        console.log('No .ass files found in the specified folder');
        process.exit(0);
    }
    
    console.log(`Found ${files.length} .ass files`);
    files.forEach(processFile);
    console.log('All subtitle files have been processed.');
} catch (error) {
    console.error('Error processing files:', error.message);
    process.exit(1);
} 
