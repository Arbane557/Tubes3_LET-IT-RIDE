const RESCAN_MESSAGE = 'JUDOL_RESCAN'

const button = document.querySelector<HTMLButtonElement>('#rescanButton')
const status = document.querySelector<HTMLParagraphElement>('#status')

function setStatus(message: string) {
    if (status) status.textContent = message
}

button?.addEventListener('click', async () => {
    button.disabled = true
    setStatus('Scanning...')

    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        if (!tab?.id) throw new Error('No active tab')

        const response = await chrome.tabs.sendMessage<{type: string}, {highlighted: number}>(
            tab.id,
            {type: 'SCAN'}
        )
        setStatus(`Highlighted ${response.highlighted} match(es).`)
    } catch {
        setStatus('Unable to rescan this page.')
    } finally {
        button.disabled = false
    }
})
