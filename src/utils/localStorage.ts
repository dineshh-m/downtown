/**
 * Save file to localStorage with error handling for quota exceeded
 * @param filename - The name of the file
 * @param fileContent - The content to save
 * @throws Error if localStorage is unavailable or quota is exceeded
 */
export function saveFile(filename: string, fileContent: string): void {
    try {
        localStorage.setItem(filename, fileContent);
    } catch (error) {
        if (error instanceof DOMException && 
            (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            throw new Error('Storage quota exceeded. Please delete some files or clear browser storage.');
        }
        throw new Error('Failed to save file to local storage.');
    }
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