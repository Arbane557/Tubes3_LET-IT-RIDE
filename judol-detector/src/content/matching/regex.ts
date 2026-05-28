
export interface res {
    offset: number
    length: number
}

export function regex(text: string, pattern?: string): res[] {
    const offsets: res[] = []

    try {
        const cleanPattern = pattern?.trim()

        const newPattern = cleanPattern ? `\\b${cleanPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\d{2,3})?\\b` : '\\b[a-z]+\\d{2,3}\\b'

        const regex = new RegExp(newPattern, 'gi')
        let match: RegExpExecArray | null

        while ((match = regex.exec(text)) !== null) {
            if (match[0].length == 0) {
                continue
            }
            offsets.push({ 
                offset: match.index, 
                length: match[0].length 
            })
        }
    } catch (e) {
        console.error(`Error Regex`)
    }

    return offsets
}

