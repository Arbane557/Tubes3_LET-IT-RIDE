let toolTipElement : HTMLElement | null = null

function initTooltip(): HTMLElement {
    if (toolTipElement) return toolTipElement

    toolTipElement = document.createElement('div')
    toolTipElement.style.position = 'fixed'
    toolTipElement.style.position = 'absolute'
    toolTipElement.style.pointerEvents = 'none'
    toolTipElement.style.zIndex = '67676767'
    toolTipElement.style.borderRadius = '4px'
    toolTipElement.style.fontSize = '12px'
    toolTipElement.style.padding = '4px 8px'
    toolTipElement.style.backgroundColor = 'rgba(100, 206, 248, 0.75)'
    toolTipElement.style.display = 'none'

    document.body.appendChild(toolTipElement)
    return toolTipElement
}

function showTooltip(item: HTMLElement) {
    const toolTipElement = initTooltip()

    toolTipElement.replaceChildren()

    const keyword = item.dataset.keyword
    const algorithm = item.dataset.algorithm
    const time = item.dataset.time
    const foundIndex = item.dataset.foundIndex

    const algorithmElement = document.createElement('div')
    algorithmElement.textContent = `Algorithm: ${algorithm}`

    const keywordElement = document.createElement('div')
    keywordElement.textContent = `Keyword: ${keyword}`

    const timeElement = document.createElement('div')
    timeElement.textContent = `Time: ${time}`

    const foundIndexElement = document.createElement('div')
    foundIndexElement.textContent = `Found Index: ${foundIndex}`

    toolTipElement.append(algorithmElement, keywordElement, timeElement, foundIndexElement)
    toolTipElement.style.display = 'block'
}

function hideTooltip() {
    if (toolTipElement) {
        toolTipElement.style.display = 'none'
    }
}

function repositionTooltip(event: MouseEvent) {
    if (!toolTipElement) return
    
    toolTipElement.style.left = `${event.pageX + 6.7}px`
    toolTipElement.style.top = `${event.pageY + 6.7}px`
}

export function tooltip() {

    document.addEventListener('mouseover', (event) => {
        const item = event.target as HTMLElement
        const highlight = item.closest('mark[data-judol-highlight]')

        if (!highlight) return
        showTooltip(highlight as HTMLElement)
        repositionTooltip(event)
    })

    document.addEventListener('mouseout', (event) => {
        const item = event.target as HTMLElement
        const highlight = item.closest('mark[data-judol-highlight]')

        if (!highlight) return
        hideTooltip()
    })

    document.addEventListener('mousemove', (event) => {
        const item = event.target as HTMLElement
        const highlight = item.closest('mark[data-judol-highlight]')

        if (!highlight) {
            hideTooltip()
            return
        }
        repositionTooltip(event)
    })
}