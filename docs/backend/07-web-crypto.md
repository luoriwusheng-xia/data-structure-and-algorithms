# Web Crypto 加解密实战：浏览器与 Node.js 双端指南

Web Crypto API 是现代 JavaScript 进行密码学操作的标准接口。Node.js 20+ 已完整支持该 API，使得同一份加解密代码可在浏览器与后端之间复用。

---

## 目录

1. [Web Crypto API 是什么](#一web-crypto-api-是什么)
2. [浏览器与 Node.js 的差异](#二浏览器与-nodejs-的差异)
3. [随机数生成](#三随机数生成)
4. [哈希算法](#四哈希算法)
5. [对称加密：AES-GCM](#五对称加密aes-gcm)
6. [非对称加密：RSA-OAEP](#六非对称加密rsa-oaep)
7. [密钥派生：PBKDF2 与 HKDF](#七密钥派生pbkdf2-与-hkdf)
8. [数字签名](#八数字签名)
9. [实战：加密存储用户敏感信息](#九实战加密存储用户敏感信息)
10. [最佳实践与安全建议](#十最佳实践与安全建议)

---

## 一、Web Crypto API 是什么

Web Crypto API 由 W3C 定义，提供了一组底层的密码学原语：

- `crypto.getRandomValues()`：生成加密安全的随机数。
- `crypto.subtle.digest()`：计算哈希（SHA-1/256/384/512）。
- `crypto.subtle.generateKey()` / `importKey()` / `exportKey()`：密钥管理。
- `crypto.subtle.encrypt()` / `decrypt()`：对称与非对称加密。
- `crypto.subtle.sign()` / `verify()`：数字签名。
- `crypto.subtle.deriveKey()` / `deriveBits()`：密钥派生。

Node.js 20+ 中，`globalThis.crypto` 默认可用，无需 `node:crypto` 的 legacy API 即可使用 Web Crypto。

---

## 二、浏览器与 Node.js 的差异

| 能力 | 浏览器 | Node.js 20+ | Node.js 18 |
|------|--------|-------------|------------|
| `globalThis.crypto` | 有 | 有 | 有（实验性） |
| `crypto.subtle` | 有 | 有 | 有 |
| `CryptoKey` | 有 | 有 | 有 |
| Web Crypto 全部算法 | 完整 | 完整 | 大部分 |
| 性能优化（OpenSSL 3） | 依赖浏览器 | Node 20+ 更优 | 一般 |

获取 crypto 对象的兼容写法：

```javascript
// 浏览器与 Node.js 20+ 通用
// window.crypto 在浏览器环境可用，globalThis.crypto 在 Node.js 20+ 可用
const crypto = globalThis.crypto || window.crypto
```

Node.js 18 用户若遇到缺失，可显式引入：

```javascript
// Node.js 18 兼容
// 若 globalThis.crypto 不完整，可从 node:crypto 显式引入 webcrypto
const { webcrypto } = require('node:crypto')
const crypto = globalThis.crypto || webcrypto
```

---

## 三、随机数生成

生成加密安全的随机值是密钥、盐值、令牌的基础。

```javascript
// 生成 16 字节随机 IV（初始化向量），AES-GCM 推荐使用 12 字节，这里示例为 16 字节
const iv = crypto.getRandomValues(new Uint8Array(16))

// 生成 32 字节随机盐，用于 PBKDF2 等密钥派生
const salt = crypto.getRandomValues(new Uint8Array(32))

// 生成 0 ~ 999999 范围的随机验证码
// crypto.getRandomValues 生成的是密码学安全随机数，比 Math.random() 更安全
const code = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000
```

注意：

- `Math.random()` 不适合密码学场景。
- `getRandomValues` 不能指定 `Uint8Array` 以外的类型直接得到字符串，需要额外编码。

---

## 四、哈希算法

哈希是数据完整性校验、文件指纹、密码学签名前置步骤的核心。

```javascript
async function sha256(message) {
  // 将字符串消息编码为 UTF-8 字节
  const encoder = new TextEncoder()
  const data = encoder.encode(message)

  // 使用 SHA-256 计算哈希，返回 ArrayBuffer
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // 将 ArrayBuffer 转为字节数组，再格式化为 16 进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

sha256('hello web crypto').then(console.log)
```

常用算法：`SHA-256`、`SHA-384`、`SHA-512`。不建议在新系统中使用 `SHA-1`。

---

## 五、对称加密：AES-GCM

AES-GCM（Galois/Counter Mode）同时提供机密性和完整性，是对称加密的首选模式。

```javascript
async function aesGcmEncrypt(plaintext, password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  // 生成随机 IV，每次加密都必须不同，防止同样的明文生成同样的密文
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // 从密码派生 AES-GCM 256 位密钥
  const key = await getAesKeyFromPassword(password, iv)

  // 使用 AES-GCM 加密明文
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  // 将 IV 拼接在密文前面，解密时需要先取出 IV
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  // 返回 Base64 字符串，便于存储和传输
  return arrayBufferToBase64(combined)
}

async function aesGcmDecrypt(base64Combined, password) {
  // 解码 Base64，分离出 IV 和密文
  const combined = base64ToArrayBuffer(base64Combined)
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  // 使用相同的密码和 IV 重新派生密钥
  const key = await getAesKeyFromPassword(password, iv)

  // 解密并恢复原始文本
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(decrypted)
}

async function getAesKeyFromPassword(password, salt) {
  const encoder = new TextEncoder()

  // 将密码导入为 PBKDF2 可用的原始密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  // 派生 AES-GCM 256 位密钥
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  // btoa 将二进制字符串转为 Base64
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  // atob 将 Base64 解码为二进制字符串
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
```

Node.js 后端运行示例：

```javascript
// node aes-demo.mjs
const password = 'user-password-123'
const secret = '银行卡号: 6222 0222 0000 1234 567'

// 加密敏感信息
const encrypted = await aesGcmEncrypt(secret, password)
console.log('加密结果:', encrypted)

// 解密验证
const decrypted = await aesGcmDecrypt(encrypted, password)
console.log('解密结果:', decrypted)
```

---

## 六、非对称加密：RSA-OAEP

RSA-OAEP 适合加密少量数据，例如加密对称密钥本身（密钥封装）。

```javascript
async function generateRsaKeyPair() {
  // 生成 RSA-OAEP 密钥对
  // modulusLength: 模数长度，推荐至少 2048 位
  // publicExponent: 公钥指数，常用 [1, 0, 1] 即 65537
  return crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // 可导出
    ['encrypt', 'decrypt']
  )
}

async function rsaEncrypt(publicKey, plaintext) {
  // 将明文编码为字节后使用公钥加密
  const data = new TextEncoder().encode(plaintext)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  )
  return arrayBufferToBase64(encrypted)
}

async function rsaDecrypt(privateKey, base64Cipher) {
  // 解码 Base64 后使用私钥解密
  const encrypted = base64ToArrayBuffer(base64Cipher)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encrypted
  )
  return new TextDecoder().decode(decrypted)
}
```

实际业务中，RSA 通常只用于加密 AES 密钥，真正数据用 AES-GCM 加密，即“混合加密”。

---

## 七、密钥派生：PBKDF2 与 HKDF

### 7.1 PBKDF2

从用户密码派生密钥，必须配合高迭代次数和随机盐。

```javascript
async function deriveKeyFromPassword(password, salt, iterations = 100_000) {
  // 将用户密码编码为 UTF-8 字节数组
  const encoder = new TextEncoder()

  // 把密码导入为 PBKDF2 可用的原始密钥材料
  // extractable 设为 false：派生后的密钥不会被导出，提升安全性
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  // 使用 PBKDF2 从密码派生 AES-GCM 256 位密钥
  // salt 必须是随机且唯一的，iterations 越大暴力破解成本越高
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}
```

### 7.2 HKDF

HKDF 适合从已有的高熵密钥材料派生多个子密钥。

```javascript
async function deriveMultipleKeys(masterKeyMaterial, salt, info) {
  // 将高熵主密钥材料导入为 HKDF 可用的原始密钥
  // 通常 masterKeyMaterial 来自 ECDH 协商、随机生成或其他安全来源
  const key = await crypto.subtle.importKey(
    'raw',
    masterKeyMaterial,
    { name: 'HKDF' },
    false,
    ['deriveKey']
  )

  // 使用 HKDF 派生子密钥
  // salt 用于增强随机性，info 用于区分不同用途的子密钥（如 "enc" / "mac"）
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      salt,
      info: new TextEncoder().encode(info),
      hash: 'SHA-256',
    },
    key,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}
```

---

## 八、数字签名

数字签名用于身份认证和数据完整性校验。

```javascript
async function generateSigningKeyPair() {
  // 生成 ECDSA 签名密钥对
  // namedCurve 使用 P-256，兼顾安全性与性能
  return crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  )
}

async function signData(privateKey, data) {
  // 使用私钥对数据签名
  const encoded = new TextEncoder().encode(data)
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    encoded
  )
  return arrayBufferToBase64(signature)
}

async function verifyData(publicKey, signatureBase64, data) {
  // 使用公钥验证签名是否匹配原始数据
  const signature = base64ToArrayBuffer(signatureBase64)
  const encoded = new TextEncoder().encode(data)
  return crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    publicKey,
    signature,
    encoded
  )
}
```

---

## 九、实战：加密存储用户敏感信息

场景：用户在浏览器端输入身份证号，前端先用密钥加密，再传给后端存储；解密同样可在授权后端完成。

### 9.1 共享工具库（浏览器 + Node.js 通用）

```javascript
// crypto-utils.mjs
const crypto = globalThis.crypto

export async function encryptField(value, masterKey) {
  // 生成随机 IV，AES-GCM 标准 IV 长度为 12 字节
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()

  // 将主密钥导入为 AES-GCM 算法可用的 CryptoKey
  const key = await crypto.subtle.importKey(
    'raw',
    masterKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  // 加密字段值
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(value)
  )

  // 拼接 IV 和密文，方便后续解密时提取
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return arrayBufferToBase64(combined)
}

export async function decryptField(base64Value, masterKey) {
  // 解码并拆分 IV 与密文
  const combined = base64ToArrayBuffer(base64Value)
  const iv = combined.slice(0, 12)
  const ciphertext = combined.slice(12)

  // 使用相同主密钥导入 CryptoKey
  const key = await crypto.subtle.importKey(
    'raw',
    masterKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  // 解密并返回原始字符串
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(decrypted)
}

function arrayBufferToBase64(buffer) {
  // Node.js 环境优先使用 Buffer 转换
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64')
  }
  // 浏览器环境使用 btoa
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToArrayBuffer(base64) {
  // Node.js 环境优先使用 Buffer 转换
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'))
  }
  // 浏览器环境使用 atob
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
```

### 9.2 Node.js 后端使用

```javascript
// server.mjs
import { encryptField, decryptField } from './crypto-utils.mjs'

// 生成 32 字节主密钥；生产环境应从 KMS 或安全密钥管理服务获取
const masterKey = crypto.getRandomValues(new Uint8Array(32))

const idCard = '110101199001011234'
const encrypted = await encryptField(idCard, masterKey)
console.log('存储到数据库:', encrypted)

const decrypted = await decryptField(encrypted, masterKey)
console.log('解密后:', decrypted)
```

### 9.3 浏览器前端使用

```javascript
import { encryptField } from './crypto-utils.mjs'

async function onSubmit() {
  // 获取用户输入的敏感信息
  const idCard = document.getElementById('idCard').value

  // 从服务端获取授权主密钥；仅在授权场景下使用
  const masterKey = await fetchMasterKeyFromServer()

  // 在浏览器端完成加密后再发送到服务端
  const encrypted = await encryptField(idCard, masterKey)
  await fetch('/api/user/idcard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ encrypted })
  })
}
```

---

## 十、最佳实践与安全建议

### 10.1 密钥管理

- 生产环境密钥禁止硬编码，应使用环境变量、KMS（AWS KMS、Azure Key Vault）或 HSM。
- 对称密钥至少 256 位，RSA 至少 2048 位，ECDSA 推荐 P-256 或 P-384。
- 定期轮换密钥，旧数据解密后使用新密钥重新加密。

### 10.2 IV 与盐值

- AES-GCM 的 IV 必须每次加密唯一，通常 12 字节随机值。
- PBKDF2 的盐必须随机且与密文一起存储。
- 切勿复用同一组 IV + key 加密不同明文。

### 10.3 传输与存储

- 加密后的数据使用 Base64 或 Hex 编码后存储。
- 传输层仍应使用 TLS 1.2+，加密不能替代 HTTPS。
- 敏感字段在日志中应脱敏或省略。

### 10.4 算法选择

| 场景 | 推荐算法 | 不推荐 |
|------|---------|--------|
| 对称加密 | AES-GCM | AES-CBC（无完整性） |
| 非对称加密 | RSA-OAEP / ECDH | RSA-PKCS1-v1_5 |
| 数字签名 | ECDSA P-256 / RSA-PSS | 无哈希的 RSA |
| 密钥派生 | PBKDF2 / HKDF / Argon2 | 简单 MD5/SHA1 |
| 哈希 | SHA-256 / SHA-384 | SHA-1 / MD5 |

### 10.5 Node.js 版本建议

- 新项目直接使用 Node.js 20 LTS 或更高版本。
- `globalThis.crypto` 在 Node.js 20+ 为稳定特性，无需 polyfill。
- 需要更高性能时，Node.js 24+ 对 OpenSSL 3 和 Web Crypto 做了进一步优化。

---

Web Crypto API 让浏览器与 Node.js 共享同一套现代密码学接口。掌握 AES-GCM、RSA-OAEP、PBKDF2 与数字签名，足以覆盖绝大多数前后端加密场景。
