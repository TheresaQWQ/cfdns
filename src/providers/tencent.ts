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

const getRecords = async (domain: string, offset: number = 0, limit: number = 3000) => {
  const resp = await client.DescribeRecordList({
    Domain: domain,
    Offset: offset,
    Limit: limit,
  })

  return resp.RecordList || [];
}

const deleteRecord = async (domain: string, recordId: number) => {
  try {
    await client.DeleteRecord({
      Domain: domain,
      RecordId: recordId
    })
  
    console.log(`[${new Date().toISOString()}][TencentCloud] Delete record success: ${recordId}`);
  
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}][TencentCloud] Delete record failed: ${error}`);
    return false;
  }
}

export const cleanRecord = async (domain: string, subDomain: string) => {
  // 先获取所有记录
  const size = 500;
  let offset = 0;
  
  const promises: Promise<boolean>[] = [];

  while (true) {
    console.log(`[${new Date().toISOString()}][TencentCloud] Get records: ${subDomain}.${domain} (offset: ${offset}, size: ${size})`);
    const records = await getRecords(domain, offset, size);

    if (records.length === 0) {
      break;
    }

    for (const record of records) {
      if (record.Name === `${subDomain}.${domain}`) {
        promises.push(deleteRecord(domain, record.RecordId));
      }
    }

    offset += records.length;
  }

  await Promise.all(promises);

  console.log(`[${new Date().toISOString()}][TencentCloud] Clean records success`);
}
