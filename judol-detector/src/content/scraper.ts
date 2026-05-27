export function scrape(): { node: Text; text: string }[] {
    const res: { node: Text, text: string }[] = []

    const text_scraper = document.createTreeWalker(
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
    while((node = text_scraper.nextNode() as Text)) {
        if (node.textContent.trim()) {
            res.push({node, text: node.textContent})
        }
    }

    return res
}

async function waitImage(img: HTMLImageElement): Promise <boolean> {
    if (img.complete && img.naturalWidth > 0) return true

    const load = new Promise<boolean>((resolve) => {
        img.addEventListener('load', () => resolve(true))
        img.addEventListener('error', () => resolve(false))
    })

    const timeout = new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), 5000)
    )

    return Promise.race([load, timeout])
}

export async function image_scrape(): Promise<HTMLImageElement[]> {
    const img_scraper = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node) => {
                const tag = node.nodeName
                if(tag === 'IMG'){
                    const img = node as HTMLImageElement
                    // if (img.closest('highlight[data-judol-highlight]')) return NodeFilter.FILTER_REJECT
                    return NodeFilter.FILTER_ACCEPT
                } return NodeFilter.FILTER_SKIP
            }
        }
    )

    let filteredimg: HTMLImageElement[] = []
    // let srcs: string[] = []

    let node: HTMLImageElement
    while((node = img_scraper.nextNode() as HTMLImageElement)) {
        // console.log(node.src, node.naturalWidth, node.complete)
        const loaded = await waitImage(node)
        if(!loaded) continue

        if(node.naturalWidth < 50 || node.naturalHeight < 50) continue
        const style = window.getComputedStyle(node)
        if(style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue

        filteredimg.push(node)
        // srcs.push(node.src)
    }

    return filteredimg
    // return chrome.runtime.sendMessage({ type: 'FETCH_IMAGE', urls: srcs })
}
