const button = document.querySelector<HTMLButtonElement>('#rescanButton')
const blurButton = document.querySelector<HTMLButtonElement>('#blur-toggle')
const status = document.querySelector<HTMLParagraphElement>('#status')
const BLUR_STORAGE_KEY = 'judolBlurEnabled'

type HighlightResponse = {
    highlighted: Array<{ count: number }>
}

function setStatus(message: string) {
    if (status) status.textContent = message
}

function setBlurButtonText(enabled: boolean) {
    if (blurButton) blurButton.textContent = enabled ? 'Blur: ON' : 'Blur: OFF'
}

function getBlurEnabled() {
    return new Promise<boolean>((resolve) => {
        chrome.storage.local.get([BLUR_STORAGE_KEY], (result) => {
            resolve(Boolean(result[BLUR_STORAGE_KEY]))
        })
    })
}

function setBlurEnabled(enabled: boolean) {
    return new Promise<void>((resolve) => {
        chrome.storage.local.set({ [BLUR_STORAGE_KEY]: enabled }, () => resolve())
    })
}

button?.addEventListener('click', async () => {
    button.disabled = true
    setStatus('Scanning...')

    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        if (!tab?.id) throw new Error('No active tab')

        const response = await chrome.tabs.sendMessage<{type: string}, HighlightResponse>(
            tab.id,
            {type: 'SCAN'}
        )

        const total = response.highlighted.reduce((sum, item) => sum + item.count, 0)
        setStatus(`Highlighted ${total} match(es).`)
    } catch {
        setStatus('Unable to rescan this page.')
    } finally {
        button.disabled = false
    }
})

getBlurEnabled().then(setBlurButtonText)

blurButton?.addEventListener('click', async () => {
    blurButton.disabled = true

    try {
        const enabled = !(await getBlurEnabled())
        await setBlurEnabled(enabled)
        setBlurButtonText(enabled)

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'SET_BLUR', enabled }).catch(() => {})
        }
    } catch {
        setStatus('Unable to toggle blur on this page.')
    } finally {
        blurButton.disabled = false
    }
})
