export type Algorithm = 'exact' | 'regex' | 'fuzzy'

export interface Match {
    keyword : string
    matched : string
    offset : number // start index of match in text
    length : number // length of matched text
    algorithm : Algorithm
    time : number // ms
}

export interface ScrapingResult {
    node : Text
    text : string
}

export interface HighlightResult {
    node : Text
    matches : Match[]
}
