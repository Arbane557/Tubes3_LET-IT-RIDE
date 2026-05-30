let toolTipElement: HTMLElement | null = null

function getAlgorithmLabel(algorithm: string) {
    if (algorithm === 'kmp') return 'Exact / KMP'
    if (algorithm === 'bm') return 'Exact / Boyer-Moore'
    if (algorithm === 'aho-corasick') return 'Exact / Aho-Corasick'
    if (algorithm === 'rabin-karp') return 'Exact / Rabin-Karp'
    if (algorithm === 'fuzzy') return 'Fuzzy'
    if (algorithm === 'regex') return 'Regex'
    return algorithm
}

function initTooltip(): HTMLElement {
    if (toolTipElement) return toolTipElement

    toolTipElement = document.createElement('div')

    toolTipElement.style.position = 'fixed'
    toolTipElement.style.pointerEvents = 'none'
    toolTipElement.style.zIndex = '67676767'
    toolTipElement.style.borderRadius = '6px'
    toolTipElement.style.fontSize = '12px'
    toolTipElement.style.padding = '6px 10px'
    toolTipElement.style.backgroundColor = 'rgba(100, 206, 248, 0.9)'
    toolTipElement.style.color = '#111'
    toolTipElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.25)'
    toolTipElement.style.display = 'none'

    document.body.appendChild(toolTipElement)
    return toolTipElement
}

function showTooltip(item: HTMLElement) {
    const tooltipElement = initTooltip()

    tooltipElement.replaceChildren()

    const keyword = item.dataset.keyword ?? item.textContent?.trim() ?? '-'
    const algorithm = item.dataset.algorithm ?? '-'
    const algorithmLabel = getAlgorithmLabel(algorithm)
    const count = item.dataset.count ?? '1'
    const time = item.dataset.time ?? '-'

    const keywordElement = document.createElement('div')
    keywordElement.textContent = `Keyword: ${keyword}`

    const algorithmElement = document.createElement('div')
    algorithmElement.textContent = `Found by: ${algorithmLabel}`

    if (algorithm === 'kmp' || algorithm === 'bm' || algorithm === 'aho-corasick' || algorithm === 'rabin-karp') {
        const exactAlgorithmElement = document.createElement('div')
        exactAlgorithmElement.textContent = `Exact algorithm: ${algorithmLabel.replace('Exact / ', '')}`
        tooltipElement.append(exactAlgorithmElement)
    }

    const countElement = document.createElement('div')
    countElement.textContent = `Total appearance: ${count}`

    const timeElement = document.createElement('div')
    timeElement.textContent = `Execution time: ${time}`

    tooltipElement.append(algorithmElement, keywordElement, countElement, timeElement)

    tooltipElement.style.display = 'block'
}

function hideTooltip() {
    if (toolTipElement) {
        toolTipElement.style.display = 'none'
    }
}

function repositionTooltip(event: MouseEvent) {
    if (!toolTipElement) return

    toolTipElement.style.left = `${event.clientX + 10}px`
    toolTipElement.style.top = `${event.clientY + 10}px`
}

function getHighlightFromEvent(event: MouseEvent): HTMLElement | null {
    const target = event.target

    if (!(target instanceof Element)) return null

    return target.closest<HTMLElement>('mark[data-judol-highlight="true"]')
}

export function tooltip() {
    document.addEventListener('mouseover', (event) => {
        const highlight = getHighlightFromEvent(event)

        if (!highlight) return

        showTooltip(highlight)
        repositionTooltip(event)
    })

    document.addEventListener('mouseout', (event) => {
        const highlight = getHighlightFromEvent(event)

        if (!highlight) return

        hideTooltip()
    })

    document.addEventListener('mousemove', (event) => {
        const highlight = getHighlightFromEvent(event)

        if (!highlight) {
            hideTooltip()
            return
        }

        repositionTooltip(event)
    })
}