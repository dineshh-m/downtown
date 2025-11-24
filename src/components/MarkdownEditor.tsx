import SimpleMdeReact, { SimpleMDEReactProps } from "react-simplemde-editor";
import { Dispatch, SetStateAction, useRef, useEffect } from "react";
import ButtonIcon from "./ButtonIcon";
import { deleteFile, saveFile } from "../utils/localStorage";
import { useAutosave } from "../utils/useAutosave";
import AutosaveIndicator from "./AutosaveIndicator";

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
  // Use ref to always have access to the latest currentFile value
  const currentFileRef = useRef(currentFile);
  
  // Update ref when currentFile changes
  useEffect(() => {
    currentFileRef.current = currentFile;
  }, [currentFile]);

  // Autosave hook with 1 second delay
  const { status, triggerSave, save } = useAutosave({
    delay: 1000,
    onSave: async () => {
      // Use ref to get the latest currentFile value
      const fileToSave = currentFileRef.current;
      
      // Save the file to localStorage
      saveFile(fileToSave.filename, fileToSave.content);
      
      // Add file to the list if not already present (after successful save)
      if (!fileToSave.isSaved) {
        setFiles((prevFiles) => {
          if (!prevFiles.includes(fileToSave.filename)) {
            return [...prevFiles, fileToSave.filename];
          }
          return prevFiles;
        });
        setCurrentFile((prev) => ({ ...prev, isSaved: true }));
      }
    },
  });

  const handleEditorChange = (value: string) => {
    // Update the current file content using functional update
    setCurrentFile((prev) => ({ ...prev, content: value }));
    
    // Trigger autosave (debounced)
    triggerSave();
  };

  // for handling save button click (manual save)
  const handleSaveClick = async () => {
    if (!files.includes(currentFile.filename)) {
      setFiles((files) => [...files, currentFile.filename]);
      setCurrentFile((prev) => ({ ...prev, isSaved: true }));
    }
    await save(); // Save immediately without debouncing
  };

  // for handling the filename change in the top of the editor
  const handleFilenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // changing the currentFile state so that input field is upated
    const newFilename = event.target.value;
    const oldFilename = currentFile.filename;
    
    setCurrentFile((prev) => ({ ...prev, filename: newFilename }));
    
    const updatedFiles = files.map((value) => {
      if (value === oldFilename) {
        return newFilename;
      }
      return value;
    });
    
    deleteFile(oldFilename);
    saveFile(newFilename, currentFile.content);
    setFiles(updatedFiles);
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
        <div className="flex items-center gap-2 pr-3">
          <AutosaveIndicator status={status} />
          <ButtonIcon src="save.svg" handleClick={handleSaveClick} />
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