import {kmp} from './exact'
import {bm} from './exact'
import {normalize} from '../homoglyph'
import {regex} from './regex'
import {fuzzy} from './fuzzy'
import type {Match} from '../type'

function isWordChar(char: string | undefined) {
    return Boolean(char && /[a-z0-9]/i.test(char))
}

function hasWordBoundary(text: string, offset: number, length: number) {
    return !isWordChar(text[offset - 1]) && !isWordChar(text[offset + length])
}

function removeOverlap(matches: Match[]): Match[] {
    const priority: Record<string, number> = { exact: 0, regex: 1, fuzzy: 2 }
    const sorted = [...matches].sort((a, b) =>
        priority[a.algorithm]! - priority[b.algorithm]! || a.offset - b.offset
    )
    const accepted: Match[] = []
    for (const candidate of sorted) {
        const overlaps = accepted.some(a =>
            candidate.offset < a.offset + a.length &&
            candidate.offset + candidate.length > a.offset
        )
        if (!overlaps) accepted.push(candidate)
    }
    return accepted.sort((a, b) => a.offset - b.offset)
}

export function match(text: string, keywords: string[], exactType: string) : Match[] {
    const res: Match[] = []

    const lowerText = normalize(text.toLowerCase())
    
    const exact = exactType === 'kmp' ? kmp : bm

    for (const keyword of keywords) {
        const normalizedKeyword = normalize(keyword.toLowerCase())

        // first part of just exact match
        const startexact = performance.now()
        const offsets = exact(lowerText, normalizedKeyword).filter((offset) => hasWordBoundary(lowerText, offset, normalizedKeyword.length))
        const endexact = performance.now()

        // if spec says its hierarki matching
        // but like if lets say regex find "GACOR99"
        // but exact match alr found "GACOR" 
        // which one will be considered as match?

        if (offsets.length > 0) {
            offsets.forEach(offset => {
                res.push({
                    keyword,
                    matched: text.substring(offset, offset + keyword.length),
                    offset,
                    length: keyword.length,
                    algorithm: 'exact',
                    time: endexact - startexact
                })
            })
            continue
        }

        // fuzzy match
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
            continue
        }
    }

    const startregex = performance.now()
    const regexOffsets = regex(lowerText)
    const endregex = performance.now()

    if (regexOffsets.length > 0) {
        regexOffsets.forEach(offset => {
            const matched = text.substring(offset.offset, offset.offset + offset.length)
            const keyword = matched.replace(/\d{2,3}$/u, '')

            res.push({
                keyword,
                matched,
                offset: offset.offset,
                length: offset.length,
                algorithm: 'regex',
                time: endregex - startregex
            })
        })
    }

    return removeOverlap(res)
}