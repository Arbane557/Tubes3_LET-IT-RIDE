// using leventhein
import { normalize } from '../homoglyph'

const prev = new Float32Array(256)
const curr = new Float32Array(256)

function subCost(a: string, b: string): number {
    if (a === b) return 0
    if (normalize(a) === normalize(b)) return 0.5  // visually similar per homoglyph map
    return 1
}

// i used this reference btw, goated material
//  | | |
//  | | |
//  V V V
// https://medium.com/@art3330/levenshtein-distance-fundamentals-817b6f7f1718
function levenshtein(a: string, b: string): number {
    for (let j = 0; j <= b.length; j++) 
        prev[j] = j
    for (let i = 1; i <= a.length; i++) {
        curr[0] = i
        for (let j = 1; j <= b.length; j++) {
            curr[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : Math.min(
                prev[j - 1] + subCost(a[i - 1], b[j - 1]),
                curr[j - 1] + 1,
                prev[j] + 1
            )
        }
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

            const d = levenshtein(pattern, text.slice(i, i + len))
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