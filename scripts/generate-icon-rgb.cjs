/**
 * Piwowar (Brewcraft) — Production Icon Generator (1024x1024 ColorType 2 RGB)
 * Creates App Store compliant icon without alpha channel.
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// Standard CRC32 implementation for PNG chunks
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, toCrc, crcBuf]);
}

function generateIcon() {
  const width = 1024;
  const height = 1024;

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 2; // ColorType 2: RGB without alpha
  ihdrData[10] = 0; // Deflate compression
  ihdrData[11] = 0; // Filter method 0
  ihdrData[12] = 0; // Non-interlaced
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: height scanlines, each starting with filter type 0 (None) + width * 3 RGB bytes
  const bytesPerPixel = 3;
  const rowSize = 1 + width * bytesPerPixel;
  const rawData = Buffer.alloc(height * rowSize);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 340;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;

      // Distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Craft aesthetic:
      // Dark slate background: #121418
      let r = 18;
      let g = 20;
      let b = 24;

      // Rounded shield background (outer ring)
      if (dist < radius + 40 && dist >= radius) {
        // Gold border
        r = 212;
        g = 154;
        b = 61;
      } else if (dist < radius) {
        // Deep copper center: #1c1815
        r = 28;
        g = 24;
        b = 21;

        // Golden Kettle / Hop symbol silhouette in the center
        // Hop cone or beer glass geometry
        const insideGlass =
          Math.abs(dx) < 140 - (dy * 0.15) &&
          dy > -160 && dy < 160;

        const insideFoam =
          Math.abs(dx) < 170 &&
          dy >= -200 && dy <= -150;

        if (insideFoam) {
          // Cream white foam
          r = 245;
          g = 240;
          b = 225;
        } else if (insideGlass) {
          // Amber craft beer: #e59328
          r = 229;
          g = 147;
          b = 40;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);

  const targetPath = path.resolve(__dirname, '../assets/icon.png');
  fs.writeFileSync(targetPath, pngBuffer);
  console.log(`Generated production icon at ${targetPath} (${pngBuffer.length} bytes, ColorType 2 RGB).`);
}

generateIcon();
