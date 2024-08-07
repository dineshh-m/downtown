import Navbar from "./components/Navbar";
import MarkdownEditor from './components/MarkdownEditor';
import Sidebar from "./components/Sidebar";
import { getAllFiles } from "./utils/localStorage";

import { useState } from "react";
import { getCurrentTime } from "./utils/utils";

function App() {
  const [files, setFiles] = useState(getAllFiles);
  const [currentFile, setCurrentFile] = useState({filename: "Untitled " + getCurrentTime(), content: "", isSaved: false });

  return (
    <div className="w-full text-slate-900 bg-white">
      <Navbar />
      <div className="mt-16 z-10 flex">
        <Sidebar files={files} setFiles={setFiles} setCurrentFile={setCurrentFile} />
        <div className="w-full py-2 px-2">
          <MarkdownEditor
            files={files}
            setFiles={setFiles}
            currentFile={currentFile}
            setCurrentFile={setCurrentFile}
          />
        </div>
      </div>
    </div>
  );
}

export default App
