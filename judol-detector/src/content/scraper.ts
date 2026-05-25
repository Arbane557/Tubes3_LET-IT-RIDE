export function scrape(): { node: Text; text: string }[] {
    const res: { node: Text, text: string }[] = []

    const scraper = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const parent = node.parentElement
                const tag = parent?.tagName
                if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT
                if (parent?.closest('highlight[data-judol-highlight]')) return NodeFilter.FILTER_REJECT
                return NodeFilter.FILTER_ACCEPT
            }
        }
    )

    let node: Text
    while((node = scraper.nextNode() as Text)) {
        if (node.textContent.trim()) {
            res.push({node, text: node.textContent})
        }
    }

    return res

}
