
/**
 * Character mappings and watermark character definitions
 */

/**
 * Maps Unicode characters to human-readable names
 */
export function getCharacterName(char) {
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
    '\u00B7': 'Middle Dot',
    '\u2011': 'Non-Breaking Hyphen',
    '\u034F': 'Combining Grapheme Joiner',
    '\u200A': 'Hair Space',
    '\u2008': 'Punctuation Space'
  };
  
  return characterMap[char] || `Unknown Character (U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')})`;
}

/**
 * Watermark character definitions organized by type
 */
export const WATERMARK_CHARS = {
  // Comprehensive list of all invisible/zero-width watermark characters
  invisible: [
    '\u200B', // Zero-Width Space - most common watermark
    '\u200C', // Zero-Width Non-Joiner
    '\u200D', // Zero-Width Joiner
    '\uFEFF', // Zero-Width No-Break Space (BOM)
    '\u2060', // Word Joiner
    '\u061C', // Arabic Letter Mark
    '\u180E', // Mongolian Vowel Separator
    '\u034F'  // Combining Grapheme Joiner
  ],

  // Spacing characters that should be converted to normal spaces
  spacing: [
    '\u202F', // Narrow No-Break Space
    '\u2003', // Em Space
    '\u00A0', // Non-Breaking Space
    '\u2011', // Non-Breaking Hyphen (sometimes used as separator)
    '\u200A', // Hair Space
    '\u2008'  // Punctuation Space
  ],

  // Line separator characters that should become newlines to preserve formatting
  lineBreaks: [
    '\u2028', // Line Separator
    '\u2029'  // Paragraph Separator
  ]
};

// All watermark characters for detection and counting
export const ALL_WATERMARK_CHARS = [
  ...WATERMARK_CHARS.invisible,
  ...WATERMARK_CHARS.spacing,
  ...WATERMARK_CHARS.lineBreaks
];
