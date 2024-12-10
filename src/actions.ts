import { getData } from "./data";
import { createRecord as TencentCloud, cleanRecord as TencentCloudCleanRecord } from "./providers/tencent";
import { createRecord as HuaweiCloud, cleanRecord as HuaweiCloudCleanRecord } from "./providers/huawei";

const map = {
  "TencentCloud": {
    createRecord: TencentCloud,
    cleanRecord: TencentCloudCleanRecord,
  },
  "HuaweiCloud": {
    createRecord: HuaweiCloud,
    cleanRecord: HuaweiCloudCleanRecord,
  },
}

const provider = map[process.env.DNS_PROVIDER as keyof typeof map];

if (!provider) {
  throw new Error(`Unknown DNS provider: ${process.env.DNS_PROVIDER}`);
}

const domain = process.env.DNS_DOMAIN as string;
const subDomain = process.env.DNS_SUB_DOMAIN as string;
const apikey = process.env.NSOWO_API_KEY as string;

console.log(`[${new Date().toISOString()}] Start to sync DNS records for ${domain} with subdomain ${subDomain}`);

if (!domain || !subDomain) {
  throw new Error("DNS_DOMAIN or DNS_SUB_DOMAIN is not set");
}

if (!apikey) {
  throw new Error("NSOWO_API_KEY is not set");
}

const data = await getData();
await provider.cleanRecord(domain, subDomain);

for (const item of data) {
  const { isp, v4, v6 } = item;

  const [v4Record, defaultV4Record] = [
    v4.slice(0, -1),
    v4.slice(-1)[0]
  ]

  const [v6Record, defaultV6Record] = [
    v6.slice(0, -1),
    v6.slice(-1)[0]
  ]

  for (const record of v4Record) {
    await provider.createRecord(domain, subDomain, "A", record.ip, isp);
  }

  for (const record of v6Record) {
    await provider.createRecord(domain, subDomain, "AAAA", record.ip, isp);
  }

  defaultV4Record && await provider.createRecord(domain, subDomain, "A", defaultV4Record.ip, "默认");
  defaultV6Record && await provider.createRecord(domain, subDomain, "AAAA", defaultV6Record.ip, "默认");
}

console.log(`[${new Date().toISOString()}] Sync DNS records for ${domain} with subdomain ${subDomain} completed`);
