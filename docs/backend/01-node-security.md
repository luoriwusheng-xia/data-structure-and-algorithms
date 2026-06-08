# Node.js 安全实战（Node.js 24+）

本文档涵盖 Node.js 应用安全的各个关键领域，所有代码示例均可在 Node.js 24+ 环境中运行。

---

## 1. 依赖安全扫描

### 1.1 npm audit 实战用法

`npm audit` 是 Node.js 内置的依赖漏洞扫描工具，它会分析 `package-lock.json` 并对比 npm 漏洞数据库。

```bash
# 基础扫描 - 列出所有已知漏洞
npm audit

# 以 JSON 格式输出，便于 CI/CD 集成
npm audit --json

# 仅显示生产环境依赖的漏洞
npm audit --production

# 自动修复可自动更新的漏洞
npm audit fix

# 强制修复，包括 major 版本更新（需谨慎）
npm audit fix --force

# 设置漏洞等级阈值，高于该等级时退出码非零
npm audit --audit-level=moderate
```

**CI/CD 集成脚本：**

```javascript
// scripts/security-audit.js
const { execSync } = require('child_process');

/**
 * 在 CI 环境中运行安全审计
 * 发现高危漏洞时中断构建
 */
function runSecurityAudit() {
  const severityLevels = ['info', 'low', 'moderate', 'high', 'critical'];
  const threshold = process.env.AUDIT_LEVEL || 'high';
  const thresholdIndex = severityLevels.indexOf(threshold);

  try {
    // 执行审计并获取 JSON 结果
    const output = execSync('npm audit --json --production', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const audit = JSON.parse(output);
    const vulnerabilities = audit.vulnerabilities || {};

    let maxSeverity = -1;
    const findings = [];

    for (const [pkgName, info] of Object.entries(vulnerabilities)) {
      const severityIndex = severityLevels.indexOf(info.severity);
      if (severityIndex > maxSeverity) {
        maxSeverity = severityIndex;
      }
      findings.push({
        package: pkgName,
        severity: info.severity,
        via: info.via.map(v => typeof v === 'string' ? v : v.title),
        range: info.range,
        fixAvailable: info.fixAvailable
      });
    }

    console.log(`\n=== 依赖安全审计报告 ===`);
    console.log(`扫描依赖总数: ${audit.metadata?.dependencies?.total || 'N/A'}`);
    console.log(`发现漏洞数: ${Object.keys(vulnerabilities).length}`);

    if (findings.length > 0) {
      console.log('\n漏洞详情:');
      findings.forEach(f => {
        console.log(`  [${f.severity.toUpperCase()}] ${f.package}@${f.range}`);
        console.log(`    原因: ${f.via.join(', ')}`);
        console.log(`    可修复: ${f.fixAvailable ? '是' : '否'}`);
      });
    }

    // 如果最高严重等级超过阈值，退出失败
    if (maxSeverity >= thresholdIndex) {
      console.error(`\n错误: 发现 ${severityLevels[maxSeverity]} 级别漏洞，超过阈值 ${threshold}`);
      process.exit(1);
    }

    console.log('\n审计通过: 未发现超过阈值的漏洞');

  } catch (error) {
    // npm audit 发现漏洞时返回非零退出码
    if (error.stdout) {
      try {
        const audit = JSON.parse(error.stdout);
        console.error('审计失败:', audit.metadata);
        process.exit(1);
      } catch {
        console.error('审计执行失败:', error.message);
        process.exit(1);
      }
    } else {
      console.error('审计执行失败:', error.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  runSecurityAudit();
}

module.exports = { runSecurityAudit };
```

### 1.2 package.json 中的 overrides 处理漏洞

当某个间接依赖存在漏洞但直接依赖方尚未更新时，可以使用 `overrides` 强制指定版本。

```json
{
  "name": "secure-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.0"
  },
  "overrides": {
    "lodash": "^4.17.21",
    "express": {
      "body-parser": "^1.20.2",
      "cookie": "^0.6.0"
    },
    "some-vuln-package@<2.0.0": "2.0.1"
  }
}
```

**动态 overrides 脚本（用于紧急漏洞修复）：**

```javascript
// scripts/apply-security-overrides.js
const fs = require('fs');
const path = require('path');

/**
 * 根据安全公告自动应用 overrides
 * 用法: node scripts/apply-security-overrides.js
 */
const SECURITY_OVERRIDES = {
  // 格式: '包名': '安全版本'
  // 这些可以从安全数据库或内部安全团队获取
  'lodash': '>=4.17.21',
  'minimist': '>=1.2.6',
  'semver': '>=7.5.2',
  'jsonwebtoken': '>=9.0.0',
  'xml2js': '>=0.5.0'
};

function applySecurityOverrides() {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

  pkg.overrides = pkg.overrides || {};

  let updated = false;
  for (const [pkgName, safeVersion] of Object.entries(SECURITY_OVERRIDES)) {
    if (!pkg.overrides[pkgName] || pkg.overrides[pkgName] !== safeVersion) {
      pkg.overrides[pkgName] = safeVersion;
      console.log(`[SECURITY] 添加 override: ${pkgName} -> ${safeVersion}`);
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('\n已更新 package.json，请运行 npm install 应用更改');
  } else {
    console.log('所有安全 overrides 已是最新');
  }
}

applySecurityOverrides();
```

### 1.3 使用 corepack 管理包管理器版本安全

Node.js 24 内置 `corepack`，确保团队使用一致的包管理器版本，防止因版本差异导致的安全问题。

```bash
# 启用 corepack
corepack enable

# 使用特定版本的 pnpm
corepack prepare pnpm@9.0.0 --activate

# 在 package.json 中声明包管理器
```

```json
{
  "packageManager": "pnpm@9.0.0"
}
```

```javascript
// scripts/enforce-package-manager.js
const { execSync } = require('child_process');

/**
 * 强制使用声明的包管理器，防止使用 npm/yarn 混用导致 lock 文件不一致
 */
function enforcePackageManager() {
  const pkg = require('./package.json');
  const declaredManager = pkg.packageManager;

  if (!declaredManager) {
    console.warn('警告: package.json 中未声明 packageManager');
    return;
  }

  const [manager] = declaredManager.split('@');
  const currentProcess = process.env.npm_execpath || '';

  const isCorrectManager = currentProcess.includes(manager);

  if (!isCorrectManager) {
    console.error(`\n错误: 请使用 ${manager} 运行此命令`);
    console.error(`声明的包管理器: ${declaredManager}`);
    console.error(`当前使用的: ${currentProcess || '未知'}`);
    console.error(`\n请运行: ${manager} install`);
    process.exit(1);
  }

  // 验证 corepack 是否启用
  try {
    execSync('corepack --version', { stdio: 'ignore' });
  } catch {
    console.warn('警告: corepack 未启用，建议运行: corepack enable');
  }

  console.log(`包管理器验证通过: ${declaredManager}`);
}

enforcePackageManager();
```

### 1.4 第三方依赖的安全审查最佳实践

```javascript
// scripts/dependency-review.js
const { execSync } = require('child_process');
const https = require('https');

/**
 * 依赖安全审查工具
 * 检查依赖的维护状态、许可证、已知风险等
 */
class DependencyReviewer {
  constructor() {
    this.riskIndicators = [
      /eval\s*\(/i,
      /child_process/,
      /fs\.unlinkSync/,
      /new\s+Function\s*\(/,
      /process\.env/i
    ];
  }

  /**
   * 获取包的 npm 元数据
   */
  async getPackageMetadata(name) {
    return new Promise((resolve, reject) => {
      const req = https.get(
        `https://registry.npmjs.org/${encodeURIComponent(name)}`,
        { timeout: 10000 },
        (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(e);
            }
          });
        }
      );
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });
    });
  }

  /**
   * 评估包的安全风险
   */
  async assessPackage(name, version) {
    const risks = [];
    let metadata;

    try {
      metadata = await this.getPackageMetadata(name);
    } catch (e) {
      return { name, version, error: '无法获取元数据', risks: ['网络或包不存在'] };
    }

    const versionData = metadata.versions?.[version] || metadata.versions?.[metadata['dist-tags']?.latest];

    if (!versionData) {
      return { name, version, error: '版本不存在', risks: [] };
    }

    // 检查维护状态
    const lastPublish = new Date(metadata.time?.modified || 0);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    if (lastPublish < twoYearsAgo) {
      risks.push('超过 2 年未更新，可能已停止维护');
    }

    // 检查下载量（间接指标）
    if (metadata.weeklyDownloads !== undefined && metadata.weeklyDownloads < 100) {
      risks.push('下载量极低，可能不受社区信任');
    }

    // 检查许可证
    const license = versionData.license || (versionData.licenses && versionData.licenses[0]?.type);
    const riskyLicenses = ['GPL-3.0', 'AGPL-3.0', 'UNLICENSED'];
    if (riskyLicenses.includes(license)) {
      risks.push(`许可证风险: ${license}`);
    }

    // 检查安装脚本（preinstall/postinstall 可能执行恶意代码）
    const scripts = versionData.scripts || {};
    if (scripts.preinstall || scripts.postinstall || scripts.install) {
      const installScript = scripts.preinstall || scripts.postinstall || scripts.install;
      risks.push(`包含安装脚本: ${installScript.substring(0, 100)}`);
    }

    // 检查作者可信度
    if (!metadata.maintainers || metadata.maintainers.length === 0) {
      risks.push('无维护者信息');
    }

    return {
      name,
      version,
      license,
      lastPublish: metadata.time?.modified,
      maintainers: metadata.maintainers?.map(m => m.name) || [],
      risks,
      riskLevel: risks.length === 0 ? 'low' : risks.length <= 2 ? 'medium' : 'high'
    };
  }

  /**
   * 审查当前项目的所有依赖
   */
  async reviewProjectDependencies() {
    const pkg = require('./package.json');
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies
    };

    console.log('=== 依赖安全审查报告 ===\n');

    const results = [];
    for (const [name, versionRange] of Object.entries(deps)) {
      // 解析实际版本
      let actualVersion = versionRange.replace(/^[\^~>=<]+/, '');
      const result = await this.assessPackage(name, actualVersion);
      results.push(result);

      const icon = result.riskLevel === 'low' ? '✓' : result.riskLevel === 'medium' ? '⚠' : '✗';
      console.log(`${icon} ${name}@${actualVersion} [${result.riskLevel.toUpperCase()}]`);

      if (result.risks.length > 0) {
        result.risks.forEach(r => console.log(`   - ${r}`));
      }
      console.log();
    }

    const highRisk = results.filter(r => r.riskLevel === 'high');
    if (highRisk.length > 0) {
      console.error(`\n发现 ${highRisk.length} 个高风险依赖，建议替换或审查`);
      process.exit(1);
    }

    console.log('依赖审查完成');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const reviewer = new DependencyReviewer();
  reviewer.reviewProjectDependencies().catch(console.error);
}

module.exports = { DependencyReviewer };
```

---

## 2. 输入验证与注入防护

### 2.1 SQL 注入防护（参数化查询）

**永远不要拼接 SQL 字符串！** 始终使用参数化查询。

```javascript
// ❌ 错误示例 - 存在 SQL 注入漏洞
const express = require('express');
const sqlite3 = require('sqlite3');

const app = express();
const db = new sqlite3.Database(':memory:');

// 危险！用户输入直接拼接到 SQL 中
app.get('/users-unsafe', (req, res) => {
  const { name } = req.query;
  // 攻击者可以传入: name = "' OR '1'='1"
  const sql = `SELECT * FROM users WHERE name = '${name}'`;
  db.all(sql, (err, rows) => {
    res.json(rows);
  });
});

// ✅ 正确示例 - 使用参数化查询
app.get('/users-safe', (req, res) => {
  const { name } = req.query;

  // 参数化查询 - 用户输入被当作纯数据处理
  const sql = 'SELECT * FROM users WHERE name = ?';
  db.all(sql, [name], (err, rows) => {
    if (err) {
      console.error('查询错误:', err);
      return res.status(500).json({ error: '查询失败' });
    }
    res.json(rows);
  });
});

// ✅ 多参数查询
app.get('/users-search', (req, res) => {
  const { name, email, minAge } = req.query;

  const conditions = [];
  const params = [];

  if (name) {
    conditions.push('name LIKE ?');
    params.push(`%${name}%`);
  }
  if (email) {
    conditions.push('email = ?');
    params.push(email);
  }
  if (minAge) {
    conditions.push('age >= ?');
    params.push(parseInt(minAge, 10));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM users ${whereClause} LIMIT 100`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '查询失败' });
    }
    res.json(rows);
  });
});
```

**使用更好的 sqlite 包装器进行验证：**

```javascript
// db/safe-query.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

/**
 * 安全的 SQLite 查询包装器
 * 包含输入验证和查询限制
 */
class SafeQueryBuilder {
  constructor(dbPath = ':memory:') {
    this.dbPath = dbPath;
    this.db = null;
  }

  async init() {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    // 设置安全限制
    await this.db.run('PRAGMA query_only = OFF');
    return this;
  }

  /**
   * 验证表名/列名（只允许字母、数字、下划线）
   */
  static validateIdentifier(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('标识符不能为空');
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error(`非法标识符: ${name}`);
    }
    return name;
  }

  /**
   * 验证排序方向
   */
  static validateOrderDirection(dir) {
    const allowed = ['ASC', 'DESC'];
    const upper = (dir || 'ASC').toUpperCase();
    if (!allowed.includes(upper)) {
      throw new Error(`非法排序方向: ${dir}`);
    }
    return upper;
  }

  /**
   * 安全查询 - 带白名单的字段选择
   */
  async select(table, options = {}) {
    const {
      columns = ['*'],
      where = {},
      orderBy = null,
      orderDir = 'ASC',
      limit = 100,
      offset = 0
    } = options;

    // 验证表名
    SafeQueryBuilder.validateIdentifier(table);

    // 验证列名（白名单）
    const allowedColumns = await this.getTableColumns(table);
    const safeColumns = columns.map(col => {
      if (col === '*') return col;
      if (allowedColumns.includes(col)) return col;
      throw new Error(`非法列名: ${col}`);
    });

    // 构建 WHERE 子句
    const whereClauses = [];
    const params = [];
    for (const [key, value] of Object.entries(where)) {
      SafeQueryBuilder.validateIdentifier(key);
      whereClauses.push(`${key} = ?`);
      params.push(value);
    }

    let sql = `SELECT ${safeColumns.join(', ')} FROM ${table}`;
    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    if (orderBy) {
      SafeQueryBuilder.validateIdentifier(orderBy);
      sql += ` ORDER BY ${orderBy} ${SafeQueryBuilder.validateOrderDirection(orderDir)}`;
    }

    // 限制返回数量，防止 DoS
    const safeLimit = Math.min(parseInt(limit, 10) || 100, 1000);
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);
    sql += ` LIMIT ? OFFSET ?`;
    params.push(safeLimit, safeOffset);

    return this.db.all(sql, params);
  }

  async getTableColumns(table) {
    SafeQueryBuilder.validateIdentifier(table);
    const info = await this.db.all(`PRAGMA table_info(${table})`);
    return info.map(col => col.name);
  }

  async close() {
    if (this.db) {
      await this.db.close();
    }
  }
}

// 实战案例
async function demo() {
  const db = await new SafeQueryBuilder(':memory:').init();

  // 创建测试表
  await db.db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      age INTEGER
    );
    INSERT INTO users (name, email, age) VALUES
      ('Alice', 'alice@example.com', 30),
      ('Bob', 'bob@example.com', 25);
  `);

  // 安全查询
  const users = await db.select('users', {
    columns: ['id', 'name', 'email'],
    where: { age: 30 },
    limit: 10
  });
  console.log('查询结果:', users);

  // 尝试注入会失败
  try {
    await db.select('users', {
      where: { name: "' OR '1'='1" }  // 参数化查询会正确处理
    });
  } catch (e) {
    console.error('错误:', e.message);
  }

  await db.close();
}

module.exports = { SafeQueryBuilder };

// 如果直接运行
if (require.main === module) {
  demo().catch(console.error);
}
```

### 2.2 NoSQL 注入防护

MongoDB 等 NoSQL 数据库同样存在注入风险。

```javascript
// nosql-injection-protection.js
const express = require('express');

const app = express();
app.use(express.json());

/**
 * 清理用户输入，防止 NoSQL 注入操作符
 */
function sanitizeNoSqlInput(input) {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    // 字符串输入通常是安全的
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeNoSqlInput);
  }

  if (typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // 拒绝 MongoDB 操作符键（以 $ 开头）
      if (key.startsWith('$')) {
        console.warn(`[SECURITY] 拦截 NoSQL 操作符: ${key}`);
        continue;
      }
      sanitized[key] = sanitizeNoSqlInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * Express 中间件：自动清理请求体中的 NoSQL 操作符
 */
function noSqlInjectionProtection(req, res, next) {
  if (req.body) {
    req.body = sanitizeNoSqlInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeNoSqlInput(req.query);
  }
  next();
}

// ❌ 不安全的 MongoDB 查询
// app.post('/login-unsafe', async (req, res) => {
//   const { username, password } = req.body;
//   // 攻击者可以发送: { "username": { "$ne": null }, "password": { "$ne": null } }
//   const user = await db.collection('users').findOne({ username, password });
//   if (user) res.json({ token: generateToken(user) });
// });

// ✅ 安全的 MongoDB 查询
app.post('/login-safe', noSqlInjectionProtection, async (req, res) => {
  const { username, password } = req.body;

  // 类型检查
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: '无效输入类型' });
  }

  // 使用明确的字符串比较
  const user = await db.collection('users').findOne({
    username: String(username),
    password: hashPassword(String(password))  // 永远不要在数据库中存储明文密码
  });

  if (!user) {
    return res.status(401).json({ error: '认证失败' });
  }

  res.json({ token: generateToken(user) });
});

/**
 * 更严格的查询构建器
 */
class MongoSafeQuery {
  static buildQuery(filters) {
    const query = {};

    for (const [field, config] of Object.entries(filters)) {
      // 字段名白名单验证
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
        throw new Error(`非法字段名: ${field}`);
      }

      const { value, operator = 'eq' } = config;

      // 只允许白名单中的操作符
      const allowedOperators = {
        'eq': (v) => v,
        'ne': (v) => ({ $ne: v }),
        'gt': (v) => ({ $gt: v }),
        'gte': (v) => ({ $gte: v }),
        'lt': (v) => ({ $lt: v }),
        'lte': (v) => ({ $lte: v }),
        'in': (v) => ({ $in: Array.isArray(v) ? v : [v] }),
        'regex': (v) => {
          // 限制正则表达式复杂度，防止 ReDoS
          if (typeof v !== 'string' || v.length > 100) {
            throw new Error('正则表达式过长');
          }
          return { $regex: v, $options: 'i' };
        }
      };

      const opFn = allowedOperators[operator];
      if (!opFn) {
        throw new Error(`不支持的操作符: ${operator}`);
      }

      query[field] = opFn(value);
    }

    return query;
  }
}

// 使用示例
const safeQuery = MongoSafeQuery.buildQuery({
  status: { value: 'active', operator: 'eq' },
  age: { value: 18, operator: 'gte' },
  tags: { value: ['premium'], operator: 'in' }
});
// 结果: { status: 'active', age: { $gte: 18 }, tags: { $in: ['premium'] } }

module.exports = { sanitizeNoSqlInput, noSqlInjectionProtection, MongoSafeQuery };
```

### 2.3 命令注入防护（child_process 安全使用）

```javascript
// safe-child-process.js
const { spawn, execFile } = require('child_process');
const path = require('path');

/**
 * 命令注入防护最佳实践
 */

// ❌ 绝对不要这样做 - 直接拼接用户输入到 shell 命令
// const userInput = req.query.filename;
// exec(`cat ${userInput}`, callback);  // 危险！

// ✅ 方法 1: 使用 spawn 配合参数数组（推荐）
function safeGrep(searchTerm, filePath) {
  // 验证文件路径
  const resolvedPath = path.resolve(filePath);
  const allowedDir = path.resolve('/var/data');

  if (!resolvedPath.startsWith(allowedDir)) {
    throw new Error('文件路径超出允许范围');
  }

  return new Promise((resolve, reject) => {
    // 使用参数数组，避免 shell 解析
    const proc = spawn('grep', ['-i', searchTerm, resolvedPath], {
      timeout: 5000,  // 5 秒超时
      killSignal: 'SIGTERM'
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr += data; });

    proc.on('close', (code) => {
      if (code !== 0 && code !== 1) {  // grep 返回 1 表示未找到匹配
        reject(new Error(`进程退出码: ${code}, stderr: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    proc.on('error', reject);
  });
}

// ✅ 方法 2: 使用 execFile（不启动 shell）
function safeExecFile(command, args, options = {}) {
  // 命令白名单
  const allowedCommands = ['git', 'node', 'npm', 'python3'];

  if (!allowedCommands.includes(command)) {
    throw new Error(`命令不在白名单中: ${command}`);
  }

  // 验证参数不包含 shell 元字符
  const shellMetacharacters = /[;&|`$(){}[\]\\*?<>\n]/;
  for (const arg of args) {
    if (shellMetacharacters.test(arg)) {
      throw new Error(`参数包含非法字符: ${arg}`);
    }
  }

  return new Promise((resolve, reject) => {
    execFile(command, args, {
      timeout: options.timeout || 10000,
      maxBuffer: options.maxBuffer || 1024 * 1024,  // 1MB 输出限制
      ...options
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// ✅ 方法 3: 完全避免 shell，使用 Node.js 原生 API
const fs = require('fs');
const crypto = require('crypto');

/**
 * 替代常见命令行工具的原生实现
 */
const NativeReplacements = {
  // 替代 grep
  grepInFile(searchTerm, filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    return lines.filter(line =>
      line.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // 替代 md5sum/sha256sum
  hashFile(filePath, algorithm = 'sha256') {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  },

  // 替代 wc -l
  countLines(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  }
};

// 实战案例：安全的文件处理服务
class SafeFileProcessor {
  constructor(allowedDir) {
    this.allowedDir = path.resolve(allowedDir);
  }

  /**
   * 验证路径是否在允许目录内
   */
  validatePath(inputPath) {
    const resolved = path.resolve(this.allowedDir, inputPath);
    // 确保解析后的路径仍在允许目录内
    if (!resolved.startsWith(this.allowedDir + path.sep) && resolved !== this.allowedDir) {
      throw new Error('路径遍历攻击检测');
    }
    return resolved;
  }

  async searchInFile(filename, keyword) {
    const safePath = this.validatePath(filename);

    // 检查文件存在
    if (!fs.existsSync(safePath)) {
      throw new Error('文件不存在');
    }

    // 使用原生实现替代 grep
    return NativeReplacements.grepInFile(keyword, safePath);
  }

  async getFileHash(filename) {
    const safePath = this.validatePath(filename);
    return NativeReplacements.hashFile(safePath, 'sha256');
  }
}

// 使用示例
async function demo() {
  const processor = new SafeFileProcessor('/var/data');

  try {
    // 正常操作
    const lines = await processor.searchInFile('test.txt', 'hello');
    console.log('搜索结果:', lines);

    // 路径遍历攻击会被阻止
    await processor.searchInFile('../../../etc/passwd', 'root');
  } catch (e) {
    console.error('安全拦截:', e.message);
  }
}

module.exports = {
  safeGrep,
  safeExecFile,
  NativeReplacements,
  SafeFileProcessor
};
```

### 2.4 正则表达式 ReDoS 防护

Node.js 24 对正则表达式引擎进行了优化，但仍需警惕 ReDoS（正则表达式拒绝服务）。

```javascript
// redos-protection.js

/**
 * ReDoS 检测与防护
 * Node.js 24 中的改进包括更好的正则引擎优化，但仍需主动防护
 */

/**
 * 检测正则表达式是否存在 ReDoS 风险
 * 基于常见危险模式分析
 */
function analyzeReDoSRisk(pattern) {
  const risks = [];
  const patternStr = pattern.source || pattern;

  // 危险模式 1: 嵌套量词 (a+)*
  if (/\([^)]*[*+][^)]*\)[*+]/.test(patternStr)) {
    risks.push('嵌套量词可能导致灾难性回溯');
  }

  // 危险模式 2: 重叠可选 (a|a)*
  if (/\([^)]*\|[^)]*\)[*+]/.test(patternStr)) {
    risks.push('重叠分支可能导致回溯爆炸');
  }

  // 危险模式 3: 贪婪匹配 + 回溯 (.*a){x}
  if (/\.\*[*+]?.*[{}]/.test(patternStr)) {
    risks.push('贪婪匹配组合可能低效');
  }

  // 危险模式 4: 大量连续可选
  const optionalCount = (patternStr.match(/[?*+]/g) || []).length;
  if (optionalCount > 5) {
    risks.push(`大量量词 (${optionalCount}) 增加回溯风险`);
  }

  return {
    isSafe: risks.length === 0,
    risks,
    riskLevel: risks.length === 0 ? 'low' : risks.length <= 2 ? 'medium' : 'high'
  };
}

/**
 * 带超时保护的正则匹配
 * Node.js 24 支持更精确的超时控制
 */
function safeRegexTest(pattern, input, timeoutMs = 1000) {
  return new Promise((resolve, reject) => {
    // 先分析风险
    const risk = analyzeReDoSRisk(pattern);
    if (risk.riskLevel === 'high') {
      console.warn(`[SECURITY] 高风险正则: ${risk.risks.join(', ')}`);
    }

    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      parentPort.once('message', ({ pattern, flags, input }) => {
        try {
          const regex = new RegExp(pattern, flags);
          const result = regex.test(input);
          parentPort.postMessage({ result, error: null });
        } catch (e) {
          parentPort.postMessage({ result: null, error: e.message });
        }
      });
    `, { eval: true });

    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error(`正则匹配超时 (${timeoutMs}ms)，可能存在 ReDoS`));
    }, timeoutMs);

    worker.once('message', (msg) => {
      clearTimeout(timer);
      worker.terminate();
      if (msg.error) {
        reject(new Error(msg.error));
      } else {
        resolve(msg.result);
      }
    });

    worker.once('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    worker.postMessage({
      pattern: pattern.source,
      flags: pattern.flags,
      input
    });
  });
}

/**
 * 安全的正则表达式构建器
 * 使用预定义的安全模式
 */
class SafeRegexBuilder {
  static patterns = {
    // 邮箱 - 严格限制长度和结构
    email: /^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,63}$/,

    // UUID
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

    // 用户名 - 限制字符集和长度
    username: /^[a-zA-Z0-9_-]{3,32}$/,

    // 十六进制颜色
    hexColor: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i,

    // IP 地址
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,

    // 安全的 URL 路径段
    urlPathSegment: /^[a-zA-Z0-9._~!$&'()*+,;=:@-]+$/,

    // 数字 ID
    numericId: /^[1-9]\d{0,18}$/
  };

  /**
   * 使用预定义的安全模式进行匹配
   */
  static test(patternName, input) {
    const pattern = this.patterns[patternName];
    if (!pattern) {
      throw new Error(`未知模式: ${patternName}`);
    }
    return pattern.test(input);
  }

  /**
   * 转义用户输入中的正则特殊字符
   */
  static escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 构建安全的搜索正则（固定前缀，避免回溯）
   */
  static buildSearchPattern(searchTerm) {
    // 限制搜索词长度
    if (searchTerm.length > 100) {
      throw new Error('搜索词过长');
    }
    // 使用固定前缀模式，避免回溯
    const escaped = this.escapeRegex(searchTerm);
    return new RegExp(escaped, 'i');
  }
}

// 实战案例
async function demo() {
  // 安全的预定义模式
  console.log('邮箱验证:', SafeRegexBuilder.test('email', 'user@example.com'));
  console.log('UUID 验证:', SafeRegexBuilder.test('uuid', '550e8400-e29b-41d4-a716-446655440000'));

  // 危险的 ReDoS 正则检测
  const evilPattern = /(a+)+$/;
  const risk = analyzeReDoSRisk(evilPattern);
  console.log('\n危险正则分析:', risk);

  // 使用超时保护测试
  try {
    const result = await safeRegexTest(evilPattern, 'a'.repeat(30) + 'b', 500);
    console.log('匹配结果:', result);
  } catch (e) {
    console.error('安全拦截:', e.message);
  }

  // 安全的搜索模式
  const searchPattern = SafeRegexBuilder.buildSearchPattern('hello world');
  console.log('\n安全搜索:', searchPattern.test('Hello World!'));
}

// Worker 实现需要 worker_threads
const { Worker } = require('worker_threads');

module.exports = {
  analyzeReDoSRisk,
  safeRegexTest,
  SafeRegexBuilder
};

if (require.main === module) {
  demo().catch(console.error);
}
```

---

## 3. 认证与授权

### 3.1 JWT 安全最佳实践

```javascript
// jwt-security.js
const crypto = require('crypto');
const { promisify } = require('util');

/**
 * JWT 安全最佳实践
 * 包括密钥管理、过期策略、令牌刷新等
 */

// 使用 Node.js 原生 crypto 进行 JWT 操作（不依赖 jsonwebtoken 包）
// 实际项目中可以使用 jsonwebtoken，但这里展示原理

class SecureJWT {
  constructor(options = {}) {
    // 从环境变量读取密钥，支持密钥轮换
    this.primaryKey = options.primaryKey || process.env.JWT_PRIMARY_KEY;
    this.previousKey = options.previousKey || process.env.JWT_PREVIOUS_KEY;
    this.algorithm = options.algorithm || 'HS256';
    this.issuer = options.issuer || 'secure-app';
    this.audience = options.audience || 'secure-app-users';

    if (!this.primaryKey) {
      throw new Error('JWT 密钥未配置');
    }

    // 密钥最小长度要求
    if (Buffer.from(this.primaryKey).length < 32) {
      throw new Error('JWT 密钥长度必须至少 256 位 (32 字节)');
    }
  }

  /**
   * Base64URL 编码
   */
  static base64UrlEncode(str) {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  static base64UrlDecode(str) {
    // 补齐 padding
    const padding = '='.repeat((4 - str.length % 4) % 4);
    return Buffer.from(
      (str + padding).replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    );
  }

  /**
   * 生成安全的 JWT
   */
  sign(payload, options = {}) {
    const now = Math.floor(Date.now() / 1000);

    const header = {
      alg: this.algorithm,
      typ: 'JWT',
      kid: options.keyId || 'primary'  // 密钥标识，支持轮换
    };

    const body = {
      ...payload,
      iss: this.issuer,
      aud: this.audience,
      iat: now,
      nbf: now,  // 生效时间
      exp: now + (options.expiresIn || 900),  // 默认 15 分钟
      jti: crypto.randomBytes(16).toString('hex')  // 唯一标识，用于撤销
    };

    const encodedHeader = SecureJWT.base64UrlEncode(JSON.stringify(header));
    const encodedBody = SecureJWT.base64UrlEncode(JSON.stringify(body));
    const signingInput = `${encodedHeader}.${encodedBody}`;

    const signature = crypto
      .createHmac('sha256', this.primaryKey)
      .update(signingInput)
      .digest();

    const encodedSignature = SecureJWT.base64UrlEncode(signature);

    return `${signingInput}.${encodedSignature}`;
  }

  /**
   * 验证 JWT
   */
  verify(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('无效的 JWT 格式');
    }

    const [encodedHeader, encodedBody, encodedSignature] = parts;

    // 解析 header
    let header;
    try {
      header = JSON.parse(SecureJWT.base64UrlDecode(encodedHeader).toString());
    } catch {
      throw new Error('无效的 JWT Header');
    }

    // 选择密钥
    const key = header.kid === 'previous' ? this.previousKey : this.primaryKey;
    if (!key) {
      throw new Error('密钥未找到');
    }

    // 验证签名
    const signingInput = `${encodedHeader}.${encodedBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', key)
      .update(signingInput)
      .digest();

    const actualSignature = SecureJWT.base64UrlDecode(encodedSignature);
    if (!crypto.timingSafeEqual(expectedSignature, actualSignature)) {
      throw new Error('签名验证失败');
    }

    // 解析 payload
    let payload;
    try {
      payload = JSON.parse(SecureJWT.base64UrlDecode(encodedBody).toString());
    } catch {
      throw new Error('无效的 JWT Payload');
    }

    const now = Math.floor(Date.now() / 1000);

    // 验证时间声明
    if (payload.exp && payload.exp < now) {
      throw new Error('令牌已过期');
    }
    if (payload.nbf && payload.nbf > now) {
      throw new Error('令牌尚未生效');
    }
    if (payload.iss && payload.iss !== this.issuer) {
      throw new Error('签发者不匹配');
    }
    if (payload.aud && payload.aud !== this.audience) {
      throw new Error('受众不匹配');
    }

    return payload;
  }
}

/**
 * 令牌刷新管理器
 * 实现刷新令牌轮换（Refresh Token Rotation）
 */
class TokenManager {
  constructor(jwt) {
    this.jwt = jwt;
    // 存储已撤销的令牌（生产环境应使用 Redis）
    this.revokedTokens = new Set();
    this.refreshTokens = new Map();  // userId -> { token, family }
  }

  /**
   * 生成访问令牌和刷新令牌对
   */
  generateTokenPair(userId, claims = {}) {
    const tokenFamily = crypto.randomBytes(16).toString('hex');

    const accessToken = this.jwt.sign({
      sub: userId,
      type: 'access',
      ...claims
    }, { expiresIn: 900 });  // 15 分钟

    const refreshToken = this.jwt.sign({
      sub: userId,
      type: 'refresh',
      family: tokenFamily
    }, { expiresIn: 604800 });  // 7 天

    this.refreshTokens.set(userId, {
      token: refreshToken,
      family: tokenFamily,
      createdAt: Date.now()
    });

    return { accessToken, refreshToken };
  }

  /**
   * 刷新访问令牌（带令牌族检测）
   */
  refreshAccessToken(refreshToken) {
    try {
      const payload = this.jwt.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new Error('非刷新令牌');
      }

      // 检查令牌是否被撤销
      if (this.revokedTokens.has(payload.jti)) {
        throw new Error('令牌已被撤销');
      }

      const stored = this.refreshTokens.get(payload.sub);
      if (!stored || stored.token !== refreshToken) {
        // 检测到令牌重用攻击 - 撤销整个令牌族
        console.error(`[SECURITY] 检测到刷新令牌重用攻击，用户: ${payload.sub}`);
        this.revokeTokenFamily(payload.family);
        throw new Error('安全警告：检测到可疑活动');
      }

      // 生成新的令牌对，保持同一令牌族
      return this.generateTokenPair(payload.sub, {
        family: payload.family
      });
    } catch (e) {
      throw new Error(`刷新失败: ${e.message}`);
    }
  }

  revokeToken(jti) {
    this.revokedTokens.add(jti);
  }

  revokeTokenFamily(family) {
    // 撤销整个令牌族的所有令牌
    for (const [userId, data] of this.refreshTokens.entries()) {
      if (data.family === family) {
        this.refreshTokens.delete(userId);
      }
    }
  }

  logout(userId) {
    this.refreshTokens.delete(userId);
  }
}

// Express 中间件
function createAuthMiddleware(tokenManager) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '缺少认证令牌' });
    }

    const token = authHeader.substring(7);

    try {
      const payload = tokenManager.jwt.verify(token);

      if (payload.type !== 'access') {
        return res.status(401).json({ error: '需要访问令牌' });
      }

      req.user = payload;
      next();
    } catch (e) {
      return res.status(401).json({ error: e.message });
    }
  };
}

// 实战案例
function demo() {
  // 生成强密钥
  const primaryKey = crypto.randomBytes(32).toString('base64');
  const previousKey = crypto.randomBytes(32).toString('base64');

  const jwt = new SecureJWT({ primaryKey, previousKey });
  const manager = new TokenManager(jwt);

  // 生成令牌对
  const tokens = manager.generateTokenPair('user-123', { role: 'admin' });
  console.log('访问令牌:', tokens.accessToken.substring(0, 50) + '...');
  console.log('刷新令牌:', tokens.refreshToken.substring(0, 50) + '...');

  // 验证访问令牌
  const payload = jwt.verify(tokens.accessToken);
  console.log('\n令牌内容:', payload);

  // 模拟刷新
  const newTokens = manager.refreshAccessToken(tokens.refreshToken);
  console.log('\n刷新后的访问令牌:', newTokens.accessToken.substring(0, 50) + '...');
}

module.exports = {
  SecureJWT,
  TokenManager,
  createAuthMiddleware
};

if (require.main === module) {
  demo();
}
```

### 3.2 Session 安全（Secure、HttpOnly、SameSite Cookie）

```javascript
// session-security.js
const crypto = require('crypto');

/**
 * 安全的 Session 管理
 * 实现基于 Cookie 的安全会话
 */

class SecureSessionManager {
  constructor(options = {}) {
    this.cookieName = options.cookieName || '__Host-session';
    this.secret = options.secret || process.env.SESSION_SECRET;
    this.maxAge = options.maxAge || 3600000;  // 1 小时
    this.rolling = options.rolling !== false;  // 默认启用滚动更新

    if (!this.secret || this.secret.length < 32) {
      throw new Error('Session 密钥必须至少 32 字节');
    }

    // 内存存储（生产环境使用 Redis）
    this.sessions = new Map();
  }

  /**
   * 生成安全的 Cookie 设置
   */
  getCookieOptions() {
    return {
      httpOnly: true,      // 禁止 JavaScript 访问
      secure: true,        // 仅 HTTPS
      sameSite: 'strict',  // 防止 CSRF
      maxAge: this.maxAge,
      path: '/',
      // __Host- 前缀要求: secure, path=/, 无 domain
      // 这防止子域覆盖 Cookie
    };
  }

  /**
   * 创建新会话
   */
  createSession(data = {}) {
    const sessionId = crypto.randomBytes(32).toString('base64url');
    const csrfToken = crypto.randomBytes(32).toString('base64url');

    const session = {
      id: sessionId,
      data: {
        ...data,
        createdAt: Date.now(),
        lastAccessed: Date.now()
      },
      csrfToken
    };

    this.sessions.set(sessionId, session);

    // 设置过期清理
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, this.maxAge);

    return session;
  }

  /**
   * 序列化会话 ID 到 Cookie 值（带签名）
   */
  serializeSessionId(sessionId) {
    const timestamp = Date.now().toString(36);
    const payload = `${sessionId}.${timestamp}`;
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('base64url');
    return `${payload}.${signature}`;
  }

  /**
   * 从 Cookie 值解析并验证会话 ID
   */
  deserializeSessionId(cookieValue) {
    const parts = cookieValue.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [sessionId, timestamp, signature] = parts;
    const payload = `${sessionId}.${timestamp}`;

    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('base64url');

    if (!crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )) {
      return null;
    }

    // 检查时间戳是否过期
    const sessionTime = parseInt(timestamp, 36);
    if (Date.now() - sessionTime > this.maxAge) {
      return null;
    }

    return sessionId;
  }

  /**
   * Express 中间件
   */
  middleware() {
    return (req, res, next) => {
      // 解析会话
      const cookieValue = req.headers.cookie
        ?.split(';')
        .find(c => c.trim().startsWith(`${this.cookieName}=`))
        ?.split('=')[1];

      if (cookieValue) {
        const sessionId = this.deserializeSessionId(decodeURIComponent(cookieValue));
        if (sessionId) {
          const session = this.sessions.get(sessionId);
          if (session) {
            // 滚动更新
            if (this.rolling) {
              session.data.lastAccessed = Date.now();
              const newCookie = this.serializeSessionId(sessionId);
              res.cookie(this.cookieName, newCookie, this.getCookieOptions());
            }
            req.session = session.data;
            req.csrfToken = session.csrfToken;
          }
        }
      }

      // 如果无会话，创建访客会话
      if (!req.session) {
        const newSession = this.createSession();
        const cookieValue = this.serializeSessionId(newSession.id);
        res.cookie(this.cookieName, cookieValue, this.getCookieOptions());
        req.session = newSession.data;
        req.csrfToken = newSession.csrfToken;
      }

      // 提供会话操作方法
      req.sessionManager = {
        regenerate: (data) => {
          // 重新生成会话 ID 防止会话固定攻击
          const oldId = this.deserializeSessionId(
            req.headers.cookie?.split(';')
              .find(c => c.trim().startsWith(`${this.cookieName}=`))
              ?.split('=')[1] || ''
          );
          if (oldId) this.sessions.delete(oldId);

          const session = this.createSession(data);
          const newCookie = this.serializeSessionId(session.id);
          res.cookie(this.cookieName, newCookie, this.getCookieOptions());
          req.session = session.data;
          req.csrfToken = session.csrfToken;
        },

        destroy: () => {
          const currentId = this.deserializeSessionId(
            req.headers.cookie?.split(';')
              .find(c => c.trim().startsWith(`${this.cookieName}=`))
              ?.split('=')[1] || ''
          );
          if (currentId) this.sessions.delete(currentId);
          res.clearCookie(this.cookieName, this.getCookieOptions());
          req.session = null;
        }
      };

      next();
    };
  }
}

/**
 * CSRF 防护中间件
 */
function csrfProtection(req, res, next) {
  // GET/HEAD/OPTIONS 请求不需要 CSRF 验证
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // 验证 CSRF Token
  const token = req.headers['x-csrf-token'] ||
                req.body?._csrf ||
                req.headers['x-xsrf-token'];

  if (!token || !req.csrfToken || token !== req.csrfToken) {
    return res.status(403).json({ error: 'CSRF 验证失败' });
  }

  next();
}

/**
 * 生成安全 Cookie 字符串（用于原生 http 模块）
 */
function generateSetCookieHeader(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  if (options.secure) {
    parts.push('Secure');
  }
  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join('; ');
}

// 实战案例：原生 HTTP 服务器中的安全会话
const http = require('http');

function createSecureServer() {
  const sessionManager = new SecureSessionManager({
    secret: crypto.randomBytes(32).toString('hex'),
    maxAge: 3600000
  });

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // 解析 Cookie
    const cookies = req.headers.cookie || '';
    const sessionCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('__Host-session='));

    // 路由处理
    if (url.pathname === '/login' && req.method === 'POST') {
      // 模拟登录
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        // 验证用户后创建会话
        const session = sessionManager.createSession({
          userId: 'user-123',
          role: 'user'
        });

        const cookieValue = sessionManager.serializeSessionId(session.id);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Set-Cookie': generateSetCookieHeader('__Host-session', cookieValue, {
            ...sessionManager.getCookieOptions(),
            maxAge: 3600
          })
        });
        res.end(JSON.stringify({
          success: true,
          csrfToken: session.csrfToken
        }));
      });
      return;
    }

    if (url.pathname === '/api/data' && req.method === 'POST') {
      // 需要 CSRF 保护
      const csrfToken = req.headers['x-csrf-token'];

      if (!sessionCookie) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '未认证' }));
        return;
      }

      // 简化演示：实际应完整验证会话
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: '操作成功' }));
      return;
    }

    if (url.pathname === '/logout') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': generateSetCookieHeader('__Host-session', '', {
          ...sessionManager.getCookieOptions(),
          maxAge: 0
        })
      });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  return server;
}

module.exports = {
  SecureSessionManager,
  csrfProtection,
  generateSetCookieHeader,
  createSecureServer
};

// 演示
if (require.main === module) {
  const manager = new SecureSessionManager({
    secret: crypto.randomBytes(32).toString('hex')
  });

  const session = manager.createSession({ userId: 'demo' });
  console.log('创建会话:', session.id);

  const serialized = manager.serializeSessionId(session.id);
  console.log('Cookie 值:', serialized.substring(0, 50) + '...');

  const recovered = manager.deserializeSessionId(serialized);
  console.log('恢复 ID:', recovered);
}
```

### 3.3 密码安全存储（Node.js crypto.scrypt）

```javascript
// password-security.js
const crypto = require('crypto');
const { promisify } = require('util');

/**
 * 密码安全存储
 * 使用 Node.js 原生 crypto.scrypt（推荐）
 * scrypt 是内存困难的哈希算法，抗 GPU/ASIC 攻击
 */

const scryptAsync = promisify(crypto.scrypt);

class PasswordHasher {
  constructor(options = {}) {
    // scrypt 参数配置
    this.keyLength = options.keyLength || 64;
    this.saltLength = options.saltLength || 32;
    // N: 迭代次数（必须是 2 的幂）
    this.N = options.N || 32768;  // 2^15
    // r: 块大小
    this.r = options.r || 8;
    // p: 并行化因子
    this.p = options.p || 1;
  }

  /**
   * 生成随机盐值
   */
  generateSalt() {
    return crypto.randomBytes(this.saltLength);
  }

  /**
   * 哈希密码
   * 返回格式: $scrypt$N=32768,r=8,p=1$<salt>$<hash>
   */
  async hash(password) {
    if (typeof password !== 'string' || password.length < 8) {
      throw new Error('密码必须至少 8 个字符');
    }

    const salt = this.generateSalt();

    const derivedKey = await scryptAsync(
      password,
      salt,
      this.keyLength,
      {
        N: this.N,
        r: this.r,
        p: this.p
      }
    );

    // 编码为 Modular Crypt Format
    const saltB64 = salt.toString('base64url');
    const hashB64 = derivedKey.toString('base64url');

    return `$scrypt$N=${this.N},r=${this.r},p=${this.p}$${saltB64}$${hashB64}`;
  }

  /**
   * 验证密码
   */
  async verify(password, hashString) {
    // 解析哈希字符串
    const parts = hashString.split('$');
    if (parts.length !== 5 || parts[1] !== 'scrypt') {
      throw new Error('无效的哈希格式');
    }

    // 解析参数
    const params = {};
    parts[2].split(',').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = parseInt(value, 10);
    });

    const salt = Buffer.from(parts[3], 'base64url');
    const expectedHash = Buffer.from(parts[4], 'base64url');

    const derivedKey = await scryptAsync(
      password,
      salt,
      expectedHash.length,
      {
        N: params.N,
        r: params.r,
        p: params.p
      }
    );

    return crypto.timingSafeEqual(derivedKey, expectedHash);
  }

  /**
   * 检查是否需要重新哈希（参数升级）
   */
  needsRehash(hashString) {
    const parts = hashString.split('$');
    if (parts.length !== 5) return true;

    const params = {};
    parts[2].split(',').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = parseInt(value, 10);
    });

    return params.N < this.N ||
           params.r < this.r ||
           params.p < this.p;
  }
}

/**
 * 密码强度验证
 */
function validatePasswordStrength(password) {
  const checks = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommonPatterns: !isCommonPassword(password),
    noSequential: !/(.)(\1{2,})/.test(password)  // 无连续重复 3 次以上
  };

  const score = Object.values(checks).filter(Boolean).length;
  const strength = score >= 6 ? 'strong' : score >= 4 ? 'medium' : 'weak';

  return {
    strength,
    score,
    checks,
    isValid: score >= 4
  };
}

/**
 * 常见密码检查（简化版）
 */
function isCommonPassword(password) {
  const commonPatterns = [
    'password', '123456', 'qwerty', 'admin',
    'letmein', 'welcome', 'monkey', 'dragon'
  ];
  const lower = password.toLowerCase();
  return commonPatterns.some(p => lower.includes(p));
}

/**
 * 使用 Argon2（需要 argon2 包，但更安全）
 * npm install argon2
 */
async function argon2Example() {
  // const argon2 = require('argon2');
  // const hash = await argon2.hash(password, {
  //   type: argon2.argon2id,
  //   memoryCost: 65536,  // 64 MB
  //   timeCost: 3,
  //   parallelism: 4
  // });
  // const valid = await argon2.verify(hash, password);
}

// 实战案例
async function demo() {
  const hasher = new PasswordHasher({
    N: 32768,  // 根据服务器性能调整
    r: 8,
    p: 1
  });

  // 测试密码
  const passwords = [
    'MyStr0ng!Pass',
    'weak',
    'Password123!'
  ];

  for (const pwd of passwords) {
    console.log(`\n测试密码: ${pwd}`);

    const strength = validatePasswordStrength(pwd);
    console.log('强度:', strength.strength, `(${strength.score}/7)`);

    if (!strength.isValid) {
      console.log('不符合要求，跳过哈希');
      continue;
    }

    const hash = await hasher.hash(pwd);
    console.log('哈希:', hash.substring(0, 60) + '...');

    const valid = await hasher.verify(pwd, hash);
    console.log('验证通过:', valid);

    const wrong = await hasher.verify('wrongpassword', hash);
    console.log('错误密码验证:', wrong);

    console.log('需要重新哈希:', hasher.needsRehash(hash));
  }

  // 演示参数升级
  const oldHasher = new PasswordHasher({ N: 1024 });
  const oldHash = await oldHasher.hash('testpassword123!');
  console.log('\n旧参数哈希需要升级:', hasher.needsRehash(oldHash));
}

module.exports = {
  PasswordHasher,
  validatePasswordStrength
};

if (require.main === module) {
  demo().catch(console.error);
}
```

### 3.4 Rate Limiting 实现（基于 Map / Redis）

```javascript
// rate-limiter.js

/**
 * 速率限制器实现
 * 支持内存存储和 Redis 后端
 */

class MemoryRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000;  // 默认 1 分钟
    this.maxRequests = options.maxRequests || 100;
    this.requests = new Map();  // key -> [{ timestamp }]

    // 定期清理过期数据
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * 检查并记录请求
   * 返回 { allowed, remaining, resetTime }
   */
  async check(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let requests = this.requests.get(key) || [];

    // 过滤掉窗口期外的请求
    requests = requests.filter(r => r > windowStart);

    if (requests.length >= this.maxRequests) {
      const oldestRequest = requests[0];
      return {
        allowed: false,
        remaining: 0,
        resetTime: oldestRequest + this.windowMs,
        totalRequests: requests.length
      };
    }

    // 记录当前请求
    requests.push(now);
    this.requests.set(key, requests);

    return {
      allowed: true,
      remaining: this.maxRequests - requests.length,
      resetTime: now + this.windowMs,
      totalRequests: requests.length
    };
  }

  cleanup() {
    const windowStart = Date.now() - this.windowMs;
    for (const [key, requests] of this.requests.entries()) {
      const filtered = requests.filter(r => r > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

/**
 * 滑动窗口日志限流（更精确）
 */
class SlidingWindowLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000;
    this.maxRequests = options.maxRequests || 100;
    this.requests = new Map();
  }

  async check(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = this.requests.get(key) || [];
    const validRequests = timestamps.filter(t => t > windowStart);

    if (validRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: validRequests[0] + this.windowMs
      };
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      resetTime: now + this.windowMs
    };
  }
}

/**
 * 令牌桶限流（允许突发流量）
 */
class TokenBucketLimiter {
  constructor(options = {}) {
    this.capacity = options.capacity || 100;      // 桶容量
    this.refillRate = options.refillRate || 10;   // 每秒填充速率
    this.buckets = new Map();  // key -> { tokens, lastRefill }
  }

  async check(key, tokens = 1) {
    const now = Date.now() / 1000;  // 转为秒

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
    }

    // 计算新填充的令牌
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens < tokens) {
      this.buckets.set(key, bucket);
      return {
        allowed: false,
        remaining: Math.floor(bucket.tokens),
        retryAfter: Math.ceil((tokens - bucket.tokens) / this.refillRate)
      };
    }

    bucket.tokens -= tokens;
    this.buckets.set(key, bucket);

    return {
      allowed: true,
      remaining: Math.floor(bucket.tokens)
    };
  }
}

/**
 * Express 限流中间件工厂
 */
function createRateLimitMiddleware(limiter, options = {}) {
  const {
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
    skipSuccessfulRequests = false,
    handler = (req, res) => {
      res.status(429).json({
        error: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil(res.rateLimit.resetTime / 1000)
      });
    }
  } = options;

  return async (req, res, next) => {
    const key = keyGenerator(req);
    const result = await limiter.check(key);

    // 设置响应头
    res.setHeader('X-RateLimit-Limit', limiter.maxRequests || limiter.capacity);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, result.remaining));
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

    res.rateLimit = result;

    if (!result.allowed) {
      res.setHeader('Retry-After', Math.ceil(result.retryAfter || 60));
      return handler(req, res);
    }

    // 如果配置了跳过成功请求，需要在响应后处理
    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 从计数中移除（需要 limiter 支持）
        }
      });
    }

    next();
  };
}

/**
 * 多层级限流（不同端点不同限制）
 */
class MultiTierRateLimiter {
  constructor(tiers) {
    this.tiers = tiers.map(t => ({
      ...t,
      limiter: t.limiter || new MemoryRateLimiter(t)
    }));
  }

  async check(key, tierName) {
    const tier = this.tiers.find(t => t.name === tierName);
    if (!tier) {
      throw new Error(`未知限流层级: ${tierName}`);
    }
    return tier.limiter.check(key);
  }
}

// 实战案例
async function demo() {
  // 1. 基础限流
  const limiter = new MemoryRateLimiter({
    windowMs: 60000,
    maxRequests: 5
  });

  console.log('=== 固定窗口限流 ===');
  for (let i = 0; i < 7; i++) {
    const result = await limiter.check('user-1');
    console.log(`请求 ${i + 1}:`, result.allowed ? '通过' : '拒绝',
      `剩余: ${result.remaining}`);
  }

  // 2. 令牌桶限流
  const bucket = new TokenBucketLimiter({
    capacity: 10,
    refillRate: 2  // 每秒 2 个
  });

  console.log('\n=== 令牌桶限流 ===');
  for (let i = 0; i < 12; i++) {
    const result = await bucket.check('user-2');
    console.log(`请求 ${i + 1}:`, result.allowed ? '通过' : '拒绝',
      `剩余令牌: ${result.remaining}`);
  }

  // 3. 多层级限流
  const multiTier = new MultiTierRateLimiter([
    { name: 'auth', windowMs: 300000, maxRequests: 5 },    // 登录: 5次/5分钟
    { name: 'api', windowMs: 60000, maxRequests: 100 },     // API: 100次/分钟
    { name: 'public', windowMs: 60000, maxRequests: 1000 }  // 公开: 1000次/分钟
  ]);

  console.log('\n=== 多层级限流 ===');
  const authResult = await multiTier.check('user-3', 'auth');
  console.log('Auth 层级:', authResult);

  limiter.destroy();
}

module.exports = {
  MemoryRateLimiter,
  SlidingWindowLimiter,
  TokenBucketLimiter,
  createRateLimitMiddleware,
  MultiTierRateLimiter
};

if (require.main === module) {
  demo().catch(console.error);
}
```

---

## 4. 敏感数据处理

### 4.1 环境变量安全

```javascript
// env-security.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * 环境变量安全管理
 */

class EnvSecurityManager {
  constructor(options = {}) {
    this.envPath = options.envPath || path.resolve(process.cwd(), '.env');
    this.requiredVars = options.requiredVars || [];
    this.sensitivePatterns = [
      /password/i,
      /secret/i,
      /key/i,
      /token/i,
      /credential/i,
      /private/i
    ];
  }

  /**
   * 加载环境变量并验证
   */
  load() {
    // 1. 检查 .env 文件权限（不应全局可读）
    this.checkFilePermissions();

    // 2. 加载 .env 文件
    if (fs.existsSync(this.envPath)) {
      const content = fs.readFileSync(this.envPath, 'utf-8');
      this.parseEnvFile(content);
    }

    // 3. 验证必需变量
    this.validateRequired();

    // 4. 检测运行时注入
    this.detectRuntimeInjection();

    // 5. 安全审计
    this.auditSensitiveVars();
  }

  /**
   * 检查文件权限
   */
  checkFilePermissions() {
    try {
      const stats = fs.statSync(this.envPath);
      const mode = stats.mode;

      // 检查是否组/其他用户可读写
      const groupRead = mode & parseInt('040', 8);
      const otherRead = mode & parseInt('004', 8);

      if (groupRead || otherRead) {
        console.warn(`[SECURITY] .env 文件权限过于宽松: ${(mode & parseInt('777', 8)).toString(8)}`);
        console.warn('[SECURITY] 建议运行: chmod 600 .env');
      }
    } catch (e) {
      // 在 Windows 上可能不支持权限检查
    }
  }

  /**
   * 解析 .env 文件（不依赖 dotenv 包）
   */
  parseEnvFile(content) {
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // 跳过注释和空行
      if (!trimmed || trimmed.startsWith('#')) continue;

      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;

      const key = trimmed.substring(0, equalIndex).trim();
      let value = trimmed.substring(equalIndex + 1).trim();

      // 去除引号
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // 只在未设置时赋值（环境变量优先级高于 .env）
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }

  /**
   * 验证必需变量
   */
  validateRequired() {
    const missing = this.requiredVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`缺少必需的环境变量: ${missing.join(', ')}`);
    }
  }

  /**
   * 检测运行时注入（检查 NODE_OPTIONS 等）
   */
  detectRuntimeInjection() {
    const suspiciousEnvVars = [
      'NODE_OPTIONS',
      'LD_PRELOAD',
      'DYLD_INSERT_LIBRARIES'
    ];

    for (const varName of suspiciousEnvVars) {
      const value = process.env[varName];
      if (value) {
        console.warn(`[SECURITY] 检测到可疑环境变量: ${varName}=${value}`);

        // 检查是否包含危险选项
        if (varName === 'NODE_OPTIONS' &&
            (/\-\-eval|\-e\s|require\s*\(/i.test(value))) {
          throw new Error(`检测到危险的 NODE_OPTIONS: ${value}`);
        }
      }
    }
  }

  /**
   * 审计敏感变量
   */
  auditSensitiveVars() {
    const sensitive = [];
    for (const [key, value] of Object.entries(process.env)) {
      if (this.sensitivePatterns.some(p => p.test(key))) {
        // 检查是否使用默认值或弱值
        if (this.isWeakValue(value)) {
          sensitive.push({ key, issue: '弱值或默认值' });
        }
        // 检查是否过短
        if (value && value.length < 16) {
          sensitive.push({ key, issue: '值长度过短' });
        }
      }
    }

    if (sensitive.length > 0) {
      console.warn('[SECURITY] 敏感变量审计问题:');
      sensitive.forEach(s => console.warn(`  - ${s.key}: ${s.issue}`));
    }
  }

  isWeakValue(value) {
    const weakValues = ['password', 'secret', '123456', 'admin', 'default'];
    return weakValues.some(w => value?.toLowerCase().includes(w));
  }

  /**
   * 获取环境变量（带类型转换）
   */
  get(key, defaultValue = undefined, type = 'string') {
    const value = process.env[key];

    if (value === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`环境变量未设置: ${key}`);
    }

    switch (type) {
      case 'number':
        const num = Number(value);
        if (isNaN(num)) throw new Error(`环境变量 ${key} 不是有效数字`);
        return num;
      case 'boolean':
        return ['true', '1', 'yes'].includes(value.toLowerCase());
      case 'json':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  /**
   * 生成 .env 文件模板
   */
  generateTemplate() {
    const template = this.requiredVars.map(key => {
      const isSensitive = this.sensitivePatterns.some(p => p.test(key));
      const placeholder = isSensitive
        ? crypto.randomBytes(32).toString('hex')
        : 'your-value-here';
      return `${key}=${placeholder}`;
    }).join('\n');

    fs.writeFileSync(`${this.envPath}.example`, template + '\n');
    console.log(`已生成模板文件: ${this.envPath}.example`);
  }
}

// 实战案例
function demo() {
  const envManager = new EnvSecurityManager({
    requiredVars: ['DATABASE_URL', 'JWT_SECRET', 'API_KEY'],
    envPath: path.resolve(__dirname, '.env')
  });

  try {
    // 创建测试 .env 文件
    const testEnv = `
DATABASE_URL=postgresql://localhost/mydb
JWT_SECRET=test-secret-key-123
API_KEY=sk-test-1234567890abcdef
# 注释行会被忽略
DEBUG=false
`;
    fs.writeFileSync('.env', testEnv);

    envManager.load();

    console.log('DATABASE_URL:', envManager.get('DATABASE_URL'));
    console.log('DEBUG:', envManager.get('DEBUG', false, 'boolean'));

    // 生成模板
    envManager.generateTemplate();

    // 清理
    fs.unlinkSync('.env');
    fs.unlinkSync('.env.example');
  } catch (e) {
    console.error('环境变量错误:', e.message);
  }
}

module.exports = { EnvSecurityManager };

if (require.main === module) {
  demo();
}
```

### 4.2 密钥轮换策略

```javascript
// key-rotation.js
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * 密钥轮换管理器
 * 支持自动轮换、版本控制和回滚
 */

class KeyRotationManager {
  constructor(options = {}) {
    this.storagePath = options.storagePath || path.resolve(process.cwd(), '.keys');
    this.rotationInterval = options.rotationInterval || 30 * 24 * 60 * 60 * 1000;  // 30 天
    this.keepVersions = options.keepVersions || 3;  // 保留版本数
    this.keyLength = options.keyLength || 32;
  }

  async init() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true, mode: 0o700 });
    } catch (e) {
      // 忽略已存在
    }
  }

  /**
   * 生成新密钥
   */
  generateKey() {
    return crypto.randomBytes(this.keyLength).toString('base64');
  }

  /**
   * 存储密钥（加密存储）
   */
  async storeKey(keyId, keyValue, masterKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(masterKey, 'base64').slice(0, 32),
      iv
    );

    let encrypted = cipher.update(keyValue, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    const keyData = {
      id: keyId,
      createdAt: Date.now(),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      encrypted
    };

    await fs.writeFile(
      path.join(this.storagePath, `${keyId}.json`),
      JSON.stringify(keyData, null, 2),
      { mode: 0o600 }
    );
  }

  /**
   * 读取密钥
   */
  async loadKey(keyId, masterKey) {
    const filePath = path.join(this.storagePath, `${keyId}.json`);
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(masterKey, 'base64').slice(0, 32),
      Buffer.from(data.iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(data.authTag, 'base64'));

    let decrypted = decipher.update(data.encrypted, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  }

  /**
   * 轮换密钥
   */
  async rotate(keyName, masterKey) {
    await this.init();

    const newKeyId = `${keyName}-${Date.now()}`;
    const newKey = this.generateKey();

    // 存储新密钥
    await this.storeKey(newKeyId, newKey, masterKey);

    // 更新当前密钥索引
    const indexPath = path.join(this.storagePath, `${keyName}.current`);
    const previousKeyId = await this.getCurrentKeyId(keyName);

    await fs.writeFile(indexPath, newKeyId, { mode: 0o600 });

    // 清理旧版本
    await this.cleanupOldVersions(keyName);

    return {
      keyId: newKeyId,
      previousKeyId,
      key: newKey
    };
  }

  async getCurrentKeyId(keyName) {
    try {
      const indexPath = path.join(this.storagePath, `${keyName}.current`);
      return await fs.readFile(indexPath, 'utf-8');
    } catch {
      return null;
    }
  }

  /**
   * 获取当前密钥
   */
  async getCurrentKey(keyName, masterKey) {
    const keyId = await this.getCurrentKeyId(keyName);
    if (!keyId) return null;
    return this.loadKey(keyId, masterKey);
  }

  /**
   * 获取密钥历史（支持旧数据解密）
   */
  async getKeyHistory(keyName) {
    const files = await fs.readdir(this.storagePath);
    const keyFiles = files
      .filter(f => f.startsWith(keyName) && f.endsWith('.json'))
      .map(f => f.replace('.json', ''))
      .sort((a, b) => {
        const timeA = parseInt(a.split('-').pop());
        const timeB = parseInt(b.split('-').pop());
        return timeB - timeA;
      });

    return keyFiles;
  }

  /**
   * 清理旧版本
   */
  async cleanupOldVersions(keyName) {
    const history = await this.getKeyHistory(keyName);
    const toDelete = history.slice(this.keepVersions);

    for (const keyId of toDelete) {
      try {
        await fs.unlink(path.join(this.storagePath, `${keyId}.json`));
        console.log(`[KEY ROTATION] 已删除旧密钥: ${keyId}`);
      } catch (e) {
        console.error(`删除旧密钥失败: ${keyId}`, e.message);
      }
    }
  }

  /**
   * 检查是否需要轮换
   */
  async needsRotation(keyName) {
    const keyId = await this.getCurrentKeyId(keyName);
    if (!keyId) return true;

    const timestamp = parseInt(keyId.split('-').pop());
    return Date.now() - timestamp > this.rotationInterval;
  }
}

/**
 * 使用密钥版本化的加密/解密
 */
class VersionedEncryption {
  constructor(keyManager, masterKey) {
    this.keyManager = keyManager;
    this.masterKey = masterKey;
  }

  async encrypt(plaintext, keyName = 'data') {
    const key = await this.keyManager.getCurrentKey(keyName, this.masterKey);
    if (!key) {
      throw new Error(`密钥未找到: ${keyName}`);
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64').slice(0, 32),
      iv
    );

    let encrypted = cipher.update(plaintext, 'utf-8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    const keyId = await this.keyManager.getCurrentKeyId(keyName);

    // 包含密钥版本信息，支持解密时自动选择正确密钥
    return JSON.stringify({
      v: 1,
      kid: keyId,
      iv: iv.toString('base64'),
      tag: authTag.toString('base64'),
      data: encrypted
    });
  }

  async decrypt(ciphertext) {
    const envelope = JSON.parse(ciphertext);

    if (envelope.v !== 1) {
      throw new Error(`不支持的加密版本: ${envelope.v}`);
    }

    const key = await this.keyManager.loadKey(envelope.kid, this.masterKey);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'base64').slice(0, 32),
      Buffer.from(envelope.iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));

    let decrypted = decipher.update(envelope.data, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  }
}

// 实战案例
async function demo() {
  const masterKey = crypto.randomBytes(32).toString('base64');
  const keyManager = new KeyRotationManager({
    storagePath: path.resolve(__dirname, '.test-keys'),
    keepVersions: 2
  });

  // 初始化并创建第一个密钥
  await keyManager.init();
  const rotation1 = await keyManager.rotate('api-key', masterKey);
  console.log('初始密钥:', rotation1.keyId);

  // 加密数据
  const encryption = new VersionedEncryption(keyManager, masterKey);
  const encrypted = await encryption.encrypt('敏感数据内容', 'api-key');
  console.log('\n加密结果:', encrypted.substring(0, 100) + '...');

  // 解密
  const decrypted = await encryption.decrypt(encrypted);
  console.log('解密结果:', decrypted);

  // 轮换密钥
  console.log('\n--- 密钥轮换 ---');
  const rotation2 = await keyManager.rotate('api-key', masterKey);
  console.log('新密钥:', rotation2.keyId);
  console.log('旧密钥:', rotation2.previousKeyId);

  // 旧数据仍可用旧密钥解密
  const stillDecrypted = await encryption.decrypt(encrypted);
  console.log('旧数据仍可解密:', stillDecrypted);

  // 新数据使用新密钥
  const encrypted2 = await encryption.encrypt('新数据', 'api-key');
  console.log('\n新加密数据使用密钥:', JSON.parse(encrypted2).kid);

  // 清理
  const fsSync = require('fs');
  fsSync.rmSync(path.resolve(__dirname, '.test-keys'), { recursive: true });
}

module.exports = {
  KeyRotationManager,
  VersionedEncryption
};

if (require.main === module) {
  demo().catch(console.error);
}
```

### 4.3 日志脱敏

```javascript
// log-sanitization.js

/**
 * 日志脱敏工具
 * 防止敏感信息泄露到日志文件
 */

class LogSanitizer {
  constructor(options = {}) {
    this.sensitiveFields = new Set([
      'password',
      'passwd',
      'pwd',
      'secret',
      'token',
      'apiKey',
      'api_key',
      'accessToken',
      'refreshToken',
      'authorization',
      'cookie',
      'session',
      'creditCard',
      'ssn',
      'phone',
      'email',
      'privateKey',
      'private_key',
      'database_url',
      'connection_string'
    ]);

    this.maskChar = options.maskChar || '***';
    this.maxDepth = options.maxDepth || 5;
  }

  /**
   * 判断字段是否敏感
   */
  isSensitiveField(key) {
    const lowerKey = key.toLowerCase();
    return this.sensitiveFields.has(lowerKey) ||
           this.sensitiveFields.has(key) ||
           lowerKey.includes('password') ||
           lowerKey.includes('secret') ||
           lowerKey.includes('token') ||
           lowerKey.includes('key') && !lowerKey.includes('public');
  }

  /**
   * 脱敏对象
   */
  sanitize(obj, depth = 0) {
    if (depth > this.maxDepth) {
      return '[Max Depth Reached]';
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (obj instanceof Error) {
      return this.sanitizeError(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item, depth + 1));
    }

    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        if (this.isSensitiveField(key)) {
          sanitized[key] = this.maskValue(value);
        } else {
          sanitized[key] = this.sanitize(value, depth + 1);
        }
      }
      return sanitized;
    }

    return String(obj);
  }

  /**
   * 脱敏字符串值
   */
  maskValue(value) {
    if (value === null || value === undefined) {
      return value;
    }
    const str = String(value);
    if (str.length <= 4) {
      return this.maskChar;
    }
    // 保留首尾各 2 个字符
    return str.substring(0, 2) + this.maskChar + str.substring(str.length - 2);
  }

  /**
   * 脱敏可能包含敏感信息的字符串
   */
  sanitizeString(str) {
    // 检测并脱敏 URL 中的凭证
    let sanitized = str;

    // 数据库连接字符串
    sanitized = sanitized.replace(
      /(mongodb|postgres|mysql):\/\/[^:]+:[^@]+@/gi,
      '$1://***:***@'
    );

    // Bearer Token
    sanitized = sanitized.replace(
      /Bearer\s+[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
      'Bearer ***'
    );

    // API Key 模式
    sanitized = sanitized.replace(
      /(api[_-]?key[:\s=]+)[a-zA-Z0-9_-]{16,}/gi,
      '$1***'
    );

    return sanitized;
  }

  /**
   * 脱敏 Error 对象
   */
  sanitizeError(error) {
    return {
      name: error.name,
      message: this.sanitizeString(error.message),
      stack: error.stack ? this.sanitizeStack(error.stack) : undefined,
      code: error.code
    };
  }

  /**
   * 脱敏堆栈跟踪
   */
  sanitizeStack(stack) {
    return stack
      .split('\n')
      .map(line => {
        // 脱敏文件路径中的敏感目录
        return line
          .replace(/\/home\/[^\/]+\//g, '/home/***/')
          .replace(/C:\\Users\\[^\\]+\\/g, 'C:\\Users\\***\\');
      })
      .join('\n');
  }

  /**
   * 脱敏 HTTP 请求对象
   */
  sanitizeRequest(req) {
    const headers = this.sanitize(req.headers);

    // 额外处理 Cookie
    if (headers.cookie) {
      headers.cookie = '[REDACTED]';
    }
    if (headers.authorization) {
      headers.authorization = '[REDACTED]';
    }

    return {
      method: req.method,
      url: this.sanitizeUrl(req.url),
      headers,
      query: this.sanitize(req.query),
      body: req.body ? this.sanitize(req.body) : undefined,
      ip: this.maskIp(req.ip || req.connection?.remoteAddress),
      userAgent: req.headers?.['user-agent']
    };
  }

  /**
   * 脱敏 URL（保留查询参数名，脱敏值）
   */
  sanitizeUrl(urlStr) {
    try {
      const url = new URL(urlStr, 'http://localhost');

      // 脱敏查询参数
      for (const [key, value] of url.searchParams) {
        if (this.isSensitiveField(key)) {
          url.searchParams.set(key, this.maskChar);
        }
      }

      return url.pathname + url.search;
    } catch {
      return this.sanitizeString(urlStr);
    }
  }

  /**
   * 脱敏 IP 地址（保留部分信息用于调试）
   */
  maskIp(ip) {
    if (!ip) return ip;
    // 保留前两个八位组
    return ip.replace(/^(\d+\.\d+)\.\d+\.\d+$/, '$1.***.***');
  }
}

/**
 * 安全的日志记录器封装
 */
class SecureLogger {
  constructor(options = {}) {
    this.sanitizer = new LogSanitizer(options);
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
    this.currentLevel = this.levels[options.level || 'info'];
  }

  log(level, message, meta = {}) {
    if (this.levels[level] > this.currentLevel) return;

    const sanitizedMeta = this.sanitizer.sanitize(meta);
    const timestamp = new Date().toISOString();

    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message: typeof message === 'string' ? this.sanitizer.sanitizeString(message) : message,
      ...sanitizedMeta
    };

    // 输出到控制台（生产环境应发送到日志服务）
    const output = JSON.stringify(logEntry);

    if (level === 'error') {
      console.error(output);
    } else if (level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  error(message, meta) { this.log('error', message, meta); }
  warn(message, meta) { this.log('warn', message, meta); }
  info(message, meta) { this.log('info', message, meta); }
  debug(message, meta) { this.log('debug', message, meta); }
}

// 实战案例
function demo() {
  const logger = new SecureLogger({ level: 'debug' });
  const sanitizer = new LogSanitizer();

  // 1. 脱敏对象
  const userData = {
    username: 'john_doe',
    password: 'super_secret_password_123',
    email: 'john@example.com',
    apiKey: 'sk-live-1234567890abcdef',
    profile: {
      phone: '+1234567890',
      creditCard: '4111111111111111'
    }
  };

  console.log('=== 脱敏对象 ===');
  console.log(JSON.stringify(sanitizer.sanitize(userData), null, 2));

  // 2. 脱敏请求
  const mockReq = {
    method: 'POST',
    url: '/api/login?apiKey=secret123&user=john',
    headers: {
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIs...',
      cookie: 'session=abc123; token=xyz789',
      'content-type': 'application/json'
    },
    body: {
      username: 'john',
      password: 'secret123'
    },
    ip: '192.168.1.100'
  };

  console.log('\n=== 脱敏请求 ===');
  console.log(JSON.stringify(sanitizer.sanitizeRequest(mockReq), null, 2));

  // 3. 使用安全日志记录器
  console.log('\n=== 安全日志 ===');
  logger.info('用户登录', {
    userId: '123',
    password: 'should_be_masked',
    token: 'secret-token'
  });

  logger.error('数据库连接失败', {
    connectionString: 'postgresql://admin:secret@localhost/db',
    error: new Error('Connection refused')
  });
}

module.exports = {
  LogSanitizer,
  SecureLogger
};

if (require.main === module) {
  demo();
}
```

---

## 5. HTTP 安全头

### 5.1 使用内置模块配置安全头

```javascript
// http-security-headers.js
const http = require('http');

/**
 * HTTP 安全头配置
 * 使用 Node.js 原生 http 模块实现
 */

const SECURITY_HEADERS = {
  // 内容安全策略
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'nonce-{nonce}'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),

  // 严格传输安全
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // 防止 MIME 类型嗅探
  'X-Content-Type-Options': 'nosniff',

  // 点击劫持防护
  'X-Frame-Options': 'DENY',

  // XSS 防护（现代浏览器主要依赖 CSP）
  'X-XSS-Protection': '0',

  //  referrer 策略
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // 权限策略（控制浏览器 API 访问）
  'Permissions-Policy': [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=()',
    'usb=()'
  ].join(', '),

  // 移除服务器标识
  'X-Powered-By': undefined,  // 移除
  'Server': undefined
};

/**
 * 生成 nonce（用于 CSP script-src）
 */
function generateNonce() {
  return require('crypto').randomBytes(16).toString('base64');
}

/**
 * 应用安全头
 */
function applySecurityHeaders(res, options = {}) {
  const nonce = options.nonce || generateNonce();

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    if (value === undefined) {
      res.removeHeader(header);
    } else {
      const finalValue = value.replace(/{nonce}/g, nonce);
      res.setHeader(header, finalValue);
    }
  }

  return nonce;
}

/**
 * 根据路由定制 CSP
 */
function getCSPForRoute(path, nonce) {
  const baseCSP = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  };

  // API 路由更严格
  if (path.startsWith('/api/')) {
    baseCSP['default-src'] = ["'none'"];
    baseCSP['script-src'] = ["'none'"];
    baseCSP['style-src'] = ["'none'"];
  }

  // 管理后台额外限制
  if (path.startsWith('/admin/')) {
    baseCSP['upgrade-insecure-requests'] = [];
  }

  return Object.entries(baseCSP)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * 安全头中间件（Express 风格）
 */
function securityHeadersMiddleware(options = {}) {
  return (req, res, next) => {
    const nonce = generateNonce();
    res.locals.cspNonce = nonce;

    // 基础安全头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Permissions-Policy', SECURITY_HEADERS['Permissions-Policy']);

    // 仅在 HTTPS 时设置 HSTS
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security',
        'max-age=31536000; includeSubDomains');
    }

    // 动态 CSP
    const csp = getCSPForRoute(req.path, nonce);
    res.setHeader('Content-Security-Policy', csp);

    // 移除指纹头
    res.removeHeader('X-Powered-By');

    next();
  };
}

// 实战案例：原生 HTTP 服务器
function createSecureServer() {
  return http.createServer((req, res) => {
    const nonce = applySecurityHeaders(res);

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>安全页面</title>
        </head>
        <body>
          <h1>安全 HTTP 头演示</h1>
          <!-- 使用 nonce 的内联脚本 -->
          <script nonce="${nonce}">
            console.log('CSP 允许的脚本');
          </script>
          <!-- 这个脚本会被 CSP 阻止 -->
          <script>
            console.log('这会被 CSP 阻止');
          </script>
        </body>
        </html>
      `);
      return;
    }

    if (url.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });
}

// 实战案例：CSP 违规报告收集
function createCSPReportEndpoint() {
  return (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const report = JSON.parse(body);
        const cspReport = report['csp-report'] || report;

        // 记录 CSP 违规（注意脱敏）
        console.warn('[CSP 违规]', {
          documentUri: cspReport['document-uri'],
          blockedUri: cspReport['blocked-uri'],
          violatedDirective: cspReport['violated-directive'],
          originalPolicy: cspReport['original-policy']?.substring(0, 200)
        });

        res.writeHead(204);
        res.end();
      } catch (e) {
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
  };
}

module.exports = {
  applySecurityHeaders,
  getCSPForRoute,
  securityHeadersMiddleware,
  createSecureServer,
  createCSPReportEndpoint,
  generateNonce
};

// 演示
if (require.main === module) {
  const server = createSecureServer();
  server.listen(3456, () => {
    console.log('安全服务器运行在 http://localhost:3456');
    console.log('测试命令: curl -I http://localhost:3456/');
    setTimeout(() => server.close(), 1000);
  });
}
```

### 5.2 使用 Helmet 配置

```javascript
// helmet-config.js
/**
 * Helmet 配置示例
 * npm install helmet
 *
 * 如果不使用 Helmet，上面的原生实现已经足够
 */

// 推荐的 Helmet 配置
const helmetConfig = {
  // 内容安全策略
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: []
    },
    reportOnly: false  // 设为 true 仅报告不阻止（调试用）
  },

  // 跨源嵌入者策略
  crossOriginEmbedderPolicy: true,

  // 跨源 opener 策略
  crossOriginOpenerPolicy: { policy: 'same-origin' },

  // 跨源资源策略
  crossOriginResourcePolicy: { policy: 'cross-origin' },

  // DNS 预取控制
  dnsPrefetchControl: { allow: false },

  // 期望 CT（证书透明度）
  expectCt: {
    maxAge: 86400,
    enforce: true
  },

  // 帧选项
  frameguard: {
    action: 'deny'  // 或 'sameorigin'
  },

  // 隐藏 Powered-By
  hidePoweredBy: true,

  // HSTS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },

  // IE 限制
  ieNoOpen: true,

  // 权限策略
  permissionsPolicy: {
    features: {
      accelerometer: ["'none'"],
      camera: ["'none'"],
      geolocation: ["'none'"],
      gyroscope: ["'none'"],
      microphone: ["'none'"]
    }
  },

  // 不嗅探 MIME 类型
  noSniff: true,

  // 来源代理
  originAgentCluster: true,

  // Referrer 策略
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  // XSS 过滤
  xssFilter: false  // 现代浏览器使用 CSP 替代
};

module.exports = { helmetConfig };
```

---

## 6. 文件系统安全

### 6.1 路径遍历防护

```javascript
// path-security.js
const path = require('path');
const fs = require('fs');

/**
 * 安全的文件路径处理
 * 防止路径遍历攻击
 */

class SafePathResolver {
  constructor(allowedBasePath) {
    // 解析为绝对路径
    this.basePath = path.resolve(allowedBasePath);
  }

  /**
   * 安全解析用户输入的路径
   * 确保结果在允许目录内
   */
  resolve(userPath) {
    if (!userPath || typeof userPath !== 'string') {
      throw new Error('路径不能为空');
    }

    // 拒绝空字节注入
    if (userPath.includes('\0')) {
      throw new Error('路径包含非法字符');
    }

    // 拒绝绝对路径（防止直接访问系统文件）
    if (path.isAbsolute(userPath)) {
      throw new Error('不接受绝对路径');
    }

    // 解析路径（处理 .. 和 .）
    const resolved = path.resolve(this.basePath, userPath);

    // 关键检查：确保解析后的路径在 basePath 内
    // 使用 path.sep 确保跨平台兼容
    const relative = path.relative(this.basePath, resolved);

    // 检查是否以 .. 开头（表示在 basePath 之外）
    if (relative.startsWith('..') || relative === '..') {
      throw new Error('路径遍历攻击检测');
    }

    // 额外检查：确保解析后的路径确实以 basePath 开头
    if (!resolved.startsWith(this.basePath + path.sep) &&
        resolved !== this.basePath) {
      throw new Error('路径超出允许范围');
    }

    return resolved;
  }

  /**
   * 安全读取文件
   */
  readFile(userPath, options = {}) {
    const safePath = this.resolve(userPath);

    // 检查文件存在且是常规文件（非目录、非符号链接）
    const stats = fs.lstatSync(safePath);

    if (!stats.isFile()) {
      throw new Error('路径不是文件');
    }

    // 检查符号链接
    if (stats.isSymbolicLink()) {
      throw new Error('符号链接不被允许');
    }

    // 文件大小限制
    if (options.maxSize && stats.size > options.maxSize) {
      throw new Error(`文件超过大小限制: ${options.maxSize} bytes`);
    }

    return fs.readFileSync(safePath, options.encoding);
  }

  /**
   * 安全列出目录
   */
  listDirectory(userPath = '.') {
    const safePath = this.resolve(userPath);
    const stats = fs.lstatSync(safePath);

    if (!stats.isDirectory()) {
      throw new Error('路径不是目录');
    }

    return fs.readdirSync(safePath, { withFileTypes: true })
      .map(entry => ({
        name: entry.name,
        isFile: entry.isFile(),
        isDirectory: entry.isDirectory()
      }));
  }
}

// 实战案例
function demo() {
  const resolver = new SafePathResolver('/var/www/files');

  // 正常路径
  try {
    const safe = resolver.resolve('documents/report.pdf');
    console.log('安全路径:', safe);
  } catch (e) {
    console.error('错误:', e.message);
  }

  // 路径遍历攻击
  const attacks = [
    '../../../etc/passwd',
    '..\\..\\windows\\system32\\config\\sam',
    'documents/../../etc/hosts',
    '/etc/passwd',
    'file\0.txt'
  ];

  console.log('\n=== 路径遍历攻击测试 ===');
  for (const attack of attacks) {
    try {
      const result = resolver.resolve(attack);
      console.log(`[通过] ${attack} -> ${result}`);
    } catch (e) {
      console.log(`[拦截] ${attack} -> ${e.message}`);
    }
  }
}

module.exports = { SafePathResolver };

if (require.main === module) {
  // 使用临时目录演示
  const tmpDir = require('os').tmpdir();
  const testDir = path.join(tmpDir, 'safe-path-test');
  fs.mkdirSync(testDir, { recursive: true });
  fs.mkdirSync(path.join(testDir, 'subdir'), { recursive: true });
  fs.writeFileSync(path.join(testDir, 'test.txt'), 'hello');

  const resolver = new SafePathResolver(testDir);

  console.log('安全路径:', resolver.resolve('test.txt'));
  console.log('子目录:', resolver.resolve('subdir/file.txt'));

  try {
    resolver.resolve('../outside.txt');
  } catch (e) {
    console.log('攻击拦截:', e.message);
  }

  // 清理
  fs.rmSync(testDir, { recursive: true });
}
```

### 6.2 文件上传安全

```javascript
// file-upload-security.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');

/**
 * 安全的文件上传处理
 */

class SecureFileUploader {
  constructor(options = {}) {
    this.uploadDir = options.uploadDir || path.resolve(process.cwd(), 'uploads');
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024;  // 5MB
    this.allowedMimeTypes = new Set(options.allowedMimeTypes || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain'
    ]);
    this.allowedExtensions = new Set(options.allowedExtensions || [
      '.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt'
    ]);

    // 确保上传目录存在且隔离
    this.ensureUploadDir();
  }

  ensureUploadDir() {
    fs.mkdirSync(this.uploadDir, { recursive: true });

    // 创建 .htaccess / nginx 配置防止执行上传文件
    const htaccessPath = path.join(this.uploadDir, '.htaccess');
    if (!fs.existsSync(htaccessPath)) {
      fs.writeFileSync(htaccessPath, 'Options -ExecCGI\nAddHandler cgi-script .php .pl .py .jsp .asp .sh .cgi\n');
    }
  }

  /**
   * 验证 MIME 类型（不能仅依赖客户端提供的 Content-Type）
   */
  async validateMimeType(filePath, claimedMimeType) {
    // 读取文件头进行魔数检测
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8);
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    const signatures = {
      '\x89PNG': 'image/png',
      '\xFF\xD8\xFF': 'image/jpeg',
      'GIF87a': 'image/gif',
      'GIF89a': 'image/gif',
      '%PDF': 'application/pdf'
    };

    const detectedMime = Object.entries(signatures).find(([sig]) =>
      buffer.toString('ascii', 0, sig.length) === sig ||
      buffer.toString('hex', 0, 2) === '8950'  // PNG
    )?.[1];

    if (detectedMime && detectedMime !== claimedMimeType) {
      throw new Error(`MIME 类型不匹配: 声称 ${claimedMimeType}, 实际 ${detectedMime}`);
    }

    if (!this.allowedMimeTypes.has(claimedMimeType) &&
        !this.allowedMimeTypes.has(detectedMime)) {
      throw new Error('不支持的文件类型');
    }

    return detectedMime || claimedMimeType;
  }

  /**
   * 生成安全的文件名
   */
  generateSafeFilename(originalName) {
    // 提取扩展名
    const ext = path.extname(originalName).toLowerCase();

    if (!this.allowedExtensions.has(ext)) {
      throw new Error(`不支持的文件扩展名: ${ext}`);
    }

    // 使用随机名称，避免原始文件名中的攻击
    const randomName = crypto.randomBytes(16).toString('hex');
    return `${randomName}${ext}`;
  }

  /**
   * 处理上传流
   */
  async handleUpload(sourceStream, options = {}) {
    const { originalName, mimeType, userId } = options;

    // 生成安全文件名
    const safeName = this.generateSafeFilename(originalName);

    // 按用户隔离存储
    const userDir = userId
      ? path.join(this.uploadDir, 'users', String(userId))
      : path.join(this.uploadDir, 'anonymous');
    fs.mkdirSync(userDir, { recursive: true });

    const filePath = path.join(userDir, safeName);

    // 写入文件（带大小限制）
    let size = 0;
    const limitStream = new (require('stream').Transform)({
      transform(chunk, encoding, callback) {
        size += chunk.length;
        if (size > this.maxFileSize) {
          callback(new Error(`文件超过大小限制: ${this.maxFileSize} bytes`));
          return;
        }
        callback(null, chunk);
      }
    });

    const writeStream = fs.createWriteStream(filePath, { flags: 'wx' });  // wx: 不存在才创建

    try {
      await pipeline(sourceStream, limitStream, writeStream);
    } catch (e) {
      // 清理失败的上传
      try { fs.unlinkSync(filePath); } catch {}
      throw e;
    }

    // 验证 MIME 类型
    const validatedMime = await this.validateMimeType(filePath, mimeType);

    // 计算文件哈希（用于去重和完整性验证）
    const hash = await this.computeFileHash(filePath);

    // 设置文件权限（只读）
    fs.chmodSync(filePath, 0o444);

    return {
      originalName,
      storedName: safeName,
      path: filePath,
      size,
      mimeType: validatedMime,
      hash,
      uploadedAt: new Date().toISOString()
    };
  }

  /**
   * 计算文件哈希
   */
  async computeFileHash(filePath, algorithm = 'sha256') {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * 安全提供文件（防止路径遍历）
   */
  async serveFile(fileId, userId) {
    // 从数据库查找文件记录
    // const fileRecord = await db.files.findOne({ id: fileId, userId });

    // 这里简化演示，实际应从数据库查询
    const userDir = path.join(this.uploadDir, 'users', String(userId));

    // 验证 fileId 格式（只允许十六进制）
    if (!/^[a-f0-9]{32}\.[a-z]+$/.test(fileId)) {
      throw new Error('非法的文件标识');
    }

    const filePath = path.join(userDir, fileId);

    // 确保路径在允许目录内
    if (!filePath.startsWith(userDir + path.sep)) {
      throw new Error('路径遍历检测');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error('文件不存在');
    }

    return filePath;
  }
}

// Express 中间件集成示例
function createUploadMiddleware(uploader) {
  return async (req, res, next) => {
    // 使用 multer 或原生流处理
    // 这里展示原生处理

    const contentType = req.headers['content-type'] || '';

    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: '需要 multipart/form-data' });
    }

    // 检查 Content-Length
    const contentLength = parseInt(req.headers['content-length'], 10);
    if (contentLength > uploader.maxFileSize) {
      return res.status(413).json({ error: '文件过大' });
    }

    // 实际项目中使用 busboy 或 multer 解析 multipart
    // 这里简化处理
    next();
  };
}

module.exports = {
  SecureFileUploader,
  createUploadMiddleware
};
```

### 6.3 符号链接攻击防护

```javascript
// symlink-protection.js
const fs = require('fs');
const path = require('path');

/**
 * 符号链接攻击防护
 * 确保操作的真实路径在允许范围内
 */

class SymlinkSafeResolver {
  constructor(allowedBasePath) {
    this.basePath = path.resolve(allowedBasePath);
  }

  /**
   * 获取真实路径（解析所有符号链接）
   */
  async realPath(userPath) {
    const resolved = path.resolve(this.basePath, userPath);

    // 使用 fs.realpath 解析所有符号链接
    let realPath;
    try {
      realPath = await fs.promises.realpath(resolved);
    } catch (e) {
      if (e.code === 'ENOENT') {
        // 文件不存在，检查父目录
        const parentDir = path.dirname(resolved);
        try {
          const realParent = await fs.promises.realpath(parentDir);
          realPath = path.join(realParent, path.basename(resolved));
        } catch {
          throw new Error('路径不存在');
        }
      } else {
        throw e;
      }
    }

    // 验证真实路径在允许范围内
    if (!realPath.startsWith(this.basePath + path.sep) &&
        realPath !== this.basePath) {
      throw new Error('符号链接指向路径超出允许范围');
    }

    return realPath;
  }

  /**
   * 同步版本
   */
  realPathSync(userPath) {
    const resolved = path.resolve(this.basePath, userPath);

    let realPath;
    try {
      realPath = fs.realpathSync(resolved);
    } catch (e) {
      if (e.code === 'ENOENT') {
        const parentDir = path.dirname(resolved);
        const realParent = fs.realpathSync(parentDir);
        realPath = path.join(realParent, path.basename(resolved));
      } else {
        throw e;
      }
    }

    if (!realPath.startsWith(this.basePath + path.sep) &&
        realPath !== this.basePath) {
      throw new Error('符号链接指向路径超出允许范围');
    }

    return realPath;
  }

  /**
   * 安全检查：禁止符号链接
   */
  checkNoSymlink(filePath) {
    const stats = fs.lstatSync(filePath);
    if (stats.isSymbolicLink()) {
      throw new Error('符号链接不被允许');
    }
    return stats;
  }

  /**
   * 安全遍历目录
   */
  async *walkSafe(dirPath, options = {}) {
    const followSymlinks = options.followSymlinks || false;
    const maxDepth = options.maxDepth || 10;

    async function* walk(currentPath, depth) {
      if (depth > maxDepth) {
        console.warn(`[SECURITY] 目录深度超过限制: ${currentPath}`);
        return;
      }

      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isSymbolicLink() && !followSymlinks) {
          console.warn(`[SECURITY] 跳过符号链接: ${fullPath}`);
          continue;
        }

        if (entry.isDirectory()) {
          if (followSymlinks) {
            const realPath = await fs.promises.realpath(fullPath);
            yield* walk(realPath, depth + 1);
          } else {
            yield* walk(fullPath, depth + 1);
          }
        } else if (entry.isFile()) {
          yield fullPath;
        }
      }
    }

    yield* walk(dirPath, 0);
  }
}

// 实战案例
async function demo() {
  const tmpDir = require('os').tmpdir();
  const baseDir = path.join(tmpDir, 'symlink-test');
  const safeDir = path.join(baseDir, 'safe');
  const outsideDir = path.join(baseDir, 'outside');

  // 创建测试目录结构
  fs.mkdirSync(safeDir, { recursive: true });
  fs.mkdirSync(outsideDir, { recursive: true });
  fs.writeFileSync(path.join(safeDir, 'allowed.txt'), 'safe content');
  fs.writeFileSync(path.join(outsideDir, 'secret.txt'), 'secret content');

  // 创建恶意符号链接
  const evilLink = path.join(safeDir, 'evil-link');
  try {
    fs.unlinkSync(evilLink);
  } catch {}
  fs.symlinkSync(path.join(outsideDir, 'secret.txt'), evilLink);

  const resolver = new SymlinkSafeResolver(safeDir);

  console.log('=== 符号链接攻击测试 ===\n');

  // 1. 使用 realPath 检测符号链接攻击
  try {
    const real = await resolver.realPath('evil-link');
    console.log('realPath 结果:', real);
  } catch (e) {
    console.log('[拦截]', e.message);
  }

  // 2. 安全遍历
  console.log('\n安全遍历目录:');
  const walker = new SymlinkSafeResolver(safeDir);
  for await (const file of walker.walkSafe(safeDir)) {
    console.log('  文件:', path.relative(safeDir, file));
  }

  // 3. 检查符号链接
  try {
    resolver.checkNoSymlink(evilLink);
  } catch (e) {
    console.log('\n[拦截]', e.message);
  }

  // 清理
  fs.rmSync(baseDir, { recursive: true });
}

module.exports = { SymlinkSafeResolver };

if (require.main === module) {
  demo().catch(console.error);
}
```

---

## 7. DoS 防护

### 7.1 请求体大小限制

```javascript
// dos-protection.js
const http = require('http');

/**
 * DoS 防护中间件和配置
 */

/**
 * 请求体大小限制
 */
function createBodySizeLimit(maxSize = 1024 * 1024) {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'], 10);

    // 预检查 Content-Length
    if (contentLength > maxSize) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Payload Too Large',
        maxSize: maxSize
      }));
      return;
    }

    let body = '';
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        req.destroy();  // 立即终止连接
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      req.body = body;
      next();
    });

    req.on('error', (err) => {
      next(err);
    });
  };
}

/**
 * 流式 JSON 解析（防止大 JSON 攻击）
 */
function createSafeJsonParser(maxDepth = 10, maxKeys = 1000) {
  return (req, res, next) => {
    if (!req.body) return next();

    try {
      const parsed = safeJsonParse(req.body, maxDepth, maxKeys);
      req.parsedBody = parsed;
      next();
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  };
}

function safeJsonParse(str, maxDepth, maxKeys) {
  let keyCount = 0;

  function checkDepth(obj, depth) {
    if (depth > maxDepth) {
      throw new Error(`JSON 嵌套深度超过限制: ${maxDepth}`);
    }

    if (Array.isArray(obj)) {
      if (obj.length > 10000) {
        throw new Error('数组元素过多');
      }
      obj.forEach(item => {
        if (item !== null && typeof item === 'object') {
          checkDepth(item, depth + 1);
        }
      });
    } else if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj);
      keyCount += keys.length;
      if (keyCount > maxKeys) {
        throw new Error(`JSON 键数量超过限制: ${maxKeys}`);
      }

      for (const key of keys) {
        if (key.length > 1000) {
          throw new Error('键名过长');
        }
        const value = obj[key];
        if (value !== null && typeof value === 'object') {
          checkDepth(value, depth + 1);
        }
      }
    }
  }

  const parsed = JSON.parse(str);
  checkDepth(parsed, 1);
  return parsed;
}
```

### 7.2 超时配置

```javascript
// timeout-config.js
const http = require('http');
const net = require('net');

/**
 * 服务器超时配置
 */

function createServerWithTimeouts(options = {}) {
  const server = http.createServer(options.handler);

  // 服务器级别的超时
  server.timeout = options.serverTimeout || 30000;           // 30 秒
  server.keepAliveTimeout = options.keepAliveTimeout || 5000; // 5 秒
  server.headersTimeout = options.headersTimeout || 10000;    // 10 秒
  server.requestTimeout = options.requestTimeout || 30000;    // Node 18+ 请求超时

  // 连接级别控制
  server.on('connection', (socket) => {
    // 设置 socket 超时
    socket.setTimeout(options.socketTimeout || 30000);
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 30000);

    // 限制单个 IP 的连接数
    trackConnection(socket);
  });

  // 请求级别超时
  server.on('request', (req, res) => {
    const requestTimeout = setTimeout(() => {
      if (!res.headersSent) {
        res.writeHead(408, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request Timeout' }));
      }
      req.destroy();
    }, options.requestTimeout || 30000);

    res.on('finish', () => {
      clearTimeout(requestTimeout);
    });
  });

  return server;
}

/**
 * 连接数限制
 */
class ConnectionLimiter {
  constructor(options = {}) {
    this.maxConnectionsPerIp = options.maxConnectionsPerIp || 100;
    this.maxTotalConnections = options.maxTotalConnections || 1000;
    this.connections = new Map();  // ip -> Set<socket>
    this.totalConnections = 0;
  }

  track(socket) {
    const ip = socket.remoteAddress;

    // 检查总数限制
    if (this.totalConnections >= this.maxTotalConnections) {
      socket.destroy();
      return false;
    }

    // 检查单 IP 限制
    const ipConnections = this.connections.get(ip) || new Set();
    if (ipConnections.size >= this.maxConnectionsPerIp) {
      console.warn(`[DoS] IP ${ip} 连接数超过限制`);
      socket.destroy();
      return false;
    }

    ipConnections.add(socket);
    this.connections.set(ip, ipConnections);
    this.totalConnections++;

    socket.on('close', () => {
      ipConnections.delete(socket);
      if (ipConnections.size === 0) {
        this.connections.delete(ip);
      }
      this.totalConnections--;
    });

    return true;
  }

  getStats() {
    return {
      totalConnections: this.totalConnections,
      uniqueIps: this.connections.size,
      perIp: Array.from(this.connections.entries()).map(([ip, sockets]) => ({
        ip,
        count: sockets.size
      }))
    };
  }
}

const globalConnectionLimiter = new ConnectionLimiter();

function trackConnection(socket) {
  globalConnectionLimiter.track(socket);
}
```

### 7.3 内存泄漏检测

```javascript
// memory-leak-detection.js

/**
 * 内存泄漏检测与防护
 */

class MemoryLeakDetector {
  constructor(options = {}) {
    this.thresholdMB = options.thresholdMB || 500;
    this.checkInterval = options.checkInterval || 60000;  // 1 分钟
    this.growthThreshold = options.growthThreshold || 50;  // 50MB 增长触发警告
    this.samples = [];
    this.interval = null;
  }

  start() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      this.check();
    }, this.checkInterval);

    // 监听 V8 垃圾回收统计（需要 --expose-gc 标志）
    if (global.gc) {
      console.log('[Memory] 垃圾回收接口可用');
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  check() {
    const usage = process.memoryUsage();
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
    const rssMB = Math.round(usage.rss / 1024 / 1024);

    this.samples.push({
      timestamp: Date.now(),
      heapUsed: heapUsedMB,
      rss: rssMB,
      external: Math.round(usage.external / 1024 / 1024)
    });

    // 只保留最近 60 个样本
    if (this.samples.length > 60) {
      this.samples.shift();
    }

    // 检查阈值
    if (heapUsedMB > this.thresholdMB) {
      console.warn(`[MEMORY WARNING] 堆内存使用: ${heapUsedMB}MB (阈值: ${this.thresholdMB}MB)`);
    }

    // 检查持续增长趋势
    if (this.samples.length >= 10) {
      const recent = this.samples.slice(-10);
      const first = recent[0].heapUsed;
      const last = recent[recent.length - 1].heapUsed;
      const growth = last - first;

      if (growth > this.growthThreshold) {
        console.error(`[MEMORY LEAK DETECTED] 10 分钟内内存增长: ${growth}MB`);
        this.dumpHeapSnapshot();
      }
    }

    return { heapUsedMB, rssMB };
  }

  dumpHeapSnapshot() {
    try {
      const snapshot = require('v8').writeHeapSnapshot();
      console.log(`[MEMORY] 堆快照已保存: ${snapshot}`);
    } catch (e) {
      console.error('[MEMORY] 无法生成堆快照:', e.message);
    }
  }

  getStats() {
    if (this.samples.length === 0) return null;

    const latest = this.samples[this.samples.length - 1];
    const oldest = this.samples[0];

    return {
      current: latest,
      growthSinceStart: latest.heapUsed - oldest.heapUsed,
      sampleCount: this.samples.length,
      averageHeap: Math.round(
        this.samples.reduce((sum, s) => sum + s.heapUsed, 0) / this.samples.length
      )
    };
  }
}

/**
 * 资源清理助手
 */
class ResourceManager {
  constructor() {
    this.resources = new Set();
  }

  add(resource, type = 'unknown') {
    const ref = { resource, type, createdAt: Date.now() };
    this.resources.add(ref);

    // 自动清理监听
    if (resource.on && typeof resource.on === 'function') {
      resource.on('close', () => this.remove(ref));
      resource.on('end', () => this.remove(ref));
      resource.on('error', () => this.remove(ref));
    }

    return ref;
  }

  remove(ref) {
    this.resources.delete(ref);
  }

  cleanup() {
    const now = Date.now();
    const timeout = 300000;  // 5 分钟

    for (const ref of this.resources) {
      if (now - ref.createdAt > timeout) {
        console.warn(`[RESOURCE] 清理超时资源: ${ref.type}`);
        if (ref.resource.destroy) {
          ref.resource.destroy();
        } else if (ref.resource.end) {
          ref.resource.end();
        } else if (ref.resource.close) {
          ref.resource.close();
        }
        this.resources.delete(ref);
      }
    }
  }

  getStats() {
    const byType = {};
    for (const ref of this.resources) {
      byType[ref.type] = (byType[ref.type] || 0) + 1;
    }
    return { total: this.resources.size, byType };
  }
}

// 实战案例：完整的 DoS 防护服务器
function createProtectedServer(port = 3000) {
  const memoryDetector = new MemoryLeakDetector();
  memoryDetector.start();

  const connectionLimiter = new ConnectionLimiter({
    maxConnectionsPerIp: 50,
    maxTotalConnections: 500
  });

  const server = http.createServer((req, res) => {
    // 请求超时
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.writeHead(408);
        res.end('Request Timeout');
      }
    }, 10000);

    res.on('finish', () => clearTimeout(timeout));

    // 限制请求体大小
    const maxSize = 1024 * 1024;  // 1MB
    const contentLength = parseInt(req.headers['content-length'], 10);

    if (contentLength > maxSize) {
      res.writeHead(413);
      res.end('Payload Too Large');
      return;
    }

    // 路由处理
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        memory: memoryDetector.getStats(),
        connections: connectionLimiter.getStats()
      }));
      return;
    }

    res.writeHead(200);
    res.end('OK');
  });

  // 连接控制
  server.on('connection', (socket) => {
    connectionLimiter.track(socket);
  });

  // 全局超时
  server.timeout = 30000;
  server.keepAliveTimeout = 5000;

  server.listen(port, () => {
    console.log(`受保护的服务器运行在端口 ${port}`);
  });

  return server;
}

module.exports = {
  MemoryLeakDetector,
  ResourceManager,
  ConnectionLimiter,
  createProtectedServer,
  createBodySizeLimit
};

// 演示
if (require.main === module) {
  const detector = new MemoryLeakDetector({ checkInterval: 5000 });
  detector.start();

  console.log('内存检测已启动');

  // 模拟内存增长
  const leakyArray = [];
  setInterval(() => {
    leakyArray.push(new Array(100000).fill('leak'));
    const stats = detector.check();
    console.log('内存状态:', stats);
  }, 3000);

  // 10 秒后停止
  setTimeout(() => {
    detector.stop();
    console.log('最终统计:', detector.getStats());
    process.exit(0);
  }, 15000);
}
```

---

## 总结

本文档涵盖了 Node.js 应用安全的 7 个核心领域：

| 领域 | 关键措施 |
|------|----------|
| 依赖安全 | `npm audit`, `overrides`, `corepack`, 依赖审查 |
| 输入验证 | 参数化查询, NoSQL 清理, 命令白名单, ReDoS 超时 |
| 认证授权 | JWT 轮换, Session Cookie 安全, scrypt, 限流 |
| 敏感数据 | `.env` 管理, 密钥轮换, 日志脱敏 |
| HTTP 安全 | CSP, HSTS, 权限策略, 安全 Cookie |
| 文件系统 | 路径验证, 上传限制, 符号链接检查 |
| DoS 防护 | 大小限制, 超时, 连接限制, 内存监控 |

**安全是持续的过程，不是一次性的配置。** 建议：

1. 将安全审计集成到 CI/CD 流程
2. 定期更新依赖并审查漏洞
3. 监控生产环境的安全事件
4. 保持对新型攻击手法的关注
