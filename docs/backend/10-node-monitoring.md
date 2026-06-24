# Node.js 监控实战：指标体系、链路追踪与告警

监控是保障 Node.js 服务稳定运行的核心能力。本文从指标采集、健康检查、链路追踪到告警通知，构建一套完整的 Node.js 监控体系。

---

## 目录

1. [为什么需要监控](#一为什么需要监控)
2. [监控三大支柱](#二监控三大支柱)
3. [Node.js 内置指标](#三nodejs-内置指标)
4. [Prometheus + Grafana 实战](#四prometheus--grafana-实战)
5. [分布式链路追踪](#五分布式链路追踪)
6. [健康检查与探针](#六健康检查与探针)
7. [告警设计](#七告警设计)
8. [总结](#八总结)

---

## 一、为什么需要监控

没有监控的系统就像没有仪表盘的飞机。生产环境中需要监控来回答：

- 服务是否存活？
- 接口延迟是否正常？
- 错误率在上升吗？
- 内存泄漏了吗？
- 哪个依赖服务变慢了？
- 异常影响的范围有多大？

好的监控能做到：**事前预警、事中定位、事后复盘**。

---

## 二、监控三大支柱

| 支柱 | 解决的问题 | 典型工具 |
|------|-----------|---------|
| **Metrics（指标）** | 系统状态和趋势 | Prometheus、Grafana、Datadog |
| **Logs（日志）** | 故障排查和审计 | ELK、Loki、Splunk |
| **Traces（链路）** | 请求全链路定位 | Jaeger、Zipkin、OpenTelemetry |

三者关系：

```
Metrics 告诉你有问题
    ↓
Traces 告诉你问题在哪里
    ↓
Logs 告诉你为什么
```

---

## 三、Node.js 内置指标

### 3.1 process.memoryUsage

```javascript
import process from 'node:process';

function getMemoryMetrics() {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers
  };
}

setInterval(() => {
  console.log(getMemoryMetrics());
}, 5000);
```

### 3.2 eventLoopLag

事件循环延迟是 Node.js 最核心的健康指标：

```javascript
import { monitorEventLoopDelay } from 'node:perf_hooks';

const histogram = monitorEventLoopDelay({ resolution: 10 });
histogram.enable();

setInterval(() => {
  console.log({
    min: histogram.min,
    max: histogram.max,
    mean: histogram.mean,
    p99: histogram.percentile(99)
  });
  histogram.reset();
}, 1000);
```

### 3.3 CPU 使用

```javascript
import os from 'node:os';

function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }

  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length
  };
}
```

---

## 四、Prometheus + Grafana 实战

### 4.1 安装 prom-client

```bash
npm install prom-client
```

### 4.2 暴露 /metrics 接口

```javascript
// lib/metrics.js
import client from 'prom-client';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

// 自定义指标
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP 请求耗时',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

export const httpRequestTotal = new client.Counter({
  name: 'http_request_total',
  help: 'HTTP 请求总数',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
```

```javascript
// app.js
import express from 'express';
import { register, httpRequestDuration, httpRequestTotal } from './lib/metrics.js';

const app = express();

app.use((req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode
    };

    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });

  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/health', (req, res) => {
  res.json({ status: 'up' });
});

app.listen(3000);
```

### 4.3 Prometheus 配置

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node-app'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
```

### 4.4 Grafana 面板关键指标

- 请求 QPS 和延迟 P99
- 错误率（4xx/5xx 占比）
- 内存使用趋势
- 事件循环延迟
- GC 频率和耗时
- 活跃句柄数

---

## 五、分布式链路追踪

### 5.1 OpenTelemetry 接入

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node
npm install @opentelemetry/auto-instrumentations-node
npm install @opentelemetry/exporter-trace-otlp-http
```

```javascript
// tracing.js
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: process.env.SERVICE_NAME || 'node-app'
});

sdk.start();
```

### 5.2 自定义 Span

```javascript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('order-service');

async function createOrder(orderData) {
  return tracer.startActiveSpan('create-order', async (span) => {
    try {
      span.setAttribute('order.userId', orderData.userId);

      const validated = await validateOrder(orderData);
      const saved = await saveToDatabase(validated);
      await sendNotification(saved);

      span.setAttribute('order.id', saved.id);
      return saved;
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

## 六、健康检查与探针

### 6.1 多级健康检查

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'up', timestamp: Date.now() });
});

app.get('/health/ready', async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkMessageQueue()
  ]);

  const failed = checks.filter((c) => !c.healthy);
  if (failed.length > 0) {
    return res.status(503).json({
      status: 'not ready',
      failures: failed.map((f) => f.name)
    });
  }

  res.json({ status: 'ready' });
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'alive' });
});
```

### 6.2 Kubernetes 探针配置

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## 七、告警设计

### 7.1 告警原则

- **可行动**：每条告警都应有明确的处理人或预案。
- **分优先级**：P0 立即处理，P1 工作时间内处理，P2 可排期。
- **避免告警疲劳**：合并相似告警，设置抑制窗口。

### 7.2 推荐告警规则

```yaml
# alert.rules.yml
groups:
  - name: node-app-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_request_total{status_code=~"5.."}[5m]))
            /
            sum(rate(http_request_total[5m]))
          ) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: '5xx 错误率超过 5%'

      - alert: HighLatency
        expr: |
          histogram_quantile(0.99,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: 'P99 延迟超过 1 秒'

      - alert: MemoryLeak
        expr: |
          process_resident_memory_bytes /
          process_virtual_memory_max_bytes > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: '内存使用率超过 85%'
```

### 7.3 告警通知渠道

- 企业微信 / 钉钉 / Slack
- PagerDuty / OpsGenie
- 短信 / 电话（P0 级别）

---

## 八、总结

Node.js 监控体系建设路径：

1. **先打基础**：/health、/metrics、关键日志。
2. **指标可视化**：Prometheus + Grafana 覆盖 QPS、延迟、错误、资源。
3. **链路追踪**：OpenTelemetry 串联跨服务请求。
4. **告警闭环**：按优先级配置告警，避免噪音。

监控不是越多越好，而是要围绕业务 SLO 构建，做到**关键时刻能救命，平时不打扰**。
