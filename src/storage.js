import { readFile, writeFile, access, mkdir, unlink } from 'fs/promises';

const DataPath = './data/';
mkdir(DataPath, { recursive: true });

export async function get(key) {
    if (await has(key)) {
        return JSON.parse(await readFile(DataPath + key));
    } else {
        throw new Error(`Key ${key} does not exist.`);
    }
}

export async function set(key, value) {
    if (typeof value == 'object') {
        value = JSON.stringify(value);
    }
    if (value === '{}') {
        await unlink(DataPath + key);
    } else {
        await writeFile(DataPath + key, value);
    }
}

export async function has(key) {
    try {
        await access(DataPath + key);
        return true;
    } catch (ex) {
        return false;
    }
}

export default { get, set, has };
