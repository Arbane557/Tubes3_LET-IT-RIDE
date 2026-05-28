import { highlight } from './highlight'
import { scrape, image_scrape } from './scraper'
import { match } from './matching'
import { tooltip } from './tooltip'
import { flagImage, replaceImage } from './ocr'
import keywordText from '../../keywords/keyword.txt?raw'

console.log('Judol Detector')

const TEXT_POOL = keywordText.split(/\r?\n/).map((t: string) => t.trim()).filter(Boolean)

function clearHighlights() {
    document.querySelectorAll('mark[data-judol-highlight="true"]').forEach(mark => {
        mark.replaceWith(document.createTextNode(mark.textContent ?? ''))
    })
}

const imagePlaceholder = 'https://cdn.polyspeak.ai/polyai/800d72ca9aefee47bd749a1ea252e377.jpeg'

tooltip()

async function scan() {
    const type = 'kmp' // or 'bm'

    clearHighlights()

    console.log('    Scraping text...')
    const scraped = scrape()
    console.log('    Scraping image...')
    const scrapedimg = await image_scrape()
    const highlighted = []

    console.log('Scraping successful, scanning...')

    for (const { node, text } of scraped) {
        const matches = match(text, TEXT_POOL, type)

        if (matches.length > 0) {
            const count = highlight(node, matches)

            highlighted.push({ 
                text: node.textContent ?? '', 
                matches, count 
            })
        }
        await new Promise(r => setTimeout(r, 0))
    }

    const censoredimg = []
    let imgInfo: { img: HTMLImageElement, text: string }
    for(const imgInfo of scrapedimg){
        const matches = match(imgInfo.text, TEXT_POOL, type)
        if(matches.length > 0){
            censoredimg.push({imgInfo, matches})
            replaceImage(imgInfo.img, imagePlaceholder)
            flagImage(imgInfo.img)
        }
    }

    return { highlighted, censoredimg }
}

scan().then(({ highlighted, censoredimg }) => {
    console.log('judol highlighted', highlighted)
    console.log('censored image: ', censoredimg )
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if(message.type === 'SCAN'){
        scan().then(({ highlighted }) => sendResponse({ highlighted }))
    }
    return true
})
