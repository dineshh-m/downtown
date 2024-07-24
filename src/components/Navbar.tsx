export default function Navbar() {
  
    return (
      <nav className="bg-lime w-full px-2 py-3 shadow-sm fixed left-0 top-0 h-16 z-30 bg-white flex justify-between items-center">
        <div className="flex gap-1 items-center font-extralight font-mono">
          <img src="markdown.svg" width={30} height={30} alt="Markdown logo" />
          <h1 className="text-2xl font-bold">Downtown</h1>
        </div>

        <div className="flex justify-center items-center">
          {/* <button>
            <img src="save.svg" alt="" width={25} height={25} />
          </button> */}
        </div>
      </nav>
    );
}