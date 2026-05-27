chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if(message.type === 'SCAN_IMAGE'){
        Promise.all(
            message.urls.map(async (url: string) => {
                try {
                    const res = await fetch(url)
                    if (!res.ok) return null
                    const blob = await res.blob()
                    // const base64 = await new Promise<string>((resolve) => {
                    //     const reader = new FileReader()
                    //     reader.onload = () => resolve(reader.result as string)
                    //     reader.readAsDataURL(blob)
                    // })
                    const buffer = await blob.arrayBuffer()
                    const bytes = Array.from(new Uint8Array(buffer))
                    return { bytes, type: blob.type }
                    // return { base64, type: blob.type }
                    // return blob
                } catch (e) {
                    console.log("Failed fetching url: ", e)
                    return null
                }
            })
        ).then(results => {
            sendResponse(results)
        })
    return true
    }
})