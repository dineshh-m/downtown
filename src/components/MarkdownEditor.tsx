import SimpleMdeReact, { SimpleMDEReactProps } from "react-simplemde-editor";
import { Dispatch, SetStateAction, } from "react";
import ButtonIcon from "./ButtonIcon";
import { deleteFile, saveFile } from "../utils/localStorage";

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
  const handleEditorChange = (value: string) => {
    console.log(value);
    setCurrentFile({ ...currentFile, content: value });
    saveFile(currentFile.filename, value);
    
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