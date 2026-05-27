import { createWorker } from 'tesseract.js'

function bytesToBlob(bytes: number[], type: string): Blob {
    return new Blob([new Uint8Array(bytes)], { type })
}

export async function scanImages(files: { bytes: number[], type: string}[]): Promise<string[]> {
    const worker = await createWorker('eng')
    let texts: string[] = []
    for(let file of files){
        if(!file){
            texts.push("")
            continue
        }
        try{
            const blob = bytesToBlob(file.bytes, file.type)
            const { data: { text } } = await worker.recognize(blob)
            texts.push(text)
        } catch (e) {
            console.log("Failed in scanning: ", e)
            texts.push("")
        }
    }
    return texts
}

export function flagImage(img: HTMLImageElement){
    const wrapper = document.createElement('div')
    wrapper.style.cssText = `
        position: relative;
        display: inline-block;
        width: ${img.offsetWidth}px;
        height: ${img.offsetHeight}px;
    `

    const overlay = document.createElement('div')
    overlay.style.cssText = `
        position: absolute;
        inset: 0;
        background: rgba(238, 255, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        z-index: 9999;
    `
    overlay.textContent = 'Terindikasi judol bozo 😂🙏'

    img.parentElement?.insertBefore(wrapper, img)
    wrapper.appendChild(img)
    wrapper.appendChild(overlay)
}

export function replaceImage(img: HTMLImageElement, src: string){
    img.removeAttribute("srcset")
    img.removeAttribute("sizes")

    img.src = src
    img.srcset = src

    img.loading = "eager"
}