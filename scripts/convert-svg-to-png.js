const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 64, 128, 256, 512, 1024];
const outputDir = path.join(__dirname, '../build');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Convert SVG to PNGs of different sizes
async function convertToPNGs() {
    const inputSvg = path.join(__dirname, '../assets/icon.svg');
    
    // Generate all sizes
    for (const size of sizes) {
        await sharp(inputSvg)
            .resize(size, size)
            .png()
            .toFile(path.join(outputDir, `icon_${size}.png`));
    }

    // Also create the main icon.png (512x512) for Linux
    await sharp(inputSvg)
        .resize(512, 512)
        .png()
        .toFile(path.join(outputDir, 'icon.png'));
}

// Main execution
async function main() {
    try {
        console.log('Converting SVG to PNGs...');
        await convertToPNGs();
        console.log('Done!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main(); 
