import SimpleMdeReact, { SimpleMDEReactProps } from "react-simplemde-editor";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ButtonIcon from "./ButtonIcon";
import { deleteFile, saveFile } from "../utils/localStorage";
import { createDebouncedAutosave, AutosaveError } from "../utils/autosave";

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
  // State for autosave status and errors
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autosaveError, setAutosaveError] = useState<string | null>(null);
  
  // Create debounced autosave function with useRef to maintain the same instance
  const debouncedAutosave = useRef(createDebouncedAutosave(2000));

  // Effect to update autosave status back to idle after showing saved message
  useEffect(() => {
    if (autosaveStatus === 'saved') {
      const timer = setTimeout(() => {
        setAutosaveStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autosaveStatus]);

  const handleEditorChange = (value: string) => {
    console.log(value);
    setCurrentFile({ ...currentFile, content: value });
    
    // Update autosave status to saving
    setAutosaveStatus('saving');
    setAutosaveError(null);

    // Trigger debounced autosave
    debouncedAutosave.current(currentFile.filename, value, (error?: AutosaveError) => {
      if (error) {
        setAutosaveStatus('error');
        setAutosaveError(error.message);
      } else {
        setAutosaveStatus('saved');
        setAutosaveError(null);
      }
    });
    
    if (!currentFile.isSaved) {
      setFiles([...files, currentFile.filename]);
      setCurrentFile({...currentFile, isSaved: true});
    }
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
    saveFile(newFilename, currentFile.content);
    setFiles([...updatedFiles]);
  };

  return (
    <div className="flex flex-col w-full">
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
            <span className="text-blue-500">Saving...</span>
          )}
          {autosaveStatus === 'saved' && (
            <span className="text-green-600">✓ Autosaved</span>
          )}
          {autosaveStatus === 'error' && (
            <span className="text-red-600">⚠ Autosave failed</span>
          )}
        </div>
      </div>
      {/* Error warning banner */}
      {autosaveError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 text-xl">⚠</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                {autosaveError}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Please use the manual save button or clear some browser storage.
              </p>
            </div>
          </div>
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