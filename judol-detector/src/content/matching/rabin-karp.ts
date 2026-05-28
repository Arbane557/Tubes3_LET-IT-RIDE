function normalizeInput(s: string): string {
    return s.normalize("NFKC").toLowerCase().replace(/\u200B/g, "");
}

export function rabinKarp(text: string, pattern: string): number[] {
    text = normalizeInput(text);
    pattern = normalizeInput(pattern);

    const offsets: number[] = [];

    const n = text.length;
    const m = pattern.length;

    if (m === 0 || m > n) {
        return offsets;
    }

    const base = 257;
    const prime = 1_000_000_007;

    let patternHash = 0;
    let textHash = 0;
    let h = 1;

    for (let i = 0; i < m - 1; i++) {
        h = (h * base) % prime;
    }

    for (let i = 0; i < m; i++) {
        patternHash = (base * patternHash + pattern.charCodeAt(i)) % prime;

        textHash = (base * textHash + text.charCodeAt(i)) % prime;
    }

    for (let i = 0; i <= n - m; i++) {
        if (patternHash === textHash) {
            let match = true;

            for (let j = 0; j < m; j++) {
                if (text[i + j] !== pattern[j]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                offsets.push(i);
            }
        }

        if (i < n - m) {
            const outgoing = text.charCodeAt(i);
            const incoming = text.charCodeAt(i + m);
            textHash = (base * ((textHash - outgoing * h + prime) % prime) + incoming) % prime;
        }
    }

    return offsets;
}