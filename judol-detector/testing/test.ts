import {kmp} from '../src/content/matching/exact'
import {bm} from '../src/content/matching/exact'

const text = "judi slot online"
const pattern = "slot"

console.log(kmp(text, pattern))
console.log(bm(text, pattern))


