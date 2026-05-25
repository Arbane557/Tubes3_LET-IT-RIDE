
export interface res {
    offset: number
    length: number
}

export function regex(text: string, pattern: string): res[] {
    const n = text.length
    const m = pattern.length
    const offsets: res[] = []

    try {
        
        const cleanPattern = pattern.trim()
        if (!cleanPattern) return []
        
        const newPattern = `${cleanPattern}\\s*\\d*` // specifically for numbers
        
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