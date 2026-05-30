import {kmp} from './exact'
import {bm} from './exact'
import {normalize} from '../homoglyph'
import {regex} from './regex'
import {fuzzy} from './fuzzy'
import {ahoCorasick} from './aho-corasick'
import {rabinKarp} from './rabin-karp'
import type {Match} from '../type'

const normalizedKeywordCache = new Map<string, string>()

function getNormalizedKeyword(keyword: string): string {
    const key = keyword.toLowerCase()
    if (!normalizedKeywordCache.has(key)) normalizedKeywordCache.set(key, normalize(key))
    return normalizedKeywordCache.get(key)!
}

function isWordChar(char: string | undefined) {
    return Boolean(char && /[a-z0-9]/i.test(char))
}

function hasWordBoundary(text: string, offset: number, length: number) {
    return !isWordChar(text[offset - 1]) && !isWordChar(text[offset + length])
}

function removeOverlap(matches: Match[]): Match[] {
    const priority: Record<string, number> = { exact: 0, 'aho-corasick': 0, 'rabin-karp': 0, regex: 1, fuzzy: 2 }
    const sorted = [...matches].sort((a, b) =>
        priority[a.algorithm]! - priority[b.algorithm]! || a.offset - b.offset
    )
    const accepted: Match[] = []
    for (const candidate of sorted) {
        const last = accepted.at(-1)
        if (!last || candidate.offset >= last.offset + last.length) {
            accepted.push(candidate)
        }
    }
    return accepted.sort((a, b) => a.offset - b.offset)
}

export function match(text: string, keywords: string[], exactType: string) : Match[] {
    const res: Match[] = []
    const lowerText = normalize(text.toLowerCase())
    const matchedKeywords = new Set<string>()

    const startToken = performance.now()
    const tokenRegex = /[a-z0-9]+/gi
    let tokenMatch: RegExpExecArray | null

    const normalizedKeywordMap = new Map<string, string>()
    for (const kw of keywords) {
        normalizedKeywordMap.set(normalize(kw.toLowerCase()), kw)
    }

    while ((tokenMatch = tokenRegex.exec(lowerText)) !== null) {
        const token = tokenMatch[0]
        if (normalizedKeywordMap.has(token)) {
            const originalKeyword = normalizedKeywordMap.get(token)!
            
            res.push({
                keyword: originalKeyword,
                matched: text.substring(tokenMatch.index, tokenMatch.index + token.length),
                offset: tokenMatch.index,
                length: token.length,
                algorithm: exactType as Match['algorithm'], // Dicatat sesuai algoritma eksak yang dipilih di UI
                time: performance.now() - startToken
            })
            matchedKeywords.add(originalKeyword)
        }
    }

    const remainingKeywords = keywords.filter(kw => !matchedKeywords.has(kw))
    
    if (remainingKeywords.length > 0) {
        if (exactType === 'aho-corasick') {
            const normalizedRemaining = remainingKeywords.map(kw => normalize(kw.toLowerCase()))
            const startAC = performance.now()
            const acMatches = ahoCorasick(lowerText, normalizedRemaining)
            const endAC = performance.now()

            acMatches.forEach(matchInfo => {
                if (hasWordBoundary(lowerText, matchInfo.offset, matchInfo.length)) {
                    const originalIndex = normalizedRemaining.indexOf(matchInfo.keyword)
                    const originalKeyword = originalIndex !== -1 ? remainingKeywords[originalIndex]! : (matchInfo.keyword ?? '')

                    res.push({
                        keyword: originalKeyword,
                        matched: text.substring(matchInfo.offset, matchInfo.offset + matchInfo.length),
                        offset: matchInfo.offset,
                        length: matchInfo.length,
                        algorithm: 'aho-corasick',
                        time: endAC - startAC
                    })
                    matchedKeywords.add(originalKeyword)
                }
            })
        } else {
            let safeExactType = exactType?.trim().toLowerCase()
            let exactAlgorithm

            if (safeExactType === 'bm') {
                exactAlgorithm = bm
            } else if (safeExactType === 'rabin-karp') {
                exactAlgorithm = rabinKarp
            } else {
                exactAlgorithm = kmp
                safeExactType = 'kmp'
            }

            for (const keyword of remainingKeywords) {
                const normalizedKeyword = normalize(keyword.toLowerCase())

                const startexact = performance.now()
                const offsets = exactAlgorithm(lowerText, normalizedKeyword).filter((offset: number) => hasWordBoundary(lowerText, offset, normalizedKeyword.length))
                const endexact = performance.now()

                if (offsets.length > 0) {
                    offsets.forEach((offset: number) => {
                        res.push({
                            keyword,
                            matched: text.substring(offset, offset + keyword.length),
                            offset,
                            length: keyword.length,
                            algorithm: safeExactType as Match['algorithm'], 
                            time: endexact - startexact
                        })
                    })
                    matchedKeywords.add(keyword)
                }
            }
        }
    }

    const startregex = performance.now()
    // use original text because can't be false positive when normalized
    const rawLowerText = text.toLowerCase() 
    const regexOffsets = regex(rawLowerText)
    const endregex = performance.now()

    if (regexOffsets.length > 0) {
        regexOffsets.forEach(offset => {
            const matched = rawLowerText.substring(offset.offset, offset.offset + offset.length)
            const keyword = matched.replace(/\d{2,3}$/u, '')
            if (!keyword) return

            res.push({
                keyword,
                matched: text.substring(offset.offset, offset.offset + offset.length),
                offset: offset.offset,
                length: offset.length,
                algorithm: 'regex',
                time: endregex - startregex
            })
        })
    }

    for (const keyword of keywords) {
        if (matchedKeywords.has(keyword)) {
            continue
        }

        const normalizedKeyword = normalize(keyword.toLowerCase())
        const startfuzzy = performance.now()
        const fuzzyOffsets = fuzzy(lowerText, normalizedKeyword)
        const endfuzzy = performance.now()
        
        if (fuzzyOffsets.length > 0) {
            fuzzyOffsets.forEach(offset => {
                res.push({
                    keyword,
                    matched: text.substring(offset.offset, offset.offset + offset.length),
                    offset: offset.offset,
                    length: offset.length,
                    algorithm: 'fuzzy',
                    time: endfuzzy - startfuzzy
                })
            })
        }
    }

    return removeOverlap(res)
}