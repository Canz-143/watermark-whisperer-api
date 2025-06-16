
import { WATERMARK_CHARS } from './characterMaps.js';

/**
 * Cleans watermarks from text while preserving original formatting
 */
export function cleanWatermarks(text) {
  let cleanedText = text;

  // Step 1: Remove all invisible watermark characters completely
  WATERMARK_CHARS.invisible.forEach(char => {
    const charRegex = new RegExp('\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'), 'g');
    cleanedText = cleanedText.replace(charRegex, '');
  });

  // Step 2: Replace all spacing characters with normal spaces
  WATERMARK_CHARS.spacing.forEach(char => {
    const charRegex = new RegExp('\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'), 'g');
    cleanedText = cleanedText.replace(charRegex, ' ');
  });

  // Step 3: Convert line separator characters to proper newlines to preserve formatting
  WATERMARK_CHARS.lineBreaks.forEach(char => {
    const charRegex = new RegExp('\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'), 'g');
    cleanedText = cleanedText.replace(charRegex, '\n');
  });

  // Step 4: Clean up multiple consecutive spaces on the same line (preserve newlines)
  // Only collapse spaces and tabs, not newlines
  cleanedText = cleanedText.replace(/[ \t]{2,}/g, ' ');

  // Step 5: Clean up spaces around punctuation if needed (preserve line structure)
  cleanedText = cleanedText.replace(/[ \t]+([.,!?;:])/g, '$1');
  cleanedText = cleanedText.replace(/([.,!?;:])[ \t]{2,}/g, '$1 ');

  // Step 6: Only trim excessive leading/trailing whitespace, preserve intentional formatting
  // Remove only if there are more than 2 consecutive spaces/newlines at start/end
  cleanedText = cleanedText.replace(/^[ \t]{2,}/, ' ').replace(/[ \t]{2,}$/, ' ');
  cleanedText = cleanedText.replace(/^\n{2,}/, '\n').replace(/\n{2,}$/, '\n');

  return cleanedText;
}
