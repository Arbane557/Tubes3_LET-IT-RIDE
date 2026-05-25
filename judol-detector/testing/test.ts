import {kmp} from '../src/content/matching/exact'
import {bm} from '../src/content/matching/exact'
import {fuzzy} from '../src/content/matching/fuzzy'
import {regex} from '../src/content/matching/regex'

const text = "judi slot online"
const pattern = "slot"

const fuzzyText = "slt nfb slot"
const pattern2 = "slot"

const regexText = "GACOR676 slot76767"
const pattern3 = "GACOR"
const pattern4 = "GACOR99"

console.log(kmp(text, pattern))
console.log(bm(text, pattern))

console.log(fuzzy(fuzzyText, pattern2))

console.log(regex(regexText, pattern3))
console.log(regex(regexText, pattern4))


