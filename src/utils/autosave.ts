/**
 * Debounced autosave utility for the markdown editor
 * Saves content to localStorage after 2 seconds of inactivity
 */

export interface AutosaveOptions {
  delay?: number; // delay in milliseconds, default 2000ms (2 seconds)
  onSave?: (filename: string, content: string) => void;
  onError?: (error: Error) => void;
}

export interface AutosaveInstance {
  debouncedSave: (filename: string, content: string) => void;
  cleanup: () => void;
}

/**
 * Creates a debounced autosave function
 * @param saveFunction - Function to call for saving
 * @param options - Configuration options
 * @returns Debounced save function and cleanup function
 */
export function createAutosave(
  saveFunction: (filename: string, content: string) => void,
  options: AutosaveOptions = {}
): AutosaveInstance {
  const { delay = 2000, onSave, onError } = options;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debouncedSave = (filename: string, content: string) => {
    // Clear existing timeout
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      try {
        saveFunction(filename, content);
        onSave?.(filename, content);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Autosave failed:', err);
        onError?.(err);
      }
    }, delay);
  };

  const cleanup = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  };

  return { debouncedSave, cleanup };
}
