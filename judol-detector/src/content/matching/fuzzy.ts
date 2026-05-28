// using leventhein

const prev = new Int32Array(256)
const arr = new Int32Array(256)
// i used this reference btw, goated material
//  | | |
//  | | |
//  V V V
// https://medium.com/@art3330/levenshtein-distance-fundamentals-817b6f7f1718
function levenshtein(a: string, b: string): number {
    for(let i: number = 1; i <= a.length; i++){
        arr[0] = i
        for(let j: number = 0; j <= b.length; j++){
            if (a[i-1] === b[j-1]) {
                arr[j] = prev[j-1]!
            } else {
                let result: number = 1 + Math.min(
                    prev[j-1]!,
                    arr[j-1]!,
                    prev[j]!
                )
                arr[j] = result
            }
        }
        prev.set(arr.subarray(0, b.length + 1))
    } 
    return prev[b.length]!
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
    let threshold: number = Math.floor((pattern.length) / 5)
    let textMemo = new Map<string, number>()

    while (i <= n - m + threshold) {
        let best = -1
        let min = Infinity

        for (let j = Math.max(1, m - threshold); j <= m + threshold; j++) {
            if (i + j > n) continue
            
            let subtext = text.slice(i, i + j)
            let d: number
            if (textMemo.has(`${pattern}|${subtext}`)) d = textMemo.get(`${pattern}|${subtext}`)!
            else{
                d = levenshtein(pattern, subtext)
                textMemo.set(`${pattern}|${subtext}`, d)
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