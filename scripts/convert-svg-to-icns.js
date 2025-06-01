const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sizes = [16, 32, 64, 128, 256, 512, 1024];
const tempDir = path.join(__dirname, '../build/temp_icons');
const outputFile = path.join(__dirname, '../build/icon.icns');

// Create temp directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Convert SVG to PNGs of different sizes
async function convertToPNGs() {
    const inputSvg = path.join(__dirname, '../assets/icon.svg');
    
    for (const size of sizes) {
        await sharp(inputSvg)
            .resize(size, size)
            .png()
            .toFile(path.join(tempDir, `icon_${size}.png`));
    }
}

// Create ICNS file using iconutil (macOS only)
function createICNS() {
    // Create iconset directory
    const iconsetDir = path.join(tempDir, 'icon.iconset');
    if (!fs.existsSync(iconsetDir)) {
        fs.mkdirSync(iconsetDir, { recursive: true });
    }

    // Copy PNGs to iconset with correct names
    for (const size of sizes) {
        const sourceFile = path.join(tempDir, `icon_${size}.png`);
        const targetFile = path.join(iconsetDir, `icon_${size}x${size}.png`);
        fs.copyFileSync(sourceFile, targetFile);
    }

    // Create ICNS file using iconutil
    try {
        execSync(`iconutil -c icns "${iconsetDir}" -o "${outputFile}"`);
        console.log('Successfully created ICNS file');
    } catch (error) {
        console.error('Error creating ICNS file:', error);
        process.exit(1);
    }
}

// Clean up temp files
function cleanup() {
    if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

// Main execution
async function main() {
    try {
        console.log('Converting SVG to PNGs...');
        await convertToPNGs();
        
        console.log('Creating ICNS file...');
        createICNS();
        
        console.log('Cleaning up...');
        cleanup();
        
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        cleanup();
        process.exit(1);
    }
}

main(); 
