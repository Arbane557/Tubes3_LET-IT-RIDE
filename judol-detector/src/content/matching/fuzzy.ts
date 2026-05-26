// using leventhein

// can be optimised with dp (but idk ntar aja)
function levenshtein(a: string, b: string, memo: Map<string, number> = new Map()): number {
    if (b.length === 0) return a.length
    if (a.length === 0) return b.length

    const key = `${a.length},${b.length}`
    if (memo.has(key)) return memo.get(key)!

    let result: number
    if (a[0] === b[0]) {
        result = levenshtein(a.slice(1), b.slice(1), memo)
    } else {
        result = 1 + Math.min(
            levenshtein(a.slice(1), b, memo),
            levenshtein(a, b.slice(1), memo),
            levenshtein(a.slice(1), b.slice(1), memo)
        )
    } 
    memo.set(key, result)
    return result
}

const threshold = 2 // tuning on god idk ini ngaturnya gimana

export interface res {
    offset: number
    length: number
}

export function fuzzy(text: string, pattern: string): res[] {
    const n = text.length
    const m = pattern.length
    const offsets: res[] = []

    let i = 0

    while (i <= n - m + threshold) {
        let best = -1
        let min = Infinity

        for (let j = Math.max(1, m - threshold); j <= m + threshold; j++) {
            if (i + j > n) continue

            const d = levenshtein(pattern, text.slice(i, i + j), new Map())
            if (d < min) {
                min = d
                best = j
            }
        }

        if (best !== -1 && min <= threshold) {
            offsets.push( { offset: i, length: best })
            i += best
        }
        else i++
    }

    return offsets
}
