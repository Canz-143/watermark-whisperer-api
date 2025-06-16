
import { getCharacterName, ALL_WATERMARK_CHARS } from './characterMaps.js';

/**
 * Detects and analyzes watermarks in text
 */
export function detectWatermarks(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const originalLength = text.length;
  const detectedWatermarks = [];
  let totalRemoved = 0;

  // Count occurrences of each watermark character
  ALL_WATERMARK_CHARS.forEach(char => {
    const charRegex = new RegExp('\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'), 'g');
    const matches = text.match(charRegex);
    if (matches) {
      detectedWatermarks.push({
        character: char,
        name: getCharacterName(char),
        count: matches.length,
        unicode: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`
      });
      totalRemoved += matches.length;
    }
  });

  console.log(`Input text analysis:`, {
    length: originalLength,
    detectedWatermarks: detectedWatermarks,
    totalToRemove: totalRemoved
  });

  return {
    originalLength,
    detectedWatermarks,
    totalRemoved,
    watermarksDetected: detectedWatermarks.length > 0
  };
}
