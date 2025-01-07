import crypto from 'node:crypto'

/**
 *
 * @param {string} algorithm
 * @param {crypto.BinaryLike} data
 * @param {crypto.BinaryToTextEncoding} outputEncoding
 * @returns
 */
const hash = (algorithm, data, outputEncoding) => {
  return crypto.createHash(algorithm).update(data).digest(outputEncoding)
}
/**
 *
 * @param {string} text
 * @returns {string}
 */
const getHash = (text) => {
  return  hash('sha256', text, 'hex').substring(0, 8)
}

// 9f2ffa8a 拿到 hash
console.log(getHash('a.vue'))