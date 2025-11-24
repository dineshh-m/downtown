/**
 * Autosave utility for managing automatic saving of markdown content
 * with debouncing and error handling for localStorage quota issues.
 */

export interface AutosaveOptions {
  delay?: number; // Delay in milliseconds (default: 2000)
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Creates a debounced autosave function that saves content to localStorage
 * after a specified delay of inactivity.
 */
export function createAutosave(
  saveFunction: (filename: string, content: string) => void,
  options: AutosaveOptions = {}
) {
  const { delay = 2000, onSuccess, onError } = options;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (filename: string, content: string) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout for autosave
    timeoutId = setTimeout(() => {
      try {
        saveFunction(filename, content);
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
      }
    }, delay);
  };
}

/**
 * Safely saves a file to localStorage with error handling for quota exceeded
 */
export function safeLocalStorageSave(filename: string, content: string): void {
  try {
    localStorage.setItem(filename, content);
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a quota exceeded error
      if (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      ) {
        const quotaError = new Error(
          'Local storage quota exceeded. Unable to save file. Please clear some space or use manual save.'
        );
        quotaError.name = 'QuotaExceededError';
        console.error('[Autosave Error]:', quotaError.message);
        throw quotaError;
      } else {
        console.error('[Autosave Error]:', error.message);
        throw error;
      }
    }
    throw new Error('Unknown error occurred while saving to localStorage');
  }
}

/**
 * Sanitizes markdown content to prevent XSS attacks
 * This is a basic sanitization; for production, consider using a library like DOMPurify
 */
export function sanitizeContent(content: string): string {
  // Remove potentially dangerous script tags and event handlers
  // This is a basic implementation; consider using DOMPurify for production
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}
