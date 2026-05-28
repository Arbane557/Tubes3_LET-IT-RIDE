export interface TrieNode {
    children: Map<string, TrieNode>
    isEnd: boolean
    failureLink: TrieNode | null
    patterns: string[]
}

function createNode(): TrieNode {
    return {
        children: new Map(),
        isEnd: false,
        failureLink: null,
        patterns: [],
    }
}

export function buildTrie(keywords: string[]): TrieNode {
    const root = createNode()
    
    for (const keyword of keywords) {
        let current = root
        for (let i = 0; i < keyword.length; i++) {
            const char = keyword[i]
            if (!current.children.has(char)) {
                current.children.set(char, createNode())
            }
            current = current.children.get(char)!
        }
        current.isEnd = true
        current.patterns.push(keyword)
    }
    
    return root
}

export function buildFailureLinks(root: TrieNode): void {
    const queue: TrieNode[] = []
    for (const child of root.children.values()) {
        child.failureLink = root
        queue.push(child)
    }

    while (queue.length > 0) {
        const current = queue.shift()!

        for (const [char, child] of current.children.entries()) {
            queue.push(child)

            let failure = current.failureLink
            while (failure !== null && !failure.children.has(char)) {
                failure = failure.failureLink
            }

            if (failure === null) {
                child.failureLink = root
            } else {
                child.failureLink = failure.children.get(char)!
                child.patterns.push(...child.failureLink.patterns)
            }
        }
    }
}

export interface ACResult {
    keyword: string
    offset: number
    length: number
}

export function ahoCorasick(text: string, keywords: string[]): ACResult[] {
    if (keywords.length === 0 || text.length === 0) return []

    const root = buildTrie(keywords)
    buildFailureLinks(root)

    const results: ACResult[] = []
    let current = root

    for (let i = 0; i < text.length; i++) {
        const char = text[i]

        while (current !== root && !current.children.has(char)) {
            current = current.failureLink!
        }

        if (current.children.has(char)) {
            current = current.children.get(char)!
        } else {
            current = root
        }

        if (current.patterns.length > 0) {
            for (const pattern of current.patterns) {
                const length = pattern.length
                const offset = i - length + 1
                results.push({
                    keyword: pattern,
                    offset,
                    length
                })
            }
        }
    }

    return results
}