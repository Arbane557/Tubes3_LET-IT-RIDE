import {kmp} from '../src/content/matching/exact'
import {bm} from '../src/content/matching/exact'
import {fuzzy} from '../src/content/matching/fuzzy'

const text = "judi slot online"
const pattern = "slot"

const fuzzyText = "slt nfb slot"
const pattern2 = "slot"

console.log(kmp(text, pattern))
console.log(bm(text, pattern))

console.log(fuzzy(fuzzyText, pattern2))


