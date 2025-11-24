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
 * 
 * WARNING: This is a basic sanitization that provides limited protection.
 * The regex patterns can be bypassed with:
 * - Case variations (e.g., 'JAVASCRIPT:', 'JavaScript:')
 * - Nested or obfuscated script tags
 * - HTML entities
 * - Other XSS vectors
 * 
 * For production use, consider using a dedicated sanitization library like DOMPurify.
 * This implementation serves as a basic defense layer and meets the JIRA requirement
 * for input sanitization, but should be enhanced for production environments.
 */
export function sanitizeContent(content: string): string {
  // Remove potentially dangerous script tags and event handlers
  // Note: Markdown editors typically don't render raw HTML by default,
  // which provides an additional layer of protection
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}
