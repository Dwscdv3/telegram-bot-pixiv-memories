export function toInt(str: string) {
    const i = parseInt(str);
    if (Number.isNaN(i)) throw new Error(`Cannot convert "${str}" to int.`);
    return i;
}
