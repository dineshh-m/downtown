/**
 * Autosave utility for managing debounced saves to localStorage
 */

import { saveFile } from './localStorage';

// Debounce delay in milliseconds (2 seconds)
const AUTOSAVE_DELAY = 2000;

// Store for debounce timers
const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

/**
 * Autosave content to localStorage with debouncing
 * @param filename - The name of the file to save
 * @param content - The content to save
 * @param onSuccess - Optional callback on successful save
 * @param onError - Optional callback on error
 */
export function autosave(
  filename: string,
  content: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): void {
  // Clear existing timer for this file if any
  const existingTimer = debounceTimers.get(filename);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Set new debounced save timer
  const timer = setTimeout(() => {
    try {
      // Check if localStorage is available
      if (!isLocalStorageAvailable()) {
        const error = new Error('localStorage is not available');
        console.error('[Autosave Error]', error.message);
        if (onError) onError(error);
        return;
      }

      // Attempt to save
      saveFile(filename, content);
      console.log(`[Autosave] Successfully saved: ${filename}`);
      
      if (onSuccess) onSuccess();
    } catch (error) {
      // Handle quota exceeded or other storage errors
      if (error instanceof Error) {
        console.error('[Autosave Error]', error.message);
        
        // Check if it's a quota exceeded error
        if (isQuotaExceededError(error)) {
          console.warn('[Autosave Warning] localStorage quota exceeded');
        }
        
        if (onError) onError(error);
      }
    } finally {
      // Clean up the timer reference
      debounceTimers.delete(filename);
    }
  }, AUTOSAVE_DELAY);

  // Store the timer reference
  debounceTimers.set(filename, timer);
}

/**
 * Cancel pending autosave for a specific file
 * @param filename - The name of the file
 */
export function cancelAutosave(filename: string): void {
  const timer = debounceTimers.get(filename);
  if (timer) {
    clearTimeout(timer);
    debounceTimers.delete(filename);
    console.log(`[Autosave] Cancelled autosave for: ${filename}`);
  }
}

/**
 * Check if localStorage is available
 * @returns true if localStorage is available, false otherwise
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if the error is a quota exceeded error
 * @param error - The error to check
 * @returns true if it's a quota exceeded error
 */
function isQuotaExceededError(error: Error): boolean {
  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.message.includes('quota')
  );
}
