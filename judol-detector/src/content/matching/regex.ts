
export interface res {
    offset: number
    length: number
}

export function regex(text: string, pattern?: string): res[] {
    const offsets: res[] = []

    try {
        const cleanPattern = pattern?.trim()

        const newPattern = cleanPattern && !/^\d+$/.test(cleanPattern)
            ? `\\b${cleanPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`
            : '(?<![a-z])[a-z]+\\d{2,4}(?!\\d)'
            
        const rgx = new RegExp(newPattern, 'gi')
        let match: RegExpExecArray | null

        while ((match = rgx.exec(text)) !== null) {
            if (match[0].length === 0) continue
            offsets.push({ 
                offset: match.index, 
                length: match[0].length 
            })
        }
    } catch (e) {
        console.error('Error Regex')
    }

    return offsets
}
