# Travel 商户后台插件

本插件把全球迪拜旅游业务以 **simple-admin 商户后台插件** 形式接入，不修改总后台业务。

## 当前范围

- 产品管理：旅游产品、目的地、状态、最低售价
- 库存管理：日期、时段、库存、价格、可售状态
- 订单管理：订单号、订单状态、金额、币种
- 与 `travel-api` 对接；`travel-rpc` 不直接暴露给前端
- 沿用 simple-admin 商户登录、权限和租户隔离边界

## 目录约定

```text
plugin/travel/
├── api/
│   ├── product.ts
│   ├── inventory.ts
│   └── order.ts
├── views/
│   ├── product/index.vue
│   ├── inventory/index.vue
│   └── order/index.vue
├── menu.sql
└── README.md
```

## 明确不做

当前阶段不建设 simple-admin 总后台的 Travel 管理模块。平台级审核、平台供应商管理等总后台能力后续单独规划。

## 数据边界

商户后台不提交租户 ID、商户 ID、最终订单金额或币种作为可信数据；这些值必须由服务端根据登录上下文和旅游业务数据计算。

## 开发顺序

1. Travel RPC + API
2. Travel 商户后台插件
3. PayPal / 支付抽象
4. Web/H5
5. App

当前插件先完成菜单、API 模块和页面骨架，待 travel-api 生成代码及 RPC 业务服务稳定后继续接入真实业务。
