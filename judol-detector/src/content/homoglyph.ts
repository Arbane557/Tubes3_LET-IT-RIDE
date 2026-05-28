import homoglyphRaw from '../../keywords/homoglyph.txt?raw'

const map = new Map<string, string>()

for (const line of homoglyphRaw.split(/\r?\n/)) {
    if (!line.trim()) continue
    const res = line[0]!
    for (const ch of [...line].slice(1)) {
        if (ch !== res) map.set(ch, res)
    }
}

export function normalize(text: string): string {
    return [...text].map(ch => map.get(ch) ?? ch).join('')
}