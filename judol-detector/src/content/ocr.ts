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