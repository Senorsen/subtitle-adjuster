const sharp = require('sharp');
const fs = require('fs');
const { encode } = require('ico-endec');
const path = require('path')

const inputSvg = path.join(__dirname, '../assets/icon.svg');
const outputIco = path.join(__dirname, '../build/icon.ico');
const buildDir = path.join(__dirname, '../build');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

(async () => {
  // Generate PNG buffers at multiple sizes for ICO
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map(size =>
      sharp(inputSvg)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );
  // Encode to ICO
  const icoBuffer = encode(pngBuffers);
  fs.writeFileSync(outputIco, icoBuffer);
  console.log('ICO file created at', outputIco);
})(); 
