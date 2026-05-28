const BLUR_CLASS = 'judol-blur-active'
const STORAGE_KEY = 'judolBlurEnabled'

export function applyBlur(enabled: boolean) {
    if (enabled) {
        document.documentElement.classList.add(BLUR_CLASS)
    } else {
        document.documentElement.classList.remove(BLUR_CLASS)
    }
}

export function updateBlur() {
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local') return

        const blurChange = changes[STORAGE_KEY]
        if (!blurChange) return

        applyBlur(Boolean(blurChange.newValue))
    })
}

export async function initBlur() {
    return new Promise<boolean>((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const enabled = result[STORAGE_KEY] ?? false
            applyBlur(enabled)
            resolve(enabled)
        })
    })
}
