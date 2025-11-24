import SimpleMdeReact, { SimpleMDEReactProps } from "react-simplemde-editor";
import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react";
import ButtonIcon from "./ButtonIcon";
import { deleteFile, saveFile } from "../utils/localStorage";
import { createAutosave, sanitizeContent } from "../utils/autosave";
import SecurityWarningBanner from "./SecurityWarningBanner";

const MDEProps = {
  maxHeight: "500px",
  sideBySideFullScreen: false,
  id: "mde-textarea"
} as SimpleMDEReactProps;

export default function MarkdownEditor({
  files,
  setFiles,
  currentFile,
  setCurrentFile,
}: {
  files: (string | null)[];
  setFiles: Dispatch<SetStateAction<(string | null)[]>>;
  currentFile: { filename: string; content: string, isSaved: boolean; };
  setCurrentFile: React.Dispatch<
    React.SetStateAction<{
      filename: string;
      content: string;
      isSaved: boolean;
    }>
  >;
}) {
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Create autosave function with debounce
  const autosave = useMemo(
    () =>
      createAutosave(
        (filename: string, content: string) => {
          // Sanitize content before saving
          const sanitizedContent = sanitizeContent(content);
          saveFile(filename, sanitizedContent);
        },
        {
          delay: 2000, // 2 seconds of inactivity
          onSuccess: () => {
            setAutosaveStatus('saved');
            setErrorMessage('');
            // Reset status after 2 seconds
            setTimeout(() => setAutosaveStatus('idle'), 2000);
          },
          onError: (error: Error) => {
            setAutosaveStatus('error');
            setErrorMessage(error.message);
            console.error('[Autosave Error]:', error);
          },
        }
      ),
    []
  );

  const handleEditorChange = (value: string) => {
    setAutosaveStatus('saving');
    setCurrentFile({ ...currentFile, content: value });
    
    // Add to files list if not already saved
    if (!currentFile.isSaved) {
      setFiles([...files, currentFile.filename]);
      setCurrentFile({...currentFile, content: value, isSaved: true});
    }
    
    // Trigger autosave
    autosave(currentFile.filename, value);
  };
  // for handling save button click
  const handleSaveClick = () => {
    if (!files.includes(currentFile.filename)) {
      setFiles((files) => [...files, currentFile.filename]);
    }
    saveFile(currentFile.filename, currentFile.content);
  };
  // for handling the filename change in the top of the editor
  const handleFilenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // changing the currentFile state so that input field is upated
    const newFilename = event.target.value;
    setCurrentFile({...currentFile, filename: newFilename });
    const updatedFiles = files.map((value) => {
      if (value === currentFile.filename) {
        return newFilename;
      }

      return value;
    });
    console.log(updatedFiles);
    deleteFile(currentFile.filename);
    try {
      saveFile(newFilename, currentFile.content);
      setAutosaveStatus('saved');
    } catch (error) {
      setAutosaveStatus('error');
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
    setFiles([...updatedFiles]);
  };

  // Load content from localStorage when component mounts or file changes
  useEffect(() => {
    setAutosaveStatus('idle');
    setErrorMessage('');
  }, [currentFile.filename]);

  return (
    <div className="flex flex-col w-full">
      <SecurityWarningBanner />
      
      <div className="flex items-center gap-1 text-slate-500 hover:text-slate-900">
        <span className="text-3xl font-semibold font-serif">#</span>
        <input
          className="block font-medium text-xl p-2 focus:text-slate-900 focus:outline-none rounded border-2 border-transparent caret-zinc-400 cursor-pointer"
          type="text"
          value={currentFile.filename}
          onChange={handleFilenameChange}
        />
        <div className="pr-3">
          <ButtonIcon src="save.svg" handleClick={handleSaveClick} />
        </div>
        
        {/* Autosave status indicator */}
        <div className="ml-2 text-sm">
          {autosaveStatus === 'saving' && (
            <span className="text-gray-500">Saving...</span>
          )}
          {autosaveStatus === 'saved' && (
            <span className="text-green-600">✓ Autosaved</span>
          )}
          {autosaveStatus === 'error' && (
            <span className="text-red-600" title={errorMessage}>
              ⚠ Save failed
            </span>
          )}
        </div>
      </div>
      
      {/* Error message display */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-2 mt-2">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}
      
      <div className="w-full overflow-auto">
        <SimpleMdeReact
          value={currentFile.content}
          onChange={handleEditorChange}
          className="w-full border-none text-slate-900"
          options={MDEProps}
        />
      </div>
    </div>
  );
}