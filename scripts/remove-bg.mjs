import sharp from 'sharp';

const input = './HelenJohnston website.jpeg';
const output = './public/title.png';

// Load image and get raw pixel data
const image = sharp(input);
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

// Create output buffer with alpha channel
const outputData = Buffer.alloc(width * height * 4);

// Standard checker pattern: alternating white (#fff) and light gray (#ccc)
// The checker size is typically 8, 10, or 16 pixels
const CHECKER_SIZE = 8;

const getPixel = (x, y) => {
  if (x < 0 || x >= width || y < 0 || y >= height) return null;
  const idx = (y * width + x) * channels;
  return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
};

const isNeutralGray = (r, g, b) => {
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  return maxDiff < 15;
};

const isCheckerCandidate = (r, g, b) => {
  // Must be neutral (grayscale) and light
  return isNeutralGray(r, g, b) && r > 180 && g > 180 && b > 180;
};

// Check if this pixel is part of checker pattern by looking at neighbors
const isPartOfChecker = (x, y, r, g, b) => {
  if (!isCheckerCandidate(r, g, b)) return false;

  // Look at surrounding area to see if there's a checker pattern
  let checkerLikeNeighbors = 0;
  const offsets = [
    [-CHECKER_SIZE, 0], [CHECKER_SIZE, 0],
    [0, -CHECKER_SIZE], [0, CHECKER_SIZE]
  ];

  for (const [dx, dy] of offsets) {
    const neighbor = getPixel(x + dx, y + dy);
    if (neighbor && isCheckerCandidate(neighbor.r, neighbor.g, neighbor.b)) {
      // Check if it's a different shade (alternating pattern)
      const avgCurrent = (r + g + b) / 3;
      const avgNeighbor = (neighbor.r + neighbor.g + neighbor.b) / 3;
      if (Math.abs(avgCurrent - avgNeighbor) > 20) {
        checkerLikeNeighbors++;
      }
    }
  }

  return checkerLikeNeighbors >= 2;
};

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = y * width + x;
    const srcIdx = i * channels;
    const dstIdx = i * 4;

    const r = data[srcIdx];
    const g = data[srcIdx + 1];
    const b = data[srcIdx + 2];

    outputData[dstIdx] = r;
    outputData[dstIdx + 1] = g;
    outputData[dstIdx + 2] = b;

    // Set alpha: 0 for checker pattern, 255 for everything else
    outputData[dstIdx + 3] = isPartOfChecker(x, y, r, g, b) ? 0 : 255;
  }
}

// Save as PNG with transparency
await sharp(outputData, {
  raw: {
    width,
    height,
    channels: 4
  }
})
  .png()
  .toFile(output);

console.log(`Saved ${output} (${width}x${height})`);
