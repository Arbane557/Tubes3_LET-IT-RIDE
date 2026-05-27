import { highlight } from './highlight'
import { scrape, image_scrape } from './scraper'
import { match } from './matching'
import { tooltip } from './tooltip'
import keywordText from '../../keywords/keyword.txt?raw'

console.log('Judol Detector')

const TEXT_POOL = keywordText.split(/\r?\n/).map((t: string) => t.trim()).filter(Boolean)

function clearHighlights() {
    document.querySelectorAll('mark[data-judol-highlight="true"]').forEach(mark => {
        mark.replaceWith(document.createTextNode(mark.textContent ?? ''))
    })
}

tooltip()

async function scan() {
    const type = 'kmp' // or 'bm'

    clearHighlights()

    const scraped = scrape()
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

    
    return { highlighted, scrapedimg }
}

scan().then(({ highlighted, scrapedimg }) => {
    console.log('judol highlighted', highlighted)
    console.log('found image: ', scrapedimg)
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // if(message.type === 'FETCH_IMAGE'){
    //     Promise.all(
    //         message.urls.map(async (url: string) => {
    //             try {
    //                 return url
    //             } catch {
    //                 return null
    //             }
    //         })
    //     )
    // } else {    
        scan().then(highlighted => sendResponse({ highlighted }))
        return true
    // }
})
