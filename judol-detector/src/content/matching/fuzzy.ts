// using leventhein

function levenshtein(a: string, b: string): number {
    const r = a.length + 1
    const c = b.length + 1

    const dp: number[][] = []

    for (let i = 0; i < r; i++) {
        dp[i] = []
        for (let j = 0; j < c; j++) {
            dp[i]![j] = 0
        }
    }

    for (let i = 0; i < r; i++) dp[i]![0] = i
    for (let j = 0; j < c; j++) dp[0]![j] = j

    for (let i = 1; i < r; i++) {
        for (let j = 1; j < c; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i]![j] = dp[i - 1]![j - 1]
            } else {
                dp[i]![j] = Math.min(
                    dp[i - 1]![j] + 1,
                    dp[i]![j - 1] + 1,
                    dp[i - 1]![j - 1] + 1
                )
            }
        }
    }

    return dp[r - 1]![c - 1]

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

            const d = levenshtein(pattern, text.slice(i, i + j))
            if (d < min) {
                min = d
                best = j
            }
        }

        if (best !== -1 && min <= threshold) {
            offsets.push({ offset: i, length: best })
            i += best
        }
        else i++
    }

    return offsets
}
