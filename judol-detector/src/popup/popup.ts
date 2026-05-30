const button = document.querySelector<HTMLButtonElement>('#rescanButton')
const blurButton = document.querySelector<HTMLButtonElement>('#blur-toggle')
const algoSelect = document.querySelector<HTMLSelectElement>('#algo-select')
const status = document.querySelector<HTMLParagraphElement>('#status')
const BLUR_STORAGE_KEY = 'judolBlurEnabled'
const statsTotalEl = document.querySelector<HTMLDivElement>('#stats-total')
const statsPerAlgEl = document.querySelector<HTMLDivElement>('#stats-per-alg')
const statsTimeEl = document.querySelector<HTMLDivElement>('#stats-time')
const statsExactEl = document.querySelector<HTMLDivElement>('#stats-exact')
const statsFuzzyEl = document.querySelector<HTMLDivElement>('#stats-fuzzy')
const statsRegexEl = document.querySelector<HTMLDivElement>('#stats-regex')

type HighlightResponse = {
    highlighted: Array<{ count: number }>
}

type AlgorithmChangeResponse = HighlightResponse & {
    success?: boolean
}

type PopupStats = {
    totalKeywordsFound: number
    keywordCounts: Record<string, number>
    keywordBuckets: Record<'exact' | 'fuzzy' | 'regex', Record<string, number>>
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

function getAlgorithmLabel(algorithm: string) {
    if (algorithm === 'kmp') return 'KMP'
    if (algorithm === 'bm') return 'BM'
    if (algorithm === 'aho-corasick') return 'Aho-Corasick'
    if (algorithm === 'rabin-karp') return 'Rabin-Karp'
    return algorithm
}

function renderKeywordGroup(container: HTMLDivElement, title: string, items: Record<string, number>) {
    container.replaceChildren()

    const card = document.createElement('div')
    card.className = 'stat-card'

    const heading = document.createElement('div')
    heading.className = 'stat-title'
    heading.textContent = title
    card.appendChild(heading)

    const entries = Object.entries(items).sort((a, b) => b[1] - a[1])

    if (entries.length === 0) {
        const empty = document.createElement('p')
        empty.className = 'empty'
        empty.textContent = 'None found'
        card.appendChild(empty)
        container.appendChild(card)
        return
    }

    const list = document.createElement('div')
    list.className = 'keyword-list'
    list.textContent = entries.map(([keyword, count]) => `${keyword}${count > 1 ? ` (${count})` : ''}`).join(', ')
    card.appendChild(list)
    container.appendChild(card)
}

chrome.storage.local.get(['selectedAlgorithm'], (result) => {
    if (algoSelect) {
        const storedAlgorithm = result.selectedAlgorithm as string | undefined
        algoSelect.value = storedAlgorithm || 'kmp'
    }
})

algoSelect?.addEventListener('change', async () => {
    const selected = algoSelect.value
    setStatus('Changing algorithm...')
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!tab?.id) return

        const response = await chrome.tabs.sendMessage<{ type: string; algorithm?: string }, AlgorithmChangeResponse>(tab.id, {
            type: 'SET_ALGORITHM',
            algorithm: selected,
        })

        if (chrome.runtime.lastError || !response) {
            setStatus('Refresh page to change algorithm.')
            return
        }

        const total = response.highlighted?.reduce((sum, item) => sum + item.count, 0) ?? 0
        setStatus(`Algorithm changed. Highlighted ${total} match(es).`)
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
    if (!statsTotalEl || !statsPerAlgEl || !statsTimeEl || !statsExactEl || !statsFuzzyEl || !statsRegexEl) return

    statsTotalEl.textContent = `Total keywords: ${stats.totalKeywordsFound ?? 0}`
    statsPerAlgEl.replaceChildren()
    statsTimeEl.replaceChildren()
    statsExactEl.replaceChildren()
    statsFuzzyEl.replaceChildren()
    statsRegexEl.replaceChildren()

    const per = (stats.perAlgorithm ?? {}) as Record<string, any>
    let maxMatches = 0
    for (const value of Object.values(per)) {
        if (value.matches > maxMatches) maxMatches = value.matches
    }

    for (const [alg, d] of Object.entries(per)) {
        const row = document.createElement('div')
        row.className = 'bar-row'

        const label = document.createElement('div')
        label.className = 'bar-label'
        label.textContent = `${getAlgorithmLabel(alg)}: ${d.matches} match(es)`

        const bar = document.createElement('div')
        bar.className = 'bar-track'

        const fill = document.createElement('div')
        fill.className = 'bar-fill'
        fill.style.width = maxMatches ? `${Math.round((d.matches / maxMatches) * 100)}%` : '0%'

        bar.appendChild(fill)
        row.append(label, bar)

        const el = document.createElement('div')
        el.textContent = `${getAlgorithmLabel(alg)}: ${Number(d.time).toFixed(2)} ms`

        statsPerAlgEl.append(row)
        statsTimeEl.append(el)
    }

    const buckets = (stats.keywordBuckets ?? {}) as Record<'exact' | 'fuzzy' | 'regex', Record<string, number>>
    renderKeywordGroup(statsExactEl, 'Exact', buckets.exact ?? {})
    renderKeywordGroup(statsFuzzyEl, 'Fuzzy', buckets.fuzzy ?? {})
    renderKeywordGroup(statsRegexEl, 'Regex', buckets.regex ?? {})
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
