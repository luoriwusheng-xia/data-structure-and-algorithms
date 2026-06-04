# 邀请域名设计

## 1. 背景

为每个用户提供一个可传播的专属邀请域名，用于裂变拉新。

基础域名固定为：

```txt
gettoken.dev
```

用户可拥有一个二级域名前缀 `slug`，最终形成：

```txt
{slug}.gettoken.dev
```

示例：

```txt
beidao.gettoken.dev
```

其中：

- 系统默认给用户随机生成一个短 `slug`，例如 `djdw`
- 用户后续可以修改为更易传播的名字，例如 `beidao`
- 所有用户之间的 `slug` 必须全局唯一
- 用户不能频繁修改，避免传播链路混乱和运维成本上升

---

## 2. 目标

该方案只关注后端设计，不涉及前端页面实现。

后端目标如下：

- 支持用户拥有唯一的邀请域名前缀
- 支持系统随机生成默认 `slug`
- 支持用户修改自己的 `slug`
- 支持 30 天只能修改一次
- 支持历史 `slug` 保留，避免老分享链接失效
- 支持高并发下稳定解析 `slug`
- 支持裂变场景下的异步统计、奖励、通知

---

## 3. 核心规则

### 3.1 slug 规则

建议限制如下：

- 仅允许小写字母和数字
- 长度 `4 ~ 20`
- 必须全局唯一
- 存储时统一转小写

正则示例：

```txt
^[a-z0-9]{4,20}$
```

说明：

- 虽然示例里有 `dJdw`，但从系统设计角度，更推荐统一为小写
- 如果允许大小写混用，会增加唯一性判断、SEO、用户认知和运维复杂度

### 3.2 保留词

需要维护一份保留词名单，禁止用户使用，例如：

- `www`
- `api`
- `admin`
- `static`
- `cdn`
- `m`
- `h5`
- `app`
- `support`
- `help`
- `download`
- `login`
- `register`

### 3.3 修改规则

- 系统首次随机生成默认 `slug` 时，不算用户主动修改
- 用户第一次主动修改时，允许立即修改
- 主动修改成功后，30 天内不允许再次修改
- 下次允许修改时间 = `last_changed_at + 30 days`

例如：

- `2026-04-27 10:00:00` 修改成功
- 下一次最早允许修改时间为 `2026-05-27 10:00:00`

### 3.4 历史 slug 策略

建议旧 `slug` 不再释放给其他用户。

原因：

- 避免历史传播出去的链接被别人复用
- 避免邀请关系串号
- 降低风控和客服处理成本

因此：

- 一个 `slug` 一旦被使用过，即便后续被替换，也仍然保留在历史表中
- 历史 `slug` 仍然指向原用户，后端可以选择返回“已更换新域名”或做 301/302 跳转

---

## 4. 架构设计

在进入服务设计前，必须先满足域名、证书和接入层前置条件。
否则即使 Express、MySQL、Redis、RabbitMQ 都准备好了，`{slug}.gettoken.dev` 也无法真正被用户访问到。

### 4.1 前置条件

上线该方案前，至少需要准备以下资源：

- 已持有主域名 `gettoken.dev`
- 已具备该域名的 DNS 管理权限
- 已准备承接流量的入口
  - 可直接是 ECS 公网 IP
  - 也可以是 ALB / CLB / CDN / WAF 暴露出来的接入地址
- 已准备 HTTPS 证书
  - 至少覆盖 `*.gettoken.dev`
- 已有 Nginx 作为统一入口层

推荐理解顺序：

```txt
用户访问域名
-> DNS 把 *.gettoken.dev 指到入口
-> Nginx 接收请求并识别 Host
-> Nginx 转发给 Express
-> Express 解析 slug 并返回业务结果
```

### 4.2 阿里云 DNS 解析如何设置

这个场景的关键不是逐个创建：

```txt
beidao.gettoken.dev
abc123.gettoken.dev
xxxx.gettoken.dev
```

而是配置一条泛解析：

```txt
*.gettoken.dev
```

这样所有未单独配置过的二级子域名，都会落到同一个入口。

#### 方案 A：直接解析到服务器 IP

如果你的入口就是一台或多台直接对外提供服务的服务器，可配置：

- 记录类型：`A`
- 主机记录：`*`
- 记录值：你的公网 IP
- TTL：建议 `60` 或 `600`

示例：

```txt
记录类型: A
主机记录: *
记录值: 1.2.3.4
```

适用场景：

- 单机部署
- Nginx 直接暴露公网
- 早期验证环境

#### 方案 B：解析到阿里云负载均衡或其他接入层

如果前面接了 ALB、CDN、WAF 或其他云入口，建议配置：

- 记录类型：`CNAME`
- 主机记录：`*`
- 记录值：入口服务分配的域名

示例：

```txt
记录类型: CNAME
主机记录: *
记录值: your-ingress.alb.aliyuncsslb.com
```

适用场景：

- 多实例部署
- 后续需要水平扩容
- 需要接入云负载均衡、WAF 或 CDN

#### 阿里云控制台操作步骤

以阿里云云解析 DNS 为例：

1. 登录阿里云控制台
2. 进入云解析 DNS
3. 进入目标域名 `gettoken.dev` 的解析设置
4. 单击“添加记录”
5. 根据接入方式选择 `A` 或 `CNAME`
6. 主机记录填写 `*`
7. 记录值填写公网 IP 或入口域名
8. 保存后等待解析生效

补充建议：

- 同时保留一个显式记录，例如 `www.gettoken.dev`
- 业务主站和邀请子域名建议分开管理
- 如果未来有 `api.gettoken.dev`、`admin.gettoken.dev`，这些精确记录优先级通常高于泛解析，适合单独接到其他服务

### 4.3 HTTPS 证书要求

如果邀请域名要正式对外使用，必须准备 HTTPS 证书。

建议证书覆盖：

```txt
*.gettoken.dev
```

说明：

- 该证书可覆盖 `beidao.gettoken.dev`
- 也可覆盖其他一级子域名
- 但通常不能覆盖更深层级，例如 `a.b.gettoken.dev`

因为当前方案只需要：

```txt
{slug}.gettoken.dev
```

所以 `*.gettoken.dev` 足够。

### 4.4 Nginx 为什么必须先配置

DNS 只能把请求引导到入口，但并不知道：

- 当前请求是哪个 `slug`
- 要转发到哪个 Express 服务
- 是否需要限流
- 是否需要 HTTPS 跳转

这些都要在 Nginx 层完成。

### 4.5 Nginx 泛域名规则怎么写

Nginx 的关键点有两个：

1. `server_name` 要能接住所有 `*.gettoken.dev`
2. 要把原始 `Host` 透传给后端

最基础的 HTTP 配置示例：

```nginx
server {
    listen 80;
    server_name .gettoken.dev;

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://invite_backend;
    }
}
```

说明：

- `server_name .gettoken.dev;`
  - 可同时匹配 `gettoken.dev` 和 `*.gettoken.dev`
- 也可以写成：

```nginx
server_name *.gettoken.dev;
```

但如果你还希望同一个 server block 顺带接住裸域名，`.gettoken.dev` 更省事。

HTTPS 配置示例：

```nginx
upstream invite_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name .gettoken.dev;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name .gettoken.dev;

    ssl_certificate     /etc/nginx/ssl/gettoken.dev.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/gettoken.dev.key.pem;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-Id $request_id;
        proxy_pass http://invite_backend;
    }
}
```

#### 如果要在 Nginx 里直接提取 slug

有两种做法。

做法一：完全交给 Express 处理，Nginx 只转发 `Host`

- 优点：规则简单，后端统一处理
- 缺点：Nginx 层无法基于 `slug` 做更细粒度控制

做法二：Nginx 用正则先提取

```nginx
server {
    listen 443 ssl http2;
    server_name ~^(?<slug>[a-z0-9-]+)\.gettoken\.dev$;

    ssl_certificate     /etc/nginx/ssl/gettoken.dev.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/gettoken.dev.key.pem;

    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Invite-Slug $slug;
        proxy_pass http://invite_backend;
    }
}
```

推荐：

- 早期先用做法一
- 如果后面要针对 `slug` 做访问控制、灰度或监控标签，再升级到做法二

### 4.6 Nginx 规则建议

除了最小可用配置，还建议补这些规则：

- 强制 HTTP 跳 HTTPS
- 限制异常 Host
- 对恶意 IP 做基础限流
- 配置 access log，记录 `$host`
- 增加健康检查路径，例如 `/healthz`

示例：

```nginx
limit_req_zone $binary_remote_addr zone=invite_limit:10m rate=20r/s;

server {
    listen 443 ssl http2;
    server_name .gettoken.dev;

    ssl_certificate     /etc/nginx/ssl/gettoken.dev.fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/gettoken.dev.key.pem;

    access_log /var/log/nginx/invite.access.log;
    error_log  /var/log/nginx/invite.error.log;

    location = /healthz {
        return 200 'ok';
    }

    location / {
        # 使用 invite_limit 这个限流桶。
        # rate=20r/s 表示单个 IP 平均每秒允许 20 个请求。
        # burst=50 表示允许额外突发 50 个请求进入缓冲区。
        # nodelay 表示只要还没超过 burst，就立即放行，不排队等待。
        # 超过 burst 的请求会直接被 Nginx 拒绝，通常返回 503。
        limit_req zone=invite_limit burst=50 nodelay;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://invite_backend;
    }
}
```

### 4.7 基础架构

推荐基础架构：

```txt
Nginx -> Express API -> MySQL
                 -> Redis
                 -> RabbitMQ
```

职责划分：

- `Nginx`
  - HTTPS
  - 泛域名接入，例如 `*.gettoken.dev`
  - 基础限流
  - 反向代理到 Express

- `Express`
  - 处理业务接口
  - 域名解析
  - 修改 `slug`
  - 邀请关系落库
  - 发送异步消息到 RabbitMQ

- `MySQL`
  - 作为唯一真源
  - 保存用户当前 `slug`
  - 保存历史 `slug`
  - 保存邀请关系
  - 用唯一索引兜底并发冲突

- `Redis`
  - 缓存 `slug -> user_id`
  - 缓存用户当前 `slug`
  - 做短期限流
  - 承接热点读请求

- `RabbitMQ`
  - 异步处理裂变相关旁路任务
  - 解耦主请求和统计/奖励/通知逻辑

### 4.2 为什么需要 Redis

邀请域名解析本质上是高频读请求。

当用户访问：

```txt
beidao.gettoken.dev
```

后端要快速完成：

```txt
slug -> user_id -> inviter_profile
```

如果每次都直查 MySQL，在裂变高峰时数据库压力会很大。

因此建议使用 `cache-aside` 模式：

1. 先查 Redis
2. 命中则直接返回
3. 未命中则查 MySQL
4. 回填 Redis

### 4.3 为什么需要 RabbitMQ

裂变场景真正容易压垮系统的，不是 `slug` 查询本身，而是围绕邀请链路附带的写操作：

- 访问曝光日志
- 邀请点击日志
- 注册成功后的邀请关系统计
- 奖励发放
- 站内信/邮件/短信通知
- 排行榜更新
- 风控审计

这些逻辑如果全部同步执行，会直接拉长主请求耗时，并放大数据库与下游服务压力。

因此建议将“非主链路、可延迟处理”的任务放入 RabbitMQ。

主请求只做最关键的同步动作：

- 解析 `slug`
- 校验有效性
- 写入最关键的邀请关系
- 快速响应

其余逻辑交给消费者异步处理。

---

## 5. 数据库设计

### 5.1 当前域名表 `user_invite_domain`

```sql
CREATE TABLE user_invite_domain (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
  user_id BIGINT NOT NULL COMMENT '用户 ID',
  current_slug VARCHAR(32) NOT NULL COMMENT '当前生效的邀请域名前缀',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1-正常, 2-冻结, 3-注销',
  last_changed_at DATETIME NULL COMMENT '最近一次主动修改 slug 的时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_user_id (user_id),
  UNIQUE KEY uk_current_slug (current_slug)
) COMMENT='用户当前邀请域名表';
```

字段说明：

- `user_id`
  - 一个用户只允许有一条当前记录
- `current_slug`
  - 当前生效的 `slug`
- `status`
  - 预留，便于后续做封禁、冻结、注销
- `last_changed_at`
  - 最近一次主动修改时间
  - 用于控制 30 天只能修改一次

### 5.2 历史域名表 `user_invite_domain_history`

```sql
CREATE TABLE user_invite_domain_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
  user_id BIGINT NOT NULL COMMENT '用户 ID',
  slug VARCHAR(32) NOT NULL COMMENT '曾经使用过的邀请域名前缀',
  is_current TINYINT NOT NULL DEFAULT 0 COMMENT '是否当前生效: 0-否, 1-是',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '该 slug 生效时间',
  expired_at DATETIME NULL COMMENT '该 slug 失效时间, 当前生效时为空',
  UNIQUE KEY uk_slug (slug),
  KEY idx_user_id (user_id)
) COMMENT='用户邀请域名历史表';
```

字段说明：

- `slug`
  - 全局唯一
  - 包含当前和历史所有曾使用过的 `slug`
- `is_current`
  - 是否仍为当前生效 `slug`
- `expired_at`
  - 该 `slug` 失效时间

说明：

- 当前 `slug` 也建议同步写入历史表，便于统一追踪
- 因为历史表 `slug` 唯一，所以旧 `slug` 不会再被其他用户占用

### 5.3 邀请关系表 `user_invite_relation`

```sql
CREATE TABLE user_invite_relation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
  invitee_user_id BIGINT NOT NULL COMMENT '被邀请用户 ID',
  inviter_user_id BIGINT NOT NULL COMMENT '邀请人用户 ID',
  invite_slug VARCHAR(32) NOT NULL COMMENT '注册归因时命中的 slug',
  source_host VARCHAR(128) DEFAULT NULL COMMENT '来源 Host, 例如 beidao.gettoken.dev',
  source_ip VARCHAR(64) DEFAULT NULL COMMENT '来源 IP',
  source_ua VARCHAR(255) DEFAULT NULL COMMENT '来源 User-Agent',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '邀请关系创建时间',
  UNIQUE KEY uk_invitee_user_id (invitee_user_id),
  KEY idx_inviter_user_id (inviter_user_id),
  KEY idx_invite_slug (invite_slug)
) COMMENT='用户邀请关系表';
```

作用：

- 固化邀请关系
- 即使邀请人后续修改了 `slug`，历史邀请关系也不受影响

---

## 6. Redis 设计

### 6.1 Key 设计

```txt
invite:slug:{slug} -> user_id
invite:user:{user_id} -> current_slug
invite:profile:{slug} -> inviter_profile_json
invite:change_lock:{user_id} -> 1
invite:rate_limit:resolve:{ip} -> count
```

说明：

- `invite:slug:{slug}`
  - 域名解析核心缓存
- `invite:profile:{slug}`
  - 可缓存邀请页需要的轻量资料
- `invite:change_lock:{user_id}`
  - 防止极短时间内重复提交修改请求
- `invite:rate_limit:resolve:{ip}`
  - 解析接口限流

### 6.2 缓存策略

- 查询时优先查 Redis
- MySQL 命中后回填 Redis
- 修改 `slug` 成功后：
  - 删除旧 `slug` 缓存
  - 写入新 `slug` 缓存
  - 删除用户缓存

---

## 7. RabbitMQ 设计

### 7.1 设计目标

RabbitMQ 主要解决两个问题：

- 削峰填谷
- 同步链路解耦

不建议把核心一致性依赖在消息队列上。
核心一致性仍然由 MySQL 事务保证。
RabbitMQ 负责处理“最终一致即可”的附加任务。

### 7.2 推荐交换机与队列

可以设计一个裂变领域的 Topic Exchange：

```txt
Exchange: invite.domain.events
Type: topic
```

路由键示例：

```txt
invite.domain.resolved
invite.domain.clicked
invite.user.registered
invite.reward.issue
invite.stats.refresh
invite.risk.audit
invite.notify.send
```

对应队列示例：

- `queue.invite.stats`
- `queue.invite.reward`
- `queue.invite.notify`
- `queue.invite.risk`

### 7.3 推荐消息体

#### 1）域名访问事件

```json
{
  "eventId": "evt_001",
  "eventType": "invite.domain.clicked",
  "slug": "beidao",
  "inviterUserId": 1001,
  "host": "beidao.gettoken.dev",
  "ip": "1.1.1.1",
  "ua": "Mozilla/5.0",
  "traceId": "trace_xxx",
  "occurredAt": "2026-04-27T10:00:00Z"
}
```

#### 2）注册成功事件

```json
{
  "eventId": "evt_002",
  "eventType": "invite.user.registered",
  "inviteeUserId": 2001,
  "inviterUserId": 1001,
  "inviteSlug": "beidao",
  "traceId": "trace_xxx",
  "occurredAt": "2026-04-27T10:10:00Z"
}
```

### 7.4 消费者职责

- `stats-consumer`
  - 统计点击数、注册数、转化率

- `reward-consumer`
  - 计算奖励
  - 发放积分、代币或优惠券

- `notify-consumer`
  - 给邀请人发送通知

- `risk-consumer`
  - 识别刷量、异常 IP、异常设备

### 7.5 消息可靠性

RabbitMQ 设计时至少需要考虑：

- 消息持久化
- 手动 ACK
- 消费失败重试
- 死信队列
- 消费幂等

幂等建议：

- 每条消息带 `eventId`
- 消费端落幂等表或 Redis 幂等键
- 已处理过的 `eventId` 不重复处理

### 7.6 不要把什么放进队列

以下逻辑不建议完全依赖 RabbitMQ：

- `slug` 唯一校验
- 用户修改 `slug`
- 30 天修改限制判断
- 邀请关系主记录创建

这些必须同步完成，因为它们决定了请求本身是否成功。

### 7.7 RabbitMQ 核心代码示例

下面给出一个基于 `amqplib` 的最小可用示例。

依赖：

```bash
npm install amqplib
```

#### 1）RabbitMQ 连接与 Exchange 初始化

```javascript
// rabbitmq.js
import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://127.0.0.1:5672';
const EXCHANGE_NAME = 'invite.domain.events';
const EXCHANGE_TYPE = 'topic';

let connection;
let channel;

async function getChannel() {
  if (channel) return channel;

  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
    durable: true,
  });

  return channel;
}

async function closeRabbitmq() {
  if (channel) await channel.close();
  if (connection) await connection.close();
}

export {
  getChannel,
  closeRabbitmq,
  EXCHANGE_NAME,
};
```

#### 2）消息生产者

```javascript
// invite-event-producer.js
import crypto from 'node:crypto';
import { getChannel, EXCHANGE_NAME } from './rabbitmq.js';

function buildEvent(eventType, payload) {
  return {
    eventId: crypto.randomUUID(),
    eventType,
    payload,
    occurredAt: new Date().toISOString(),
  };
}

async function publishInviteEvent(routingKey, payload) {
  const channel = await getChannel();
  const event = buildEvent(routingKey, payload);

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(event)),
    {
      persistent: true,
      contentType: 'application/json',
      messageId: event.eventId,
    }
  );

  return event;
}

export {
  publishInviteEvent,
};
```

#### 3）在域名点击或注册成功后发送消息

```javascript
import { publishInviteEvent } from './invite-event-producer.js';

async function emitInviteDomainClicked({ slug, inviterUserId, host, ip, ua, traceId }) {
  await publishInviteEvent('invite.domain.clicked', {
    slug,
    inviterUserId,
    host,
    ip,
    ua,
    traceId,
  });
}

async function emitInviteUserRegistered({ inviteeUserId, inviterUserId, inviteSlug, traceId }) {
  await publishInviteEvent('invite.user.registered', {
    inviteeUserId,
    inviterUserId,
    inviteSlug,
    traceId,
  });
}
```

#### 4）消费者示例

```javascript
// invite-stats-consumer.js
import { getChannel, EXCHANGE_NAME } from './rabbitmq.js';

const QUEUE_NAME = 'queue.invite.stats';

async function startInviteStatsConsumer(handler) {
  const channel = await getChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
  });

  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'invite.domain.clicked');
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'invite.user.registered');
  await channel.prefetch(20);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      await handler(event);
      channel.ack(msg);
    } catch (err) {
      console.error('consume failed:', err);
      channel.nack(msg, false, false);
    }
  });
}

export {
  startInviteStatsConsumer,
};
```

#### 5）消费者中的幂等处理示例

```javascript
async function handleInviteStatsEvent(event) {
  const { eventId, eventType, payload } = event;

  const processed = await redis.set(
    `invite:event:idempotent:${eventId}`,
    '1',
    'NX',
    'EX',
    86400 * 7
  );

  if (!processed) {
    return;
  }

  if (eventType === 'invite.domain.clicked') {
    await statsService.incrClickCount(payload.inviterUserId, payload.slug);
    return;
  }

  if (eventType === 'invite.user.registered') {
    await statsService.incrRegisterCount(payload.inviterUserId, payload.inviteSlug);
  }
}
```

---

## 8. 核心流程设计

### 8.1 用户开通默认邀请域名

流程：

1. 用户注册成功
2. 系统随机生成一个 `slug`
3. 尝试写入 `user_invite_domain`
4. 如果随机值冲突，则重新生成
5. 同步写入 `user_invite_domain_history`
6. 回填 Redis

伪代码：

```javascript
async function initInviteDomain(userId) {
  // 最多重试 5 次，避免随机短码碰撞时直接失败
  for (let i = 0; i < 5; i++) {
    // 生成一个默认 4 位短 slug，例如 djdw
    const slug = randomSlug(4);

    try {
      // 使用事务保证“当前表”和“历史表”同时成功或同时失败
      await db.transaction(async (tx) => {
        await tx.insertUserInviteDomain({
          userId,
          currentSlug: slug,
        });

        // 当前 slug 也同步写入历史表，便于后续统一追踪和防止旧 slug 被复用
        await tx.insertUserInviteDomainHistory({
          userId,
          slug,
          isCurrent: 1,
        });
      });

      // 数据库写入成功后，回填 Redis，减少首次访问时的数据库压力
      await redis.set(`invite:slug:${slug}`, userId, 'EX', 3600);

      return slug;
    } catch (err) {
      // 如果是唯一索引冲突，说明随机 slug 撞号了，继续下一轮重试
      if (!isDuplicateKey(err)) throw err;
    }
  }

  // 连续多次随机仍冲突时，抛错让上层决定是否告警或改用更长短码
  throw new Error('generate slug failed');
}
```

### 8.2 用户修改 slug

流程：

1. 用户提交新的 `slug`
2. 后端校验格式
3. 后端校验保留词
4. 校验是否到达可修改时间
5. 开启事务
6. 校验新 `slug` 是否已被占用
7. 更新当前表
8. 更新历史表：
   - 原 `slug` 标记 `is_current = 0`
   - 新 `slug` 插入历史表并标记 `is_current = 1`
9. 提交事务
10. 刷新 Redis 缓存
11. 发送 RabbitMQ 事件，通知统计或配置同步系统

关键点：

- 唯一性必须依赖 MySQL 唯一索引兜底
- 不能只依赖 Redis 判断“是否可用”

### 8.2.1 用户修改 slug 的服务层代码示例

依赖建议：

```bash
npm install express ioredis mysql2 dayjs
```

下面示例只演示核心逻辑，默认：

- MySQL 使用 `mysql2/promise`
- Redis 使用 `ioredis`
- RabbitMQ 复用上一节的 `publishInviteEvent`

```javascript
// invite-domain-service.js
import dayjs from 'dayjs';

// 用户主动修改 slug 后，30 天内不允许再次修改
const CHANGE_COOLDOWN_DAYS = 30;

// 仅允许 4 到 20 位小写字母和数字
const SLUG_REGEXP = /^[a-z0-9]{4,20}$/;

// 保留词不能被用户占用，避免和系统路由、基础设施域名冲突
const RESERVED_SLUGS = new Set([
  'www',
  'api',
  'admin',
  'static',
  'cdn',
  'm',
  'h5',
  'app',
  'support',
  'help',
  'download',
  'login',
  'register',
]);

function normalizeSlug(input) {
  // 统一做 trim + 小写化，避免大小写和前后空格带来重复判断问题
  return String(input || '').trim().toLowerCase();
}

function validateSlug(slug) {
  // 校验 slug 格式是否合法
  if (!SLUG_REGEXP.test(slug)) {
    const err = new Error('slug format invalid');
    err.code = 'INVITE_DOMAIN_SLUG_INVALID';
    throw err;
  }

  // 拦截系统保留词
  if (RESERVED_SLUGS.has(slug)) {
    const err = new Error('slug is reserved');
    err.code = 'INVITE_DOMAIN_SLUG_RESERVED';
    throw err;
  }
}

function buildDomain(slug) {
  return `${slug}.gettoken.dev`;
}

function buildNextChangeAllowedAt(lastChangedAt) {
  // 首次主动修改前，lastChangedAt 为空，此时允许立即修改
  if (!lastChangedAt) return null;
  return dayjs(lastChangedAt).add(CHANGE_COOLDOWN_DAYS, 'day').toDate();
}

async function changeInviteDomain({
  db,
  redis,
  publishInviteEvent,
  userId,
  inputSlug,
}) {
  const slug = normalizeSlug(inputSlug);
  validateSlug(slug);

  const lockKey = `invite:change_lock:${userId}`;

  // 用 Redis 短锁防止用户在极短时间内重复点击“修改”
  // NX 表示只在 key 不存在时设置成功
  // EX 5 表示锁 5 秒自动过期，避免异常情况下死锁
  const lockResult = await redis.set(lockKey, '1', 'NX', 'EX', 5);

  if (!lockResult) {
    const err = new Error('request too frequent');
    err.code = 'INVITE_DOMAIN_CHANGE_IN_PROGRESS';
    throw err;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 先锁住当前用户的邀请域名记录，避免同一用户并发修改
    const [rows] = await connection.query(
      `
      SELECT user_id, current_slug, last_changed_at
      FROM user_invite_domain
      WHERE user_id = ?
      FOR UPDATE
      `,
      [userId]
    );

    if (!rows.length) {
      const err = new Error('invite domain not initialized');
      err.code = 'INVITE_DOMAIN_NOT_FOUND';
      throw err;
    }

    const current = rows[0];
    const currentSlug = current.current_slug;
    const nextChangeAllowedAt = buildNextChangeAllowedAt(current.last_changed_at);

    // 如果新 slug 和当前值一致，则直接返回，不做无意义更新
    if (slug === currentSlug) {
      await connection.rollback();
      return {
        success: true,
        currentSlug,
        fullDomain: buildDomain(currentSlug),
        nextChangeAllowedAt,
      };
    }

    // 如果仍处于 30 天冷却期内，则拒绝修改
    if (nextChangeAllowedAt && new Date() < nextChangeAllowedAt) {
      const err = new Error('30 days cooldown');
      err.code = 'INVITE_DOMAIN_CHANGE_NOT_ALLOWED';
      err.nextChangeAllowedAt = nextChangeAllowedAt;
      throw err;
    }

    // 检查历史表是否已经使用过该 slug
    // 这里的规则是：旧 slug 永不释放，所以历史里出现过也不能再占用
    const [slugUsedRows] = await connection.query(
      `
      SELECT id, user_id
      FROM user_invite_domain_history
      WHERE slug = ?
      LIMIT 1
      `,
      [slug]
    );

    if (slugUsedRows.length) {
      const err = new Error('slug already used');
      err.code = 'INVITE_DOMAIN_SLUG_USED';
      throw err;
    }

    const now = new Date();

    // 更新当前表，把新 slug 设为生效值，并记录最近修改时间
    await connection.query(
      `
      UPDATE user_invite_domain
      SET current_slug = ?, last_changed_at = ?, updated_at = ?
      WHERE user_id = ?
      `,
      [slug, now, now, userId]
    );

    // 把旧 slug 在历史表中标记为失效
    await connection.query(
      `
      UPDATE user_invite_domain_history
      SET is_current = 0, expired_at = ?
      WHERE user_id = ? AND is_current = 1
      `,
      [now, userId]
    );

    // 把新 slug 写入历史表，并标记为当前生效
    await connection.query(
      `
      INSERT INTO user_invite_domain_history (
        user_id,
        slug,
        is_current,
        created_at,
        expired_at
      ) VALUES (?, ?, 1, ?, NULL)
      `,
      [userId, slug, now]
    );

    // 提交事务后，数据库状态才算最终生效
    await connection.commit();

    // 删除旧缓存，避免后续解析仍命中旧 slug
    await redis.del(
      `invite:slug:${currentSlug}`,
      `invite:profile:${currentSlug}`,
      `invite:user:${userId}`
    );

    // 回填新缓存，减少后续首次查询打到数据库
    await redis.set(`invite:slug:${slug}`, String(userId), 'EX', 3600);
    await redis.set(`invite:user:${userId}`, slug, 'EX', 3600);

    // 异步发送域名变更事件，供统计、配置同步、通知等下游消费
    await publishInviteEvent('invite.domain.changed', {
      userId,
      oldSlug: currentSlug,
      newSlug: slug,
    });

    return {
      success: true,
      currentSlug: slug,
      fullDomain: buildDomain(slug),
      // 返回下次允许修改时间，前端可直接展示
      nextChangeAllowedAt: buildNextChangeAllowedAt(now),
    };
  } catch (err) {
    // 事务失败时必须回滚，避免当前表和历史表状态不一致
    await connection.rollback();

    // 将数据库唯一索引冲突统一转换成业务错误码
    if (err && err.code === 'ER_DUP_ENTRY') {
      err.code = 'INVITE_DOMAIN_SLUG_USED';
    }

    throw err;
  } finally {
    // 无论成功还是失败，都释放数据库连接和 Redis 锁
    connection.release();
    await redis.del(lockKey);
  }
}

export {
  changeInviteDomain,
};
```

### 8.3 访问邀请域名

流程：

1. Nginx 接收 `Host`
2. 提取子域名前缀 `slug`
3. Express 查询 Redis
4. Redis 未命中则查 MySQL
5. 返回邀请人信息
6. 异步投递 RabbitMQ 点击事件

同步阶段只做轻逻辑，统计、风控、通知等异步处理。

### 8.4 注册归因

流程：

1. 用户通过 `beidao.gettoken.dev` 进入注册页
2. 注册时带上 `slug` 或解析出的 `inviterUserId`
3. 注册成功后，同步写入 `user_invite_relation`
4. 再异步发送 RabbitMQ 注册成功事件

这样即使后续消费者挂了，主邀请关系仍然存在。

---

## 9. 接口设计

### 9.1 查询我的邀请域名

```txt
GET /api/invite-domain/me
```

返回：

```json
{
  "userId": 1001,
  "currentSlug": "beidao",
  "fullDomain": "beidao.gettoken.dev",
  "lastChangedAt": "2026-04-27T10:00:00Z",
  "nextChangeAllowedAt": "2026-05-27T10:00:00Z",
  "canChange": false
}
```

### 9.2 检查 slug 是否可用

```txt
POST /api/invite-domain/check
```

请求：

```json
{
  "slug": "beidao"
}
```

返回：

```json
{
  "slug": "beidao",
  "available": false,
  "reason": "slug already used"
}
```

### 9.3 修改我的 slug

```txt
PUT /api/invite-domain/me
```

请求：

```json
{
  "slug": "beidao"
}
```

成功返回：

```json
{
  "success": true,
  "currentSlug": "beidao",
  "fullDomain": "beidao.gettoken.dev",
  "nextChangeAllowedAt": "2026-05-27T10:00:00Z"
}
```

失败返回：

```json
{
  "success": false,
  "code": "INVITE_DOMAIN_CHANGE_NOT_ALLOWED",
  "message": "30天内只能修改一次邀请域名",
  "nextChangeAllowedAt": "2026-05-27T10:00:00Z"
}
```

### 9.4 解析 slug

```txt
GET /api/invite-domain/resolve/:slug
```

返回：

```json
{
  "slug": "beidao",
  "userId": 1001,
  "isCurrent": true,
  "fullDomain": "beidao.gettoken.dev"
}
```

### 9.5 修改 slug 的 Express 接口示例

```javascript
// invite-domain-route.js
import express from 'express';
import Redis from 'ioredis';
import mysql from 'mysql2/promise';
import { changeInviteDomain } from './invite-domain-service.js';
import { publishInviteEvent } from './invite-event-producer.js';

const router = express.Router();
const redis = new Redis(process.env.REDIS_URL);
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
});

router.put('/api/invite-domain/me', async (req, res) => {
  try {
    const userId = req.user.id;
    const { slug } = req.body;

    const result = await changeInviteDomain({
      db,
      redis,
      publishInviteEvent,
      userId,
      inputSlug: slug,
    });

    res.json(result);
  } catch (err) {
    if (err.code === 'INVITE_DOMAIN_CHANGE_NOT_ALLOWED') {
      return res.status(429).json({
        success: false,
        code: err.code,
        message: '30天内只能修改一次邀请域名',
        nextChangeAllowedAt: err.nextChangeAllowedAt,
      });
    }

    if (
      err.code === 'INVITE_DOMAIN_SLUG_INVALID' ||
      err.code === 'INVITE_DOMAIN_SLUG_RESERVED' ||
      err.code === 'INVITE_DOMAIN_SLUG_USED'
    ) {
      return res.status(400).json({
        success: false,
        code: err.code,
        message: err.message,
      });
    }

    if (err.code === 'INVITE_DOMAIN_CHANGE_IN_PROGRESS') {
      return res.status(409).json({
        success: false,
        code: err.code,
        message: '请勿重复提交',
      });
    }

    console.error(err);

    res.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'server error',
    });
  }
});

export default router;
```

### 9.6 解析 slug 的 Redis 查询示例

```javascript
async function resolveInviteSlug({ db, redis, slug }) {
  const normalizedSlug = String(slug || '').trim().toLowerCase();

  const cachedUserId = await redis.get(`invite:slug:${normalizedSlug}`);
  if (cachedUserId) {
    return {
      userId: Number(cachedUserId),
      slug: normalizedSlug,
      fromCache: true,
    };
  }

  const [rows] = await db.query(
    `
    SELECT user_id, slug, is_current
    FROM user_invite_domain_history
    WHERE slug = ?
    LIMIT 1
    `,
    [normalizedSlug]
  );

  if (!rows.length) {
    return null;
  }

  const row = rows[0];

  await redis.set(`invite:slug:${normalizedSlug}`, String(row.user_id), 'EX', 3600);

  return {
    userId: row.user_id,
    slug: row.slug,
    isCurrent: row.is_current === 1,
    fromCache: false,
  };
}
```

---

## 10. 并发与一致性设计

### 10.1 并发修改同一个 slug

场景：

- 多个用户同时抢注 `beidao`

解决方式：

- 应用层可以先做一次查询，提升体验
- 最终仍依赖 MySQL 唯一索引
- 只有一个请求会成功，其余请求返回冲突错误

### 10.2 用户重复提交修改请求

场景：

- 同一用户短时间内重复点击“修改”

解决方式：

- Redis 短锁，例如 `invite:change_lock:{userId}`
- 加上数据库事务兜底

### 10.3 历史链接一致性

场景：

- 用户把 `djdw.gettoken.dev` 改成 `beidao.gettoken.dev`
- 老用户仍然访问旧链接

解决方式：

- 历史表保留 `djdw`
- 解析时如果发现是历史 `slug`
  - 可以返回当前最新 `slug`
  - 或直接跳转到新域名

---

## 11. 风控建议

裂变场景容易出现刷量，因此建议增加：

- 同 IP 短时间访问频控
- 同设备频繁注册监控
- 相同邀请人短时间异常转化监控
- 黑名单 IP/设备指纹
- RabbitMQ 异步风控审计队列

说明：

- 风控逻辑不应阻塞域名解析主流程
- 但注册成功后的奖励发放，建议以风控结果为准

---

## 12. 技术选型建议

### 12.1 起步版本

适合中小规模：

- `Nginx`
- `Node.js + Express`
- `MySQL`
- `Redis`
- `RabbitMQ`

### 12.2 后续扩展

如果裂变活动继续放大，可逐步演进：

- MySQL 读写分离
- Redis Cluster
- RabbitMQ 集群
- 埋点日志独立存储
- 奖励结算服务拆分
- 统计服务拆分

说明：

- 当前不建议一开始就上微服务大拆分
- 先把缓存、消息队列、唯一索引、异步消费设计好，性价比最高

---

## 13. 最终建议

从架构师视角，这个需求最重要的不是更换语言，而是把链路分层：

- `MySQL` 保证唯一性和核心一致性
- `Redis` 扛住高频读
- `RabbitMQ` 扛住裂变带来的异步流量
- `Express` 保持主请求足够轻

最终原则：

- 核心链路同步
- 非核心链路异步
- 唯一性靠数据库
- 高并发靠缓存
- 削峰解耦靠消息队列

这套设计足以支撑“邀请域名 + 裂变传播 + 高并发访问”的后端实现。

---

## 14. 参考资料

- 阿里云泛域名解析：[利用通配符记录解析所有子域名-泛域名解析](https://help.aliyun.com/zh/dns/pubz-domain-name-resolution-rules)
- 阿里云添加解析记录：[添加解析记录](https://help.aliyun.com/zh/dns/add-record/)
- 阿里云 CNAME 配置示例：[为 ALB 配置 CNAME 解析](https://help.aliyun.com/zh/slb/application-load-balancer/user-guide/configure-a-cname-record)
- Nginx 通配和正则域名匹配：[Server names](https://nginx.org/cn/docs/http/server_names.html)
- Nginx HTTPS 配置：[Configuring HTTPS servers](https://nginx.org/ja/docs/http/configuring_https_servers.html)
