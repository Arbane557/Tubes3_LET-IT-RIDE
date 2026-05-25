function computeBorder(pattern: string): number[] {
    const border: number[] = Array(pattern.length).fill(0)
    border[0] = 0

    const m = pattern.length
    let j = 0;
    let i = 1;

    while (i < m) {
        if (pattern[i] === pattern[j]) {
            border[i] = j + 1
            i++
            j++
        }
        else if (j > 0) {
            j = border[j - 1] ?? 0
        }
        else {
            border[i] = 0
            i++
        }
    }

    return border
}

// k nuh morris pratt
export function kmp(text: string, pattern: string): number[] {
    if (pattern.length === 0) return []

    const n = text.length
    const m = pattern.length
    const border = computeBorder(pattern)
    const offsets: number[] = []

    let i = 0  // text pointer
    let j = 0  // pattern pointer

    while (i < n) {
        if (pattern[j] === text[i]) {
            i++
            j++
        }

        if (j === m) {
            offsets.push(i - m)
            j = border[j - 1] ?? 0
        } else if (i < n && pattern[j] !== text[i]) {
            if (j > 0) j = border[j - 1] ?? 0
            else i++
        }
    }

    return offsets
}


function buildLast(pattern: string): number[] {
    const last: number[] = Array(128).fill(-1)  // ASCII
    for (let i = 0; i < pattern.length; i++) {
        last[pattern.charCodeAt(i)] = i  // last occurrence of each char
    }
    return last
}

export function bm(text: string, pattern: string): number[] {
    const n = text.length
    const m = pattern.length
    const last = buildLast(pattern)
    const offsets: number[] = []

    if (m > n) return []

    let i = m - 1  // text pointer

    while (i <= n - 1) {
        let j = m - 1  // pattern pointer

        while (j >= 0 && pattern[j] === text[i]) {
            i--
            j--
        }

        if (j < 0) {
            offsets.push(i + 1)
            i += m + 1 
        } else {
            const lo = last[text.charCodeAt(i)] ?? -1
            i += m - Math.min(j, lo + 1)
        }
    }

    return offsets
}