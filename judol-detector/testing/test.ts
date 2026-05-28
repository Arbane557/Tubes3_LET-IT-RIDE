import {kmp} from '../src/content/matching/exact'
import {bm} from '../src/content/matching/exact'
import {fuzzy} from '../src/content/matching/fuzzy'
import {regex} from '../src/content/matching/regex'
import {match} from '../src/content/matching/index'

const text = "jｕdi sl0t c4sin0"
const pattern = ["judi", "slot", "casino"]

const fuzzyText = "slt nfb slot"
const pattern2 = "slot"

const regexText = "GACOR676 slot76767 Awesome999"
const pattern3 = "GACOR"
const pattern4 = "GACOR99"

const algorithms = ['kmp', 'bm', 'aho-corasick']

for (const algo of algorithms) {
    console.log(`\n=== Testing Exact: ${algo} ===`)
    const start = performance.now()
    const result = match(text, pattern, algo)
    const end = performance.now()
    console.log(`Results (${(end - start).toFixed(4)} ms):`, result)
}

console.log('\n=== Testing Regex ===')
console.log(match(regexText, [pattern3, pattern4], 'kmp'))

// console.log(kmp(text, pattern))
// console.log(bm(text, pattern))

// console.log(fuzzy(fuzzyText, pattern2))

// console.log(regex(regexText, pattern3))
// console.log(regex(regexText, pattern4))


