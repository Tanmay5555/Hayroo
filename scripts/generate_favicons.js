import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Helper to write big-endian 32-bit uint
function uint32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n >>> 0, 0);
  return b;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = uint32(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = uint32(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// Generate an RGBA PNG buffer of width x height
function createHayrooPng(size) {
  const width = size;
  const height = size;

  // Colors:
  // Emerald Green: #047857 -> [4, 120, 87, 255]
  // Warm Cream: #FFFBEB -> [255, 251, 235, 255]
  // Light Green Accent: #A7F3D0 -> [167, 243, 208, 255]
  // Deep emerald border: #065F46 -> [6, 95, 70, 255]

  const rawRows = [];
  const radius = Math.floor(size * 0.18); // rounded corner radius (4-8px equivalent scaled)

  // Distance to rounded rectangle helper
  function inRoundedRect(x, y, w, h, r) {
    const dx = Math.max(r - x, 0, x - (w - 1 - r));
    const dy = Math.max(r - y, 0, y - (h - 1 - r));
    return (dx * dx + dy * dy) <= (r * r);
  }

  // Check if pixel is part of the "H" monogram
  function inHMonogram(x, y, w, h) {
    const nx = x / w;
    const ny = y / h;

    // Margin: 24% left/right, 22% top/bottom
    if (ny < 0.22 || ny > 0.78) return false;

    // Left vertical bar: 0.24 to 0.40
    const inLeft = nx >= 0.25 && nx <= 0.41;
    // Right vertical bar: 0.59 to 0.75
    const inRight = nx >= 0.59 && nx <= 0.75;
    // Crossbar: 0.40 to 0.60, ny between 0.44 and 0.56
    const inCross = nx >= 0.40 && nx <= 0.60 && ny >= 0.44 && ny <= 0.56;

    return inLeft || inRight || inCross;
  }

  // Check if pixel is part of the accent dot/sparkle at top-right
  function inAccentLeaf(x, y, w, h) {
    const cx = 0.77 * w;
    const cy = 0.24 * h;
    const r = 0.08 * w;
    const dx = x - cx;
    const dy = y - cy;
    return (dx * dx + dy * dy) <= (r * r);
  }

  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      const inside = inRoundedRect(x, y, width, height, radius);

      if (!inside) {
        // Transparent
        row[idx] = 0;
        row[idx + 1] = 0;
        row[idx + 2] = 0;
        row[idx + 3] = 0;
      } else if (inAccentLeaf(x, y, width, height)) {
        // Light green accent #A7F3D0
        row[idx] = 167;
        row[idx + 1] = 243;
        row[idx + 2] = 208;
        row[idx + 3] = 255;
      } else if (inHMonogram(x, y, width, height)) {
        // Warm Cream #FFFBEB
        row[idx] = 255;
        row[idx + 1] = 251;
        row[idx + 2] = 235;
        row[idx + 3] = 255;
      } else {
        // Emerald Green #047857
        row[idx] = 4;
        row[idx + 1] = 120;
        row[idx + 2] = 87;
        row[idx + 3] = 255;
      }
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: width(4), height(4), bitDepth=8(1), colorType=6 (RGBA)(1), comp=0, filter=0, interlace=0
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const chunks = [
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat(chunks);
}

// Generate simple ICO file containing a 32x32 PNG (standard ICO wrapping)
function createIcoFromPng(png32Buffer) {
  // ICO header: 2 bytes reserved (0), 2 bytes type (1 = icon), 2 bytes count (1)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  // Directory entry (16 bytes):
  // bWidth(1), bHeight(1), bColorCount(1), bReserved(1), wPlanes(2), wBitCount(2), dwBytesInRes(4), dwImageOffset(4)
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2);  // color count
  entry.writeUInt8(0, 3);  // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(png32Buffer.length, 8); // size of image
  entry.writeUInt32LE(6 + 16, 12); // offset of image data

  return Buffer.concat([header, entry, png32Buffer]);
}

const publicDir = path.resolve('public');

// Generate PNGs
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 }
];

let png32 = null;

sizes.forEach(({ name, size }) => {
  const buf = createHayrooPng(size);
  if (size === 32) png32 = buf;
  fs.writeFileSync(path.join(publicDir, name), buf);
  console.log(`Generated ${name} (${size}x${size}, ${buf.length} bytes)`);
});

if (png32) {
  const icoBuf = createIcoFromPng(png32);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
  console.log(`Generated favicon.ico (${icoBuf.length} bytes)`);
}

// Generate vector SVG favicon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" fill="none">
  <!-- Hayroo Emerald Green Rounded Tile (6px corner equivalent) -->
  <rect width="48" height="48" rx="10" fill="#047857" />
  
  <!-- Subtle Inner Border -->
  <rect x="1" y="1" width="46" height="46" rx="9" stroke="#A7F3D0" stroke-opacity="0.3" stroke-width="1" />
  
  <!-- H Monogram in Warm Cream (#FFFBEB) -->
  <path d="M12 12V36H19V26H29V36H36V12H29V20H19V12H12Z" fill="#FFFBEB" />
  
  <!-- Light Green Accent Leaf / Sparkle (#A7F3D0) -->
  <circle cx="37" cy="11" r="4" fill="#A7F3D0" />
</svg>
`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
console.log('Generated favicon.svg');

// Generate webmanifest
const manifest = {
  name: "Hayroo Ecommerce",
  short_name: "Hayroo",
  description: "Modern, dependable ecommerce products for every age.",
  start_url: "/",
  display: "standalone",
  background_color: "#FFFBEB",
  theme_color: "#047857",
  icons: [
    {
      src: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png"
    },
    {
      src: "/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png"
    },
    {
      src: "/favicon.svg",
      sizes: "any",
      type: "image/svg+xml"
    }
  ]
};

fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
console.log('Generated site.webmanifest');
