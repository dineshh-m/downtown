export function saveFile(filename: string, fileContent: string): void {
    localStorage.setItem(filename, fileContent);
}

export function loadFile(filename: string) {
    const fileContent = localStorage.getItem(filename);
    return fileContent || '';
}

export function deleteFile(filename: string) {
    localStorage.removeItem(filename);
}

export function getAllFiles() {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
        files.push(localStorage.key(i));
    }

    return files;
}