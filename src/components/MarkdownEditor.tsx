import SimpleMdeReact, { SimpleMDEReactProps } from "react-simplemde-editor";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ButtonIcon from "./ButtonIcon";
import { deleteFile, saveFile } from "../utils/localStorage";
import { createAutosave } from "../utils/autosave";

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
  const [saveError, setSaveError] = useState<string | null>(null);
  const autosaveRef = useRef<{ debouncedSave: (filename: string, content: string) => void; cleanup: () => void } | null>(null);

  // Initialize autosave on component mount
  useEffect(() => {
    autosaveRef.current = createAutosave(saveFile, {
      delay: 2000, // 2 seconds of inactivity
      onSave: (filename) => {
        console.log(`Autosaved: ${filename}`);
        setSaveError(null);
      },
      onError: (error) => {
        console.error('Autosave error:', error);
        setSaveError(error.message);
      },
    });

    // Cleanup on unmount
    return () => {
      autosaveRef.current?.cleanup();
    };
  }, []);

  const handleEditorChange = (value: string) => {
    console.log(value);
    setCurrentFile({ ...currentFile, content: value });
    
    // Use debounced autosave instead of immediate save
    if (autosaveRef.current) {
      autosaveRef.current.debouncedSave(currentFile.filename, value);
    }
    
    if (!currentFile.isSaved) {
      setFiles([...files, currentFile.filename]);
      setCurrentFile({...currentFile, isSaved: true});
    }
  };
  // for handling save button click (manual save as fallback)
  const handleSaveClick = () => {
    try {
      if (!files.includes(currentFile.filename)) {
        setFiles((files) => [...files, currentFile.filename]);
      }
      saveFile(currentFile.filename, currentFile.content);
      setSaveError(null);
      console.log(`Manually saved: ${currentFile.filename}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save file';
      setSaveError(errorMessage);
      console.error('Manual save error:', error);
    }
  };
  // for handling the filename change in the top of the editor
  const handleFilenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
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
      setSaveError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to rename file';
      setSaveError(errorMessage);
      console.error('Filename change error:', error);
    }
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
      </div>
      {saveError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-2" role="alert">
          <span className="block sm:inline">{saveError}</span>
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