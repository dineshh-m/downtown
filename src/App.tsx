import Navbar from "./components/Navbar";
import MarkdownEditor from './components/MarkdownEditor';
import Sidebar from "./components/Sidebar";
import { getAllFiles } from "./utils/localStorage";

import { useState } from "react";

function App() {
  const [files, setFiles] = useState(getAllFiles);
  const [currentFile, setCurrentFile] = useState({filename: "Untitled " + new Date().toUTCString(), content: ""});

  return (
    <div className="w-full">
      <Navbar />
      <div className="mt-16 z-10 flex">
        <Sidebar files={files} setCurrentFile={setCurrentFile} />
        <MarkdownEditor files={files} setFiles={setFiles} currentFile={currentFile} setCurrentFile={setCurrentFile}/>
      </div>
    </div>
  );
}

export default App
