import SimpleMdeReact, { SimpleMDEReactProps } from "react-simplemde-editor";
import { Dispatch, SetStateAction, useCallback } from "react";
import ButtonIcon from "./ButtonIcon";
import { saveFile } from "../utils/localStorage";

const MDEProps = {
  maxHeight: "500px",
  sideBySideFullScreen: false,
} as SimpleMDEReactProps;

export default function MarkdownEditor({
  files,
  setFiles,
  currentFile,
  setCurrentFile,
}: {
  files: (string | null)[]
  setFiles: Dispatch<SetStateAction<(string | null)[]>>;
  currentFile: { filename: string, content: string };
  setCurrentFile: ({ filename, content }: {filename: string, content: string}) => void;
}) {

  const handleEditorChange = useCallback((value: string) => {
    setCurrentFile({...currentFile, content: value});
  }, []);
  const handleSaveClick = () => {
    if (!files.includes(currentFile.filename)) {
      setFiles((files) => [...files, currentFile.filename]);
    }
    saveFile(currentFile.filename, currentFile.content);
  }
  const handleFilenameChange = (event: any) => {
    setCurrentFile({...currentFile, filename: event.target.value});
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center">
        <input
          className="block font-bold text-xl p-2 focus:outline-none rounded border-2 border-zinc-200"
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
          className="w-full"
          options={MDEProps}
        />
      </div>
    </div>
  );
}
