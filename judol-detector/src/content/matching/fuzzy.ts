// using leventhein

// can be optimised with dp (but idk ntar aja)
function levenshtein(a: string, b: string, memo: Map<string, number> = new Map()): number {
    if (b.length === 0) return a.length
    if (a.length === 0) return b.length

    const key1 = `${a}|${b}`
    const key2 = `${b}|${a}`
    if (memo.has(key1)) return memo.get(key1)!
    else if (memo.has(key2)) return memo.get(key2)!

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
    memo.set(key1, result)
    memo.set(key2, result)
    return result
}

export interface res {
    offset: number
    length: number
}

export function fuzzy(text: string, pattern: string): res[] {
    const n = text.length
    const m = pattern.length
    const offsets: res[] = []

    let i = 0
    let threshold = 0
    let textMemo = new Map<string, number>()

    if (pattern.length <= 5){
        threshold = 1
    } else {
        threshold = 2
    }

    while (i <= n - m + threshold) {
        let best = -1
        let min = Infinity

        for (let j = Math.max(1, m - threshold); j <= m + threshold; j++) {
            if (i + j > n) continue
            
            let subtext = text.slice(i, i + j)
            let d: number
            if (textMemo.has(`${pattern}|${subtext}`)) d = textMemo.get(`${pattern}|${subtext}`)!
            else if (textMemo.has(`${subtext}|${pattern}`)) d = textMemo.get(`${subtext}|${pattern}`)!
            else{
                d = levenshtein(pattern, subtext, textMemo)
                textMemo.set(`${pattern}|${subtext}`, d)
                textMemo.set(`${subtext}|${pattern}`, d)
            }
            if (d < min) {
                min = d
                best = j
                if (min === 0) break
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