import SimpleMdeReact, { SimpleMDEReactProps } from "react-simplemde-editor";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import ButtonIcon from "./ButtonIcon";
import { deleteFile, saveFile } from "../utils/localStorage";
import { autosave, cancelAutosave } from "../utils/autosave";

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
  const [autosaveError, setAutosaveError] = useState<string | null>(null);

  // Cleanup autosave timers when component unmounts or file changes
  useEffect(() => {
    return () => {
      cancelAutosave(currentFile.filename);
    };
  }, [currentFile.filename]);

  const handleEditorChange = (value: string) => {
    console.log(value);
    setCurrentFile({ ...currentFile, content: value });
    
    // Set status to saving (will be debounced)
    setAutosaveStatus('saving');
    setAutosaveError(null);
    
    // Trigger autosave with 2 second debounce
    autosave(
      currentFile.filename,
      value,
      // onSuccess callback
      () => {
        setAutosaveStatus('saved');
        if (!currentFile.isSaved) {
          setFiles((prevFiles) => [...prevFiles, currentFile.filename]);
          setCurrentFile((prev) => ({ ...prev, isSaved: true }));
        }
      },
      // onError callback
      (error) => {
        setAutosaveStatus('error');
        const errorMessage = error.message.includes('quota') 
          ? 'Storage quota exceeded. Please free up space or save manually.'
          : 'Autosave failed. Please save manually.';
        setAutosaveError(errorMessage);
      }
    );
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
    // Cancel any pending autosave for the old filename
    cancelAutosave(currentFile.filename);
    
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
        <div className="flex items-center gap-2 ml-2">
          {autosaveStatus === 'saving' && (
            <span className="text-sm text-slate-400">Saving...</span>
          )}
          {autosaveStatus === 'saved' && (
            <span className="text-sm text-green-600">Autosaved</span>
          )}
          {autosaveStatus === 'error' && autosaveError && (
            <span className="text-sm text-red-600" title={autosaveError}>
              ⚠️ {autosaveError}
            </span>
          )}
        </div>
      </div>
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