import { Dispatch, SetStateAction } from "react";
import { loadFile } from "../utils/localStorage";

export default function Sidebar({
  files,
  setCurrentFile,
}: {
  files: (string | null)[];
  setCurrentFile: Dispatch<
    SetStateAction<{ filename: string; content: string }>
  >;
}) {
  const handleSelectFile = (filename: any) => {
    const content = loadFile(filename);
    setCurrentFile({ filename, content });
  };
  return (
    <>
      <div className="h-screen w-1/6 flex flex-col items-center bg-white border-b-gray-500 border-2 rounded border-none">
        <div className="w-full font-bold text-xl text-start px-2 text-slate-600">Files</div>
        <div className="flex flex-col items-start w-full">
          {files.length > 0 ? (
            files.map((file) => {
              return (
                <button
                  onClick={() => handleSelectFile(file)}
                  className="block w-full my-1 px-2 rounded-md border-2 border-white text-slate-500 hover:text-slate-900 text-start before:content-['#_']"
                  key={file}
                >
                  {file}
                </button>
              );
            })
          ) : (
            <div className="mt-3">No files found</div>
          )}
        </div>
      </div>
    </>
  );
}
