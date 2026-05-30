import homoglyphRaw from '../../keywords/homoglyph.txt?raw'

const map = new Map<string, string>()
export const homoglyphMap = map

for (const line of homoglyphRaw.split(/\r?\n/)) {
    if (!line.trim()) continue
    const res = line[0]!
    for (const ch of [...line].slice(1)) {
        if (ch !== res) map.set(ch, res)
    }
}

export function normalize(text: string): string {
    let result = ''
    for (let i = 0; i < text.length; i++) {
        const ch = text[i]!
        result += map.get(ch) ?? ch
    }
    return result
}