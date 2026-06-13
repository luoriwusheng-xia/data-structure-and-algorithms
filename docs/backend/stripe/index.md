# Stripe 支付对接实战（Node.js）

Stripe 是全球范围内使用最广泛的支付平台之一，支持信用卡、借记卡、Apple Pay、Google Pay、Link 以及数百种本地支付方式。本文基于 Node.js 介绍 Stripe 的完整对接流程，包括一次性支付、订阅支付、Webhook 签名验证、价格方案设计、本地调试方法以及常见踩坑点。

## 前置准备

1. 注册 [Stripe 账号](https://stripe.com)。
2. 进入 Dashboard → Developers → API keys，获取 `Publishable key` 和 `Secret key`。
3. 进入 Dashboard → Developers → Webhooks，添加本地调试 Endpoint（可先用 Stripe CLI 生成测试密钥）。
4. 安装 [Stripe CLI](https://docs.stripe.com/stripe-cli)，用于本地 Webhook 转发。

## 核心概念

| 概念 | 说明 |
|------|------|
| PaymentIntent | 一次性支付的意图对象，最终生成 Charge。 |
| SetupIntent | 保存用户支付方式，用于后续扣款。 |
| Checkout Session | Stripe 托管的收银台页面，最安全、集成最快。 |
| Customer | 客户对象，可绑定多张支付方式。 |
| Price / Product | 商品与价格定义，订阅必须基于 Price。 |
| Subscription | 订阅对象，管理账单周期和自动扣款。 |
| Webhook | Stripe 异步通知，用于确认支付成功、订阅状态变化等。 |

> 资金安全原则：**永远不要在客户端暴露 Secret Key**，支付结果以 Webhook 通知为准，不要仅依赖前端回调。

## 三种集成方式对比

| 方式 | 适用场景 | 前端工作量 | 后端工作量 | PCI 合规 |
|------|----------|------------|------------|----------|
| Stripe Checkout（托管收银台）| SaaS 订阅、快速上线 | 小 | 中 | Stripe 负责 |
| Payment Element（自建表单）| 需要自定义 UI | 中 | 大 | Stripe 负责大部分 |
| 原生 PaymentIntent + Elements | 复杂支付流程 | 大 | 大 | Stripe 负责大部分 |

新手建议从 **Stripe Checkout** 开始；需要深度定制 UI 时再切换到 Payment Element。

## 基础环境搭建

```bash
npm init -y
npm install express stripe dotenv
npm install -D nodemon
```

```text
# .env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
PORT=3000
FRONTEND_URL=http://localhost:5173
```

```javascript
// app.js
import 'dotenv/config';
import express from 'express';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// 注意：Webhook 路由必须接收 raw body，不能先被 express.json() 处理
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { app, stripe };
```

## 完整流程：一次性支付

### 1. 后端创建 Checkout Session

```javascript
// routes/payment.js
import { Router } from 'express';
import { stripe } from '../app.js';

const router = Router();

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { productId, userId } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: req.body.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '高级会员 - 1 年',
              description: '解锁全部高级功能',
            },
            unit_amount: 2999, // 单位：美分
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId,
        productId,
        orderType: 'one_time',
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('创建 Checkout Session 失败:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

### 2. 前端跳转

```javascript
const response = await fetch('/api/payment/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: user.email, productId: 'pro_1y', userId: user.id }),
});

const { url } = await response.json();
window.location.href = url;
```

### 3. Webhook 处理支付成功

```javascript
// routes/webhook.js
import { Router } from 'express';
import { stripe } from '../app.js';

const router = Router();

router.post('/', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook 签名验证失败:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('支付成功:', session.id);

      // 幂等性校验：根据 session.id 查询是否已处理
      // await fulfillOrder(session);
      break;
    }

    case 'checkout.session.async_payment_succeeded': {
      // 异步支付方式（如 SEPA）成功
      break;
    }

    case 'checkout.session.async_payment_failed': {
      // 异步支付方式失败
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log('支付失败:', paymentIntent.last_payment_error?.message);
      break;
    }

    default:
      console.log(`未处理的 event type: ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
```

### 4. 查询订单状态（可选）

```javascript
router.get('/session-status', async (req, res) => {
  const { session_id } = req.query;
  const session = await stripe.checkout.sessions.retrieve(session_id);

  res.json({
    status: session.status,
    payment_status: session.payment_status,
    customer_email: session.customer_email,
  });
});
```

## 完整流程：订阅支付

### 1. 预先创建 Product 与 Price

订阅支付要求先在 Stripe Dashboard 或通过 API 创建 `Product` 和 `Price`：

```bash
curl https://api.stripe.com/v1/products \
  -u sk_test_xxx: \
  -d name="Pro 会员" \
  -d description="按月订阅"

curl https://api.stripe.com/v1/prices \
  -u sk_test_xxx: \
  -d product=prod_xxx \
  -d unit_amount=999 \
  -d currency=usd \
  -d "recurring[interval]"=month
```

### 2. 后端创建订阅 Checkout Session

```javascript
router.post('/create-subscription-session', async (req, res) => {
  const { priceId, userId } = req.body;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    subscription_data: {
      metadata: { userId },
    },
    metadata: { userId },
  });

  res.json({ url: session.url });
});
```

### 3. 订阅状态 Webhook

```javascript
case 'customer.subscription.created': {
  const subscription = event.data.object;
  console.log('订阅创建:', subscription.id, subscription.status);
  break;
}

case 'customer.subscription.updated': {
  const subscription = event.data.object;
  // 处理升级、降级、取消再恢复
  break;
}

case 'invoice.payment_succeeded': {
  const invoice = event.data.object;
  if (invoice.billing_reason === 'subscription_cycle') {
    console.log('订阅周期扣款成功:', invoice.id);
  }
  break;
}

case 'invoice.payment_failed': {
  const invoice = event.data.object;
  // 发送续费失败提醒，引导用户更新支付方式
  break;
}

case 'customer.subscription.deleted': {
  const subscription = event.data.object;
  // 订阅到期，降级用户权限
  break;
}
```

### 4. 升级 / 降级订阅

```javascript
router.post('/update-subscription', async (req, res) => {
  const { subscriptionId, newPriceId } = req.body;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updated = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });

  res.json({ subscriptionId: updated.id, status: updated.status });
});
```

## 价格方案设计

Stripe 的价格模型通常与业务权限体系绑定。以下是 SaaS 常见的三种设计：

### 方案一：固定档位订阅

| 档位 | 价格 | 周期 | 功能 |
|------|------|------|------|
| Free | $0 | 永久 | 基础功能 |
| Pro | $9.9 | 月 | 高级功能 + 优先支持 |
| Team | $29 | 月 | 多人协作 + 管理员后台 |

每个档位对应一个 Stripe `Price` ID。用户购买后把 `subscription.status` 与 `price.product` 同步到本地数据库，控制功能开关。

### 方案二：按量计费（Usage-based）

适合 API、存储、消息等资源类产品：

```javascript
const price = await stripe.prices.create({
  product: 'prod_api_calls',
  currency: 'usd',
  recurring: {
    interval: 'month',
    usage_type: 'metered',
  },
  billing_scheme: 'per_unit',
  unit_amount: 1, // 每单位 1 美分
});
```

每月通过 `stripe.subscriptionItems.createUsageRecord` 上报用量：

```javascript
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: 1250,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment',
  }
);
```

### 方案三：一次性 + 订阅混合

例如：先购买一次性“ credits 包”，再按月订阅 Pro。Stripe 中可用 `InvoiceItem` 或 `PaymentIntent` 处理一次性购买，与订阅系统独立计费。

### 价格设计的注意事项

1. **货币策略**：上线初期建议只开放 1-2 种主要货币，避免汇率和税务复杂度。
2. **税率**：使用 Stripe Tax 自动计算税费，或手动配置 Tax Rate。
3. **优惠码**：Checkout 中传入 `allow_promotion_codes: true`，让用户输入优惠码。
4. **试用期**：在 `subscription_data.trial_period_days` 中设置，试用结束才开始扣款。
5. **取消策略**：订阅取消后通常到周期结束才失效，注意 `cancel_at_period_end` 与立即取消的区别。

## 本地调试

### 1. 启动 Stripe CLI 转发

```bash
# 登录并绑定账号
stripe login

# 把 Stripe 的事件转发到本地
stripe listen --forward-to localhost:3000/webhook
```

运行后会输出一个 `whsec_xxx` 的 Webhook 签名密钥，填入 `.env` 的 `STRIPE_WEBHOOK_SECRET`。

### 2. 触发测试事件

```bash
# 模拟支付成功
stripe trigger checkout.session.completed

# 模拟订阅扣款成功
stripe trigger invoice.payment_succeeded

# 模拟支付失败
stripe trigger payment_intent.payment_failed
```

### 3. 使用测试卡号

| 卡号 | 结果 |
|------|------|
| `4242 4242 4242 4242` | 支付成功 |
| `4000 0000 0000 0002` | 支付被拒绝 |
| `4000 0027 6000 3184` | 需要 3D Secure 验证 |

更多测试卡号参考 [Stripe 官方文档](https://docs.stripe.com/testing)。

### 4. 直接请求本地接口

```bash
curl -X POST http://localhost:3000/api/payment/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","productId":"pro","userId":"u123"}'
```

## 常见坑与解决方案

### 1. Webhook 签名验证失败

**现象**：`No signatures found matching the expected signature for payload`。

**原因**：
- `express.json()` 在 Webhook 路由之前执行，导致 `req.body` 被解析成对象而非 raw Buffer。
- `.env` 里的 `STRIPE_WEBHOOK_SECRET` 不是当前 `stripe listen` 生成的密钥。

**解决**：
```javascript
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
```

### 2. Checkout 成功后页面拿不到状态

`success_url` 带 `session_id`，前端取到后应调用后端 `/session-status` 查询，不要直接认为成功。

### 3. 重复发货 / 重复开通权限

Webhook 可能因网络超时重发。务必用 `session.id`、`invoice.id` 或 `subscription.id` 做幂等性校验：

```javascript
const existingOrder = await Order.findOne({ stripeSessionId: session.id });
if (existingOrder) return;
```

### 4. 订阅取消后权限立即失效

用户取消订阅时，Stripe 默认 `cancel_at_period_end = true`，周期结束才停止服务。若业务要求立即失效，需要额外处理。

### 5. 3D Secure 验证失败

部分欧洲卡会触发 3DS。使用 `payment_intent.amount_capturable_updated` 或 `checkout.session.completed` 都能捕获最终结果，不要只监听 `payment_intent.succeeded`。

### 6. 异步支付方式（SEPA、ACH）

这类支付不会立即成功，必须监听 `checkout.session.async_payment_succeeded` 和 `checkout.session.async_payment_failed`。

### 7. 测试模式与生产模式密钥混淆

测试环境用 `sk_test_xxx` 和 `pk_test_xxx`，生产环境用 `sk_live_xxx` 和 `pk_live_xxx`。建议通过环境变量严格区分，代码中不要硬编码。

### 8. Node.js 版本与 SDK 兼容

项目基于 Node.js 26+，使用 ES Module 或 CommonJS 均可。Stripe Node SDK 最新版本要求 Node.js 12+，推荐使用 `stripe@latest`：

```bash
npm install stripe@latest
```

## 测试用例示例

```javascript
// __tests__/payment.test.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

test('生成测试 Webhook 签名并通过验证', () => {
  const payload = { id: 'evt_test', object: 'event', type: 'test' };
  const payloadString = JSON.stringify(payload, null, 2);
  const secret = 'whsec_test_secret';

  const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret,
  });

  const event = stripe.webhooks.constructEvent(payloadString, header, secret);
  expect(event.id).toBe('evt_test');
});
```

## 生产上线 Checklist

- [ ] 切换为 live 模式密钥。
- [ ] Dashboard 中配置生产 Webhook Endpoint，并重新生成 `whsec_live_xxx`。
- [ ] 启用 HTTPS，确保 `success_url` / `cancel_url` 使用 HTTPS。
- [ ] 配置 Stripe Tax 或手动税率。
- [ ] 实现 Webhook 幂等性校验。
- [ ] 配置失败重试与告警（如 invoice.payment_failed 通知用户）。
- [ ] 处理争议（Dispute）和退款（Refund）流程。
- [ ] 设置 Stripe 账户余额提现与银行信息。
- [ ] 记录所有支付日志，便于审计。

## 参考资源

- [Stripe Node.js 官方文档](https://docs.stripe.com/stripe-js)
- [Stripe Checkout 快速开始](https://docs.stripe.com/checkout/quickstart)
- [Stripe Webhook 最佳实践](https://docs.stripe.com/webhooks/quickstart)
- [Stripe 测试卡号](https://docs.stripe.com/testing)
