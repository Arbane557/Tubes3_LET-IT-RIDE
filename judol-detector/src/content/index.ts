import { highlight } from './highlight'
import { scrape } from './scraper'
import { match } from './matching'
import keywordText from '../../keywords/keyword.txt?raw'

console.log('Judol Detector')

const TEXT_POOL = keywordText.split(/\r?\n/).map((t: string) => t.trim()).filter(Boolean)

function clearHighlights() {
    document.querySelectorAll('mark[data-judol-highlight="true"]').forEach(mark => {
        mark.replaceWith(document.createTextNode(mark.textContent ?? ''))
    })
}

function scan() {
    const type = 'kmp' // or 'bm'

    clearHighlights()

    const res = scrape()
        .map(({ node, text }) => ({
            node,
            matches: match(text, TEXT_POOL, type)
        }))
        .filter(r => r.matches.length > 0)

    const highlighted = res.map(({ node, matches }) => {
        const count = highlight(node, matches)

        return {
            text: node.textContent ?? '',
            matches,
            count
        }
    })

    return highlighted
}

const highlighted = scan()
console.log('judol highlighted', highlighted)

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const highlighted = scan()
    sendResponse({highlighted})
})
