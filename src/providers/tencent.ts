import tencentcloud from "tencentcloud-sdk-nodejs";
import type { RecordType, RecordValue } from "./types";
import type { ISP } from "../data";

const dnspod = tencentcloud.dnspod.v20210323.Client;

const clientConfig = {
  credential: {
    secretId: process.env.DNS_PROVIDER_TENCENT_CLOUD_SECRET_ID,
    secretKey: process.env.DNS_PROVIDER_TENCENT_CLOUD_SECRET_KEY,
  },
  region: "",
  profile: {
    httpProfile: {
      endpoint: "dnspod.tencentcloudapi.com",
    },
  },
};

const client = new dnspod(clientConfig);

const lineMap: {
  [key in ISP]: string
} = {
  "中国电信": "电信",
  "中国联通": "联通",
  "中国移动": "移动",
  "默认": "默认",
}

export const createRecord = async (domain: string, subDomain: string, type: RecordType, value: RecordValue, line: ISP) => {
  try {
    const mappedLine = lineMap[line as ISP] || "默认";

    console.log(`[${new Date().toISOString()}][TencentCloud] Create record: ${subDomain}.${domain} ${type} ${value} ${mappedLine}`);

    const resp = await client.CreateRecord({
      Domain: domain,
      SubDomain: subDomain,
      RecordType: type,
      RecordLine: mappedLine,
      Value: value,
    });

    console.log(`[${new Date().toISOString()}][TencentCloud] Create record success: ${resp.RecordId}`);

    return true
  } catch (error) {
    console.error(`[${new Date().toISOString()}][TencentCloud] Create record failed: ${error}`);
    return false
  }
};
