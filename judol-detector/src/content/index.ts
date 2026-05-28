import { highlight } from './highlight'
import { scrape, image_scrape } from './scraper'
import { match } from './matching'
import { tooltip } from './tooltip'
import { flagImage, replaceImage } from './ocr'
import { applyBlur, initBlur, updateBlur } from './blur'
import keywordText from '../../keywords/keyword.txt?raw'

console.log('Judol Detector')

const TEXT_POOL = keywordText.split(/\r?\n/).map((t: string) => t.trim()).filter(Boolean)

function clearHighlights() {
    document.querySelectorAll('mark[data-judol-highlight="true"]').forEach(mark => {
        mark.replaceWith(document.createTextNode(mark.textContent ?? ''))
    })
}

const imagePlaceholder = 'https://cdn.polyspeak.ai/polyai/800d72ca9aefee47bd749a1ea252e377.jpeg'

type StatsState = {
    totalKeywordsFound: number
    keywordCounts: Record<string, number>
    perAlgorithm: Record<string, { matches: number; time: number }>
}

const liveStats: StatsState = {
    totalKeywordsFound: 0,
    keywordCounts: {},
    perAlgorithm: {},
}

function stats() {
    return {
        totalKeywordsFound: liveStats.totalKeywordsFound,
        keywordCounts: { ...liveStats.keywordCounts },
        perAlgorithm: Object.fromEntries(
            Object.entries(liveStats.perAlgorithm).map(([algorithm, value]) => [algorithm, { ...value }])
        ),
    }
}

function updateStat() {
    if (chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'STATS_UPDATE', stats: stats() }).catch(() => {})
    } else {
        console.warn("Extension context invalidated. Please refresh the page.");
    }
}

function recordStats(matches: Array<{ keyword: string; algorithm: string; time: number }>, count: number) {
    liveStats.totalKeywordsFound += count

    for (const match of matches) {
        liveStats.keywordCounts[match.keyword] = (liveStats.keywordCounts[match.keyword] ?? 0) + 1

        const algorithm = match.algorithm ?? 'unknown'
        if (!liveStats.perAlgorithm[algorithm]) {
            liveStats.perAlgorithm[algorithm] = { matches: 0, time: 0 }
        }

        liveStats.perAlgorithm[algorithm].matches += 1
        liveStats.perAlgorithm[algorithm].time += Number(match.time) || 0
    }
}

function resetStats() {
    liveStats.totalKeywordsFound = 0
    liveStats.keywordCounts = {}
    liveStats.perAlgorithm = {}
}

tooltip()
initBlur()
updateBlur()

async function scan() {
    const storage = await chrome.storage.local.get('selectedAlgorithm')
    const selectedAlgorithm = storage.selectedAlgorithm || 'kmp'

    clearHighlights()
    resetStats()

    console.log('    Scraping text...')
    const scraped = scrape()
    console.log(scraped, 'scraped text')
    console.log('    Scraping image...')
    const scrapedimg = await image_scrape()
    const highlighted = []

    console.log('Scraping successful, scanning...')

    type ScrapedItem = { node?: Text, img?: HTMLImageElement, type: 'text' | 'image', text: string }
    const ScrapedItems = []
    const censoredimg = []
    
    for (const { node, text } of scraped) {
        ScrapedItems.push({ node: node, text: text, type: 'text' as const })
    }

    for (const { img, text } of scrapedimg) {
        ScrapedItems.push({ img: img, text: text, type: 'image' as const })
    }

    const sorted: ScrapedItem[] =  ScrapedItems.sort((a, b) => {
        const nodeA = a.type === 'text' ? a.node : a.img
        const nodeB = b.type === 'text' ? b.node : b.img
        const position = nodeA!.compareDocumentPosition(nodeB!)
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1  // b comes after a
        if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1   // b comes before a
        return 0
    })
    
    for (const { node, img, type, text } of sorted) {
        const matches = match(text, TEXT_POOL, selectedAlgorithm)

        if (matches.length > 0) {
            if (type === 'text'){
                const count = highlight(node!, matches)

                recordStats(matches, count)
                updateStat()

                highlighted.push({ 
                    text: node!.textContent ?? '', 
                    matches, count 
                })
            } else if (type === 'image'){
                censoredimg.push({img, text, matches})
                replaceImage(img!, imagePlaceholder)
                flagImage(img!)
            }
        }
        await new Promise(r => setTimeout(r, 0))
    }

    updateStat()

    return { highlighted, censoredimg }
}

scan().then(({ highlighted, censoredimg }) => {
    console.log('judol highlighted', highlighted)
    console.log('censored image: ', censoredimg )
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if(message.type === 'SCAN'){
        scan().then(({ highlighted }) => {
            sendResponse({ highlighted })
        })
    }

    if (message.type === 'GET_STATS') {
        sendResponse({ stats: stats() })
    }

    if (message.type === 'SET_BLUR') {
        applyBlur(Boolean(message.enabled))
        sendResponse({ blurEnabled: Boolean(message.enabled) })
    }

    if (message.type === 'SET_ALGORITHM') {
        chrome.storage.local.set({ selectedAlgorithm: message.algorithm }).then(() => {
            scan().then(({ highlighted }) => {
                sendResponse({ success: true, highlighted })
            })
        })
        return true
    }

    return true
})
