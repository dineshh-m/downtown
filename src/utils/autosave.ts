/**
 * Autosave utility for managing debounced local storage operations
 * with error handling for storage quota issues
 */

export interface AutosaveError {
  message: string;
  type: 'quota' | 'unavailable' | 'unknown';
}

export type AutosaveCallback = (error?: AutosaveError) => void;

/**
 * Creates a debounced autosave function that saves to localStorage
 * @param delay - Delay in milliseconds before saving (default: 2000ms)
 * @returns A debounced save function
 */
export function createDebouncedAutosave(delay: number = 2000) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (
    filename: string,
    content: string,
    callback?: AutosaveCallback
  ): void => {
    // Clear any existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout for the autosave operation
    timeoutId = setTimeout(() => {
      try {
        // Check if localStorage is available
        if (typeof localStorage === 'undefined') {
          const error: AutosaveError = {
            message: 'LocalStorage is not available',
            type: 'unavailable',
          };
          console.error('[Autosave Error]', error.message);
          callback?.(error);
          return;
        }

        // Attempt to save to localStorage
        localStorage.setItem(filename, content);
        console.log(`[Autosave] Successfully saved: ${filename}`);
        callback?.();
      } catch (error) {
        // Handle quota exceeded error
        if (
          error instanceof DOMException &&
          (error.name === 'QuotaExceededError' ||
            error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
        ) {
          const autosaveError: AutosaveError = {
            message: 'LocalStorage quota exceeded. Please clear some space.',
            type: 'quota',
          };
          console.error('[Autosave Error]', autosaveError.message, error);
          callback?.(autosaveError);
        } else {
          // Handle other errors
          const autosaveError: AutosaveError = {
            message: 'Failed to autosave. Please try manual save.',
            type: 'unknown',
          };
          console.error('[Autosave Error]', autosaveError.message, error);
          callback?.(autosaveError);
        }
      }
    }, delay);
  };
}

/**
 * Cancels any pending autosave operation
 * @param timeoutId - The timeout ID to cancel
 */
export function cancelAutosave(timeoutId: ReturnType<typeof setTimeout> | null): void {
  if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }
}
