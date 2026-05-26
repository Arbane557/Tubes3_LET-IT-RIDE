import {kmp} from './exact'
import {bm} from './exact'

import {regex} from './regex'
import {fuzzy} from './fuzzy'
import type {Match} from '../type'

export function match(text: string, keywords: string[], exactType: string) : Match[] {
    const res: Match[] = []
    const lowerText = text.toLowerCase()
    
    const exact = exactType === 'kmp' ? kmp : bm

    for (const keyword of keywords) {

        // first part of just exact match
        const startexact = performance.now()
        const offsets = exact(lowerText, keyword.toLowerCase())
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

        // regex match 
        const startregex = performance.now()
        const regexOffsets = regex(lowerText, keyword.toLowerCase())
        const endregex = performance.now()

        if (regexOffsets.length > 0) {
            regexOffsets.forEach(offset => {
                res.push({
                    keyword,
                    matched: text.substring(offset.offset, offset.offset + keyword.length),
                    offset: offset.offset,
                    length: keyword.length,
                    algorithm: 'regex',
                    time: endregex - startregex
                })
            })
            continue
        }

        // fuzzy match
        const startfuzzy = performance.now()
        const fuzzyOffsets = fuzzy(lowerText, keyword.toLowerCase())
        const endfuzzy = performance.now()
        if (fuzzyOffsets.length > 0) {
            fuzzyOffsets.forEach(offset => {
                res.push({
                    keyword,
                    matched: text.substring(offset.offset, offset.offset + keyword.length),
                    offset: offset.offset,
                    length: offset.length,
                    algorithm: 'fuzzy',
                    time: endfuzzy - startfuzzy
                })
            })
            continue
        }
    }


    return res
}
