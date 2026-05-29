const button = document.querySelector<HTMLButtonElement>('#rescanButton')
const blurButton = document.querySelector<HTMLButtonElement>('#blur-toggle')
const algoSelect = document.querySelector<HTMLSelectElement>('#algo-select')
const status = document.querySelector<HTMLParagraphElement>('#status')
const BLUR_STORAGE_KEY = 'judolBlurEnabled'
const statsTotalEl = document.querySelector<HTMLDivElement>('#stats-total')
const statsPerAlgEl = document.querySelector<HTMLDivElement>('#stats-per-alg')
const statsTimeEl = document.querySelector<HTMLDivElement>('#stats-time')
const statsKeywordsEl = document.querySelector<HTMLDivElement>('#stats-keywords')
const algoSelect = document.querySelector<HTMLSelectElement>('#algo-select')

type HighlightResponse = {
    highlighted: Array<{ count: number }>
}

type PopupStats = {
    totalKeywordsFound: number
    keywordCounts: Record<string, number>
    perAlgorithm: Record<string, { matches: number; time: number }>
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

chrome.storage.local.get(['selectedAlgorithm'], (result) => {
    if (algoSelect) {
        algoSelect.value = result.selectedAlgorithm || 'kmp'
    }
})

algoSelect?.addEventListener('change', async () => {
    const selected = algoSelect.value
    setStatus('Changing algorithm...')
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!tab?.id) return

        chrome.tabs.sendMessage(tab.id, { type: 'SET_ALGORITHM', algorithm: selected }, (response) => {
            if (chrome.runtime.lastError) {
                setStatus('Refresh page to change algorithm.')
            } else {
                setStatus('Algorithm changed. Scanning...')
            }
        })
    } catch {
        setStatus('Error changing algorithm.')
    }
})

function requestCurrentStats() {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
        if (!tab?.id) return

        try {
            const response = await chrome.tabs.sendMessage<{ type: string }, { stats: PopupStats }>(tab.id, {
                type: 'GET_STATS',
            })

            if (response?.stats) updateStatsUI(response.stats)
        } catch {
            // ignore
        }
    })
}

button?.addEventListener('click', async () => {
    button.disabled = true
    setStatus('Scanning...')

    try {
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true})
        if (!tab?.id) throw new Error('No active tab')

        const algorithm = algoSelect?.value ?? 'kmp'
        const response = await chrome.tabs.sendMessage<{type: string, algorithm?: string}, HighlightResponse>(
            tab.id,
            {type: 'SCAN', algorithm}
        )

        const total = response.highlighted.reduce((sum, item) => sum + item.count, 0)
        setStatus(`Highlighted ${total} match(es).`)
    } catch {
        setStatus('Unable to rescan this page.')
    } finally {
        button.disabled = false
    }
})

function updateStatsUI(stats: any) {
    if (!statsTotalEl || !statsPerAlgEl || !statsTimeEl || !statsKeywordsEl) return

    statsTotalEl.textContent = `Total keywords: ${stats.totalKeywordsFound ?? 0}`
    statsPerAlgEl.replaceChildren()
    statsTimeEl.replaceChildren()
    statsKeywordsEl.replaceChildren()

    const per = (stats.perAlgorithm ?? {}) as Record<string, any>
    let maxMatches = 0
    for (const value of Object.values(per)) {
        if (value.matches > maxMatches) maxMatches = value.matches
    }

    for (const [alg, d] of Object.entries(per)) {
        const row = document.createElement('div')
        row.style.marginBottom = '6px'

        const label = document.createElement('div')
        label.textContent = `${alg}: ${d.matches} match(es)`

        const bar = document.createElement('div')
        bar.style.height = '8px'
        bar.style.background = '#e5e7eb'
        bar.style.marginTop = '2px'

        const fill = document.createElement('div')
        fill.style.height = '100%'
        fill.style.background = '#111'
        fill.style.width = maxMatches ? `${Math.round((d.matches / maxMatches) * 100)}%` : '0%'

        bar.appendChild(fill)
        row.append(label, bar)

        const el = document.createElement('div')
        el.textContent = `${alg}: ${d.time} ms`

        statsPerAlgEl.append(row)
        statsTimeEl.append(el)
    }

    const keywordCounts = (stats.keywordCounts ?? {}) as Record<string, number>
    const sortedKeywords = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1])

    if (sortedKeywords.length === 0) {
        const empty = document.createElement('div')
        empty.textContent = 'Found keywords: -'
        statsKeywordsEl.appendChild(empty)
        return
    }

    const title = document.createElement('div')
    title.textContent = 'Found keywords:'
    statsKeywordsEl.appendChild(title)

    const list = document.createElement('div')
    list.style.marginTop = '4px'
    list.textContent = sortedKeywords.map(([keyword, count]) => `${keyword} (${count})`).join(', ')
    statsKeywordsEl.appendChild(list)
}

chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'STATS_UPDATE' && message.stats) {
        updateStatsUI(message.stats)
    }
})

requestCurrentStats()

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
