import type { Match } from './type'

export function highlight(node: Text, matches: Match[]) {
    const text = node.textContent ?? ''

    if (matches.length === 0) {
        return 0
    }

    const sortedMatches = [...matches].sort((a, b) => a.offset - b.offset)

    const fragment = document.createDocumentFragment()
    let lastIndex = 0
    let highlighted = 0

    for (const match of sortedMatches) {
        const start = match.offset
        const end = match.offset + match.length

        // Skip invalid or overlapping matches
        if (start < lastIndex || start < 0 || end > text.length) {
            continue
        }

        // Add text before the match
        fragment.append(document.createTextNode(text.slice(lastIndex, start)))

        // Add highlighted match
        const mark = document.createElement('mark')
        mark.dataset.judolHighlight = 'true'
        mark.style.backgroundColor = 'yellow'
        mark.textContent = text.slice(start, end)

        fragment.append(mark)

        lastIndex = end
        highlighted += 1
    }

    fragment.append(document.createTextNode(text.slice(lastIndex)))
    node.replaceWith(fragment)

    return highlighted
}