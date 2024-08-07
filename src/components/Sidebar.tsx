import { Dispatch, SetStateAction } from "react";
import { deleteFile, loadFile } from "../utils/localStorage";
import { getCurrentTime } from "../utils/utils";

export default function Sidebar({
  files,
  setFiles,
  setCurrentFile,
}: {
  files: (string | null)[];
  setFiles: React.Dispatch<React.SetStateAction<(string | null)[]>>; setCurrentFile: Dispatch<
    SetStateAction<{ filename: string; content: string; isSaved: boolean }>
  >;
}) {
  const handleSelectFile = (filename: any) => {
    const content = loadFile(filename);
    setCurrentFile({ filename, content, isSaved: true });
  };

  const handleNewFileClick = () => {
    setCurrentFile({ filename: "Untitled " + getCurrentTime(), content: "", isSaved: false });
  };

  const handleDeleteClick = (filename: string | null) => {
    if (filename) {
      const filteredFiles = files.filter((value) => value !== filename);
      setFiles(filteredFiles);
      deleteFile(filename);
    }
  };
  return (
    <>
      <div className="h-screen w-1/6 flex flex-col items-center bg-white border-b-gray-500 border-2 rounded border-none">
        <div className="w-full font-bold text-xl text-start px-2 text-slate-600 flex justify-between">
          <div>Files</div>
          <button
            onClick={handleNewFileClick}
            className="rounded-full hover:bg-zinc-100 flex justify-center items-center"
          >
            <img src="plus.svg" alt="new" width={25} height={25} />
          </button>
        </div>
        <div className="flex flex-col items-start w-full">
          {files.length > 0 ? (
            files.map((file) => {
              return (
                <div
                  key={file}
                  className="w-full flex justify-between items-center group my-1 px-2"
                >
                  <button
                    onClick={() => handleSelectFile(file)}
                    className="block w-full rounded-md text-slate-500 hover:text-slate-900 text-start text-clip  before:content-['#_']"
                  >
                    {file}
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteClick(file);
                    }}
                    className="hidden text-zinc-200 hover:text-slate-900 group-hover:block"
                  >
                    <img
                      className="text-inherit"
                      src="trash.svg"
                      alt="Delete"
                      width={16}
                      height={16}
                    />
                  </button>
                </div>
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
