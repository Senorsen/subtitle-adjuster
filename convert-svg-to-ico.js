const sharp = require('sharp');
const fs = require('fs');
const { encode } = require('ico-endec');

const inputSvg = 'icon.svg';
const outputIco = 'build/icon.ico';

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
