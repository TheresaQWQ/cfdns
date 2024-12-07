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

  for (const record of v4) {
    await provider.createRecord(domain, subDomain, "A", record.ip, isp);
  }

  for (const record of v6) {
    await provider.createRecord(domain, subDomain, "AAAA", record.ip, isp);
  }
}

console.log(`[${new Date().toISOString()}] Sync DNS records for ${domain} with subdomain ${subDomain} completed`);
