export function getCurrentTime() {
    const date = new Date();
    const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; 
    return `${time} ${dateStr}`;
}