
// ChatGPT Watermark Removal API - SMART VERSION
// Fully production-ready serverless function for Vercel deployment

/**
 * Maps Unicode characters to human-readable names
 */
function getCharacterName(char) {
  const characterMap = {
    '\u202F': 'Narrow No-Break Space',
    '\u200B': 'Zero-Width Space',
    '\u2003': 'Em Space',
    '\u2014': 'Em Dash',
    '\u00A0': 'Non-Breaking Space',
    '\u2060': 'Word Joiner',
    '\u200C': 'Zero-Width Non-Joiner',
    '\u200D': 'Zero-Width Joiner',
    '\uFEFF': 'Zero-Width No-Break Space',
    '\u2028': 'Line Separator',
    '\u2029': 'Paragraph Separator',
    '\u180E': 'Mongolian Vowel Separator',
    '\u061C': 'Arabic Letter Mark',
    '\u00B7': 'Middle Dot'
  };
  
  return characterMap[char] || `Unknown Character (U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`;
}

/**
 * Removes ChatGPT watermarks from text using context-aware analysis
 */
function removeWatermarks(text) {
  if (typeof text !== 'string') {
    throw new Error('Input must be a string');
  }

  const originalText = text;
  const originalLength = text.length;

  // Truly invisible/zero-width watermark characters
  const invisibleWatermarkChars = [
    '\u200B', // Zero-Width Space - most common watermark
    '\u200C', // Zero-Width Non-Joiner
    '\u200D', // Zero-Width Joiner
    '\uFEFF', // Zero-Width No-Break Space (BOM)
    '\u2060', // Word Joiner
    '\u061C', // Arabic Letter Mark
    '\u180E'  // Mongolian Vowel Separator
  ];

  // Legitimate spacing characters that should be converted to normal spaces
  const spacingChars = [
    '\u202F', // Narrow No-Break Space
    '\u2003', // Em Space
    '\u00A0', // Non-Breaking Space
    '\u2028', // Line Separator
    '\u2029', // Paragraph Separator
  ];

  // All watermark characters for detection and counting
  const allWatermarkChars = [...invisibleWatermarkChars, ...spacingChars];

  const detectedWatermarks = [];
  let totalRemoved = 0;

  // Count occurrences of each watermark character
  allWatermarkChars.forEach(char => {
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

  // Helper function to check if a character is a letter or number
  const isAlphaNumeric = (char) => /[a-zA-Z0-9]/.test(char);
  
  // Helper function to check if a character is whitespace
  const isWhitespace = (char) => /\s/.test(char);

  // Convert text to array for easier manipulation
  let chars = Array.from(text);
  let result = [];

  for (let i = 0; i < chars.length; i++) {
    const currentChar = chars[i];
    
    // Check if current character is an invisible watermark
    if (invisibleWatermarkChars.includes(currentChar)) {
      // Get context: previous and next characters
      const prevChar = i > 0 ? chars[i - 1] : null;
      const nextChar = i < chars.length - 1 ? chars[i + 1] : null;
      
      // Only add a space if we're at a legitimate word boundary
      // i.e., if the invisible character is between a non-space and a space, or vice versa
      const shouldAddSpace = (
        (prevChar && isAlphaNumeric(prevChar) && nextChar && isWhitespace(nextChar)) ||
        (prevChar && isWhitespace(prevChar) && nextChar && isAlphaNumeric(nextChar)) ||
        (prevChar && isAlphaNumeric(prevChar) && nextChar && isAlphaNumeric(nextChar) && 
         // Check if this might be a word boundary by looking for patterns
         (i === 0 || i === chars.length - 1 || 
          (i > 0 && chars[i - 1] === ' ') || 
          (i < chars.length - 1 && chars[i + 1] === ' ')))
      );
      
      // Don't add the invisible character, but add space only if needed for word boundaries
      if (shouldAddSpace && result.length > 0 && result[result.length - 1] !== ' ') {
        result.push(' ');
      }
      // Skip the invisible watermark character entirely
      continue;
    }
    
    // Check if current character is a spacing character that should be normalized
    if (spacingChars.includes(currentChar)) {
      result.push(' ');
      continue;
    }
    
    // Regular character - add it as-is
    result.push(currentChar);
  }

  let cleanedText = result.join('');

  // Clean up any multiple spaces that might have been created
  if (totalRemoved > 0) {
    cleanedText = cleanedText.replace(/\s{2,}/g, ' ').trim();
  }

  console.log(`Processing complete: removed ${totalRemoved} watermark characters`);
  console.log(`Detected watermarks:`, detectedWatermarks);

  return {
    original: originalText,
    cleaned: cleanedText,
    stats: {
      originalLength,
      cleanedLength: cleanedText.length,
      charactersRemoved: totalRemoved,
      watermarksDetected: detectedWatermarks.length > 0,
      detectedWatermarks,
      processingTime: new Date().toISOString()
    }
  };
}

/**
 * Vercel Serverless API handler
 */
export default function handler(req, res) {
  // CORS headers for the free spirits out there
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight gets the red carpet
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST only — all else can go cry
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST is your ticket.',
      allowedMethods: ['POST']
    });
  }

  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
        expectedFormat: {
          text: 'string - The text to clean'
        }
      });
    }

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text parameter is required',
        receivedData: req.body
      });
    }

    if (typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text parameter must be a string',
        receivedType: typeof text
      });
    }

    console.log(`Incoming text length: ${text.length}`);

    const result = removeWatermarks(text);

    console.log(`Cleaned! Removed ${result.stats.charactersRemoved} sneaky watermarks.`);

    res.status(200).json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
      apiVersion: '1.1.0' // Bumped version for clarity
    });

  } catch (error) {
    console.error('🔥 Error detected:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error while nuking watermarks',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Export raw function for testing too
export { removeWatermarks };
