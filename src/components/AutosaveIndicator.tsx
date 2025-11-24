import { AutosaveStatus } from '../utils/useAutosave';

interface AutosaveIndicatorProps {
  status: AutosaveStatus;
}

export default function AutosaveIndicator({ status }: AutosaveIndicatorProps) {
  if (status === 'idle') {
    return null;
  }

  const statusConfig = {
    saving: {
      text: 'Saving...',
      color: 'text-blue-500',
    },
    saved: {
      text: 'Saved',
      color: 'text-green-600',
    },
    error: {
      text: 'Error saving',
      color: 'text-red-500',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-1 text-sm ${config.color} font-medium`}>
      {status === 'saving' && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {status === 'saved' && (
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
      {status === 'error' && (
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      )}
      <span>{config.text}</span>
    </div>
  );
}
