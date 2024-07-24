import { Dispatch, SetStateAction } from "react";
import { loadFile } from "../utils/localStorage";

export default function Sidebar({ files, setCurrentFile }: { files: (string | null)[], setCurrentFile: Dispatch<SetStateAction<{ filename: string; content: string; }>>}) {
    const handleSelectFile = (filename: any) => {
      const content = loadFile(filename);
      setCurrentFile({ filename, content });
    }
    return (
      <>
        <div className="h-screen w-1/6 flex justify-center bg-gray-100 border-b-gray-500 border-2 rounded">
          <div className="flex flex-col items-start">
            { files.length > 0 ? files.map(file => {
                return <button onClick={() => handleSelectFile(file)} className="block w-full my-1 px-2 rounded-md hover:border-zinc-300 border-2 border-gray-100 text-start" key={file}>{file}</button>
            }) : <div className="mt-3">No files found</div>}
          </div>
        </div>
      </>
    );
}