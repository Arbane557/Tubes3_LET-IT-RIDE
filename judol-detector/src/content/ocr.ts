import { createWorker, PSM } from 'tesseract.js'

async function preprocess(blob: Blob): Promise<Blob> {
    const bmap = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = bmap.width
    canvas.height = bmap.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bmap, 0, 0)
    bmap.close()

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i]! + 0.587 * data[i+1]! + 0.114 * data[i+2]!
        data[i] = data[i+1] = data[i+2] = avg
    }
    ctx.putImageData(imageData, 0, 0)

    let finalCanvas = canvas
    if (canvas.width < 600) {
        const scaled = document.createElement('canvas')
        scaled.width = canvas.width * 2
        scaled.height = canvas.height * 2
        const sctx = scaled.getContext('2d')!
        sctx.imageSmoothingEnabled = false
        sctx.drawImage(canvas, 0, 0, scaled.width, scaled.height)
        finalCanvas = scaled
    }

    return new Promise<Blob>((resolve, reject) => {
        finalCanvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/png')
    })
}

function bytesToBlob(bytes: number[], type: string): Blob {
    return new Blob([new Uint8Array(bytes)], { type })
}

export async function scanImages(files: { bytes: number[], type: string}[]): Promise<string[]> {
    const worker = await createWorker('eng+ind')
    await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        tessedit_char_whitelist: '',
    })
    let texts: string[] = []
    for(let file of files){
        if(!file){
            texts.push("")
            continue
        }
        try{
            const blob = bytesToBlob(file.bytes, file.type)
            const processedblob = await preprocess(blob)
            const { data: { text } } = await worker.recognize(processedblob)
            texts.push(text.trim())
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