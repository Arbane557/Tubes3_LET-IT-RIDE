// using leventhein

// i used this reference btw, goated material
//  | | |
//  | | |
//  V V V
// https://medium.com/@art3330/levenshtein-distance-fundamentals-817b6f7f1718
function levenshtein(a: string, b: string): number {
    let arr: number[][] = []
    for(let i: number = 0; i <= a.length; i++){
        arr[i] = []
        for(let j: number = 0; j <= b.length; j++){
            if(i === 0){
                arr[i]?.push(j)
            } else if (j === 0){
                arr[i]?.push(i)
            } else if (a[i-1] === b[j-1]) {
                arr[i]?.push(arr.at(i-1)?.at(j-1)!)
            } else {
                let result: number = 1 + Math.min(
                    arr.at(i-1)?.at(j-1)!,
                    arr.at(i)?.at(j-1)!,
                    arr.at(i-1)?.at(j)!
                )
                arr[i]?.push(result)
            }
        }
    } 
    return arr.at(a.length)?.at(b.length)!
}

export interface res {
    offset: number
    length: number
}

export function fuzzy(text: string, pattern: string): res[] {
    const n = text.length
    const m = pattern.length
    const offsets: res[] = []

    let i = 0
    let threshold = 0
    let textMemo = new Map<string, number>()

    if (pattern.length <= 5){
        threshold = 1
    } else {
        threshold = 2
    }

    while (i <= n - m + threshold) {
        let best = -1
        let min = Infinity

        for (let j = Math.max(1, m - threshold); j <= m + threshold; j++) {
            if (i + j > n) continue
            
            let subtext = text.slice(i, i + j)
            let d: number
            if (textMemo.has(`${pattern}|${subtext}`)) d = textMemo.get(`${pattern}|${subtext}`)!
            else if (textMemo.has(`${subtext}|${pattern}`)) d = textMemo.get(`${subtext}|${pattern}`)!
            else{
                d = levenshtein(pattern, subtext)
                textMemo.set(`${pattern}|${subtext}`, d)
                textMemo.set(`${subtext}|${pattern}`, d)
            }
            if (d < min) {
                min = d
                best = j
                if (min === 0) break
            }
        }

        if (best !== -1 && min <= threshold) {
            offsets.push( { offset: i, length: best })
            i += best
        }
        else i++
    }

    return offsets
}