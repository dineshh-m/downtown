import { useEffect, useRef, useState } from 'react';

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions {
  delay?: number; // Delay in milliseconds before saving
  onSave: () => void | Promise<void>;
}

export function useAutosave({ delay = 1000, onSave }: UseAutosaveOptions) {
  const [status, setStatus] = useState<AutosaveStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = async () => {
    try {
      setStatus('saving');
      await onSave();
      setStatus('saved');
      
      // Reset to idle after 2 seconds
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      savedTimeoutRef.current = setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Autosave error:', error);
      setStatus('error');
      
      // Reset to idle after 3 seconds for error state
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
      savedTimeoutRef.current = setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  const triggerSave = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  return { status, triggerSave, save };
}
