# nsowo

Cloudflare 优选IP自动同步

支持腾讯云 DNSPod 和华为云 DNS。

- 支持多个 DNS 服务商（腾讯云 DNSPod、华为云 DNS）
- 支持 IPv4 和 IPv6 记录
- 支持按运营商线路设置解析记录（电信、联通、移动）
- 支持 GitHub Actions 自动运行
- 实时监控：https://cf.owonet.work/

## 购买APIKEY

- 爱发电：https://afdian.com/item/39d3ede6b4aa11ef8f7452540025c377

## 本地运行

1. 安装依赖：

```bash
bun install
```

2. 配置环境变量

```env
# DNS服务商 HuaweiCloud（华为云）或 TencentCloud（腾讯云DNSPod）
DNS_PROVIDER=

# 腾讯云密钥
DNS_PROVIDER_TENCENT_CLOUD_SECRET_ID=
DNS_PROVIDER_TENCENT_CLOUD_SECRET_KEY=

# 华为云密钥和域名的ZoneID
DNS_PROVIDER_HUAWEI_CLOUD_AK=
DNS_PROVIDER_HUAWEI_CLOUD_SK=
DNS_PROVIDER_HUAWEI_CLOUD_PROJECT_ID=
# ZoneID 可以在华为云控制台，进入域名管理后，在url中找到（是一串看起来类似于md5的hex值）
DNS_PROVIDER_HUAWEI_CLOUD_ZONE_ID=

# 域名
DNS_DOMAIN=
# 子域名
DNS_SUB_DOMAIN=

# NSOWO API 密钥
NSOWO_API_KEY=
```

3. 运行：

```bash
bun run start
```

## GitHub Actions
1. Fork本仓库
2. 进入 `Settings` -> `Secrets`，添加环境变量（可以参考 .env.example 文件）
3. 进入 `Actions`，点击 `Run workflow` 运行
4. 如果有需要，可以自己编辑 `.github/workflows/scheduled-run.yml` 文件进行调整
