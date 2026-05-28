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
    chrome.runtime.sendMessage({ type: 'STATS_UPDATE', stats: stats() }).catch(() => {})
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
    const type = 'kmp' // or 'bm'

    clearHighlights()
    resetStats()

    const scraped = scrape()
    const scrapedimg = await image_scrape()
    const highlighted = []

    console.log('Scraping successful, scanning...')

    for (const { node, text } of scraped) {
        const matches = match(text, TEXT_POOL, type)

        if (matches.length > 0) {
            const count = highlight(node, matches)

            recordStats(matches, count)
            updateStat()

            highlighted.push({ 
                text: node.textContent ?? '', 
                matches, count 
            })
        }
        await new Promise(r => setTimeout(r, 0))
    }

    let imgInfo: { img: HTMLImageElement, text: string }
    for(imgInfo of scrapedimg){
        const matches = match(imgInfo.text, TEXT_POOL, type)
        if(matches.length > 0){
            replaceImage(imgInfo.img, imagePlaceholder)
            flagImage(imgInfo.img)
        }
    }

    updateStat()

    return { highlighted, scrapedimg }
}

scan().then(({ highlighted, scrapedimg }) => {
    console.log('judol highlighted', highlighted)
    console.log('found image: ', scrapedimg)
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

    return true
})
