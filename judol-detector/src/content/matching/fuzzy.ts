import { homoglyphMap } from '../homoglyph'  // export the map itself

const prev = new Float32Array(256)
const curr = new Float32Array(256)

function subCost(a: string, b: string): number {
    if (a === b) return 0
    if ((homoglyphMap.get(a) ?? a) === (homoglyphMap.get(b) ?? b)) return 0.5
    return 1
}

// i used this reference btw, goated material
//  | | |
//  | | |
//  V V V
// https://medium.com/@art3330/levenshtein-distance-fundamentals-817b6f7f1718
function levenshtein(a: string[], b: string[], threshold: number): number {
    for (let j = 0; j <= b.length; j++) 
        prev[j] = j
    for (let i = 1; i <= a.length; i++) {
        curr[0] = i
        let minRow = Infinity
        for (let j = 1; j <= b.length; j++) {
            curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : Math.min(
                prev[j - 1]! + subCost(a[i - 1]!, b[j - 1]!),
                curr[j - 1]! + 1,
                prev[j]! + 1
            )
            if(curr[j] < minRow) minRow = curr[j]
        }
        if(minRow > threshold) return minRow
        prev.set(curr.subarray(0, b.length + 1))
    }
    return prev[b.length]!
}

function isWordChar(ch: string | undefined) {
    return ch !== undefined && /[a-z0-9]/i.test(ch)
}

export interface res {
    offset: number
    length: number
}

export function fuzzy(text: string, pattern: string): res[] {
    const n = text.length
    const m = pattern.length

    if (m < 4) return []

    const arrPattern = Array.from(pattern) 
    
    const threshold = Math.max(1, Math.floor(m / 5))
    const results: res[] = []
    let i = 0

    while (i <= n - m + threshold) {
        if (i > 0 && isWordChar(text[i - 1])) { i++; continue }

        let bestLen = -1
        let bestDist = Infinity

        for (let len = m - threshold; len <= m + threshold; len++) {
            if (i + len > n) break
            if (isWordChar(text[i + len])) continue
            
            const slicedText = text.slice(i, i + len)
            const arrSliced = Array.from(slicedText)

            const d = levenshtein(arrPattern, arrSliced, threshold)
            
            if (d < bestDist) {
                bestDist = d
                bestLen = len
                if (d === 0) break
            }
        }

        if (bestLen !== -1 && bestDist <= threshold) {
            results.push({ offset: i, length: bestLen })
            i += bestLen
        } else {
            i++
        }
    }

    return results
}