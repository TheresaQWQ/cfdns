import { BasicCredentials } from "@huaweicloud/huaweicloud-sdk-core";
import { DnsClient, CreateRecordSetWithLineRequest, CreateRecordSetWithLineRequestBody, DeleteRecordSetsRequest, ShowRecordSetByZoneRequest } from "@huaweicloud/huaweicloud-sdk-dns/v2/public-api";
import type { RecordType, RecordValue } from "./types";
import type { ISP } from "../data";

const credentials = new BasicCredentials()
  .withAk(process.env.DNS_PROVIDER_HUAWEI_CLOUD_AK)
  .withSk(process.env.DNS_PROVIDER_HUAWEI_CLOUD_SK)
  .withProjectId(process.env.DNS_PROVIDER_HUAWEI_CLOUD_PROJECT_ID);

const client = DnsClient.newBuilder()
  .withCredential(credentials)
  .withEndpoint("https://dns.cn-east-3.myhuaweicloud.com")
  .build();

const lineMap: {
  [key in ISP]: string
} = {
  "中国电信": "Dianxin",
  "中国联通": "Liantong",
  "中国移动": "Yidong",
  "默认": "default_view"
};

export const createRecord = async (domain: string, subDomain: string, type: RecordType, value: RecordValue, line: ISP) => {
  try {
    const mappedLine = lineMap[line as ISP] || "default_view";
    const zoneId = process.env.DNS_PROVIDER_HUAWEI_CLOUD_ZONE_ID;
    
    if (!zoneId) {
      throw new Error("DNS_PROVIDER_HUAWEI_CLOUD_ZONE_ID is not set");
    }
    
    console.log(`[${new Date().toISOString()}][HuaweiCloud] Create record: ${subDomain}.${domain} ${type} ${value} ${mappedLine}`);

    const request = new CreateRecordSetWithLineRequest();
    const body = new CreateRecordSetWithLineRequestBody();
    
    body.withName(`${subDomain}.${domain}.`)
      .withType(type)
      .withRecords([value])
      .withLine(mappedLine)
      .withTtl(300);
    
    request.withBody(body)
      .withZoneId(zoneId);
    
    const result = await client.createRecordSetWithLine(request);
    
    console.log(`[${new Date().toISOString()}][HuaweiCloud] Create record success: ${result.id}`);
    
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}][HuaweiCloud] Create record failed: ${error}`);
    return false;
  }
};

const getRecords = async (domain: string, subDomain: string, size: number, offset: number) => {
  try {
    const zoneId = process.env.DNS_PROVIDER_HUAWEI_CLOUD_ZONE_ID;
    
    if (!zoneId) {
      throw new Error("DNS_PROVIDER_HUAWEI_CLOUD_ZONE_ID is not set");
    }

    console.log(`[${new Date().toISOString()}][HuaweiCloud] Get records: ${subDomain}.${domain}, size: ${size}, offset: ${offset}`);

    const request = new ShowRecordSetByZoneRequest();
    request.withZoneId(zoneId)
      .withName(`${subDomain}.${domain}.`)
      .withLimit(size)
      .withOffset(offset);

    const result = await client.showRecordSetByZone(request);
    
    console.log(`[${new Date().toISOString()}][HuaweiCloud] Get records success: ${result.recordsets?.length || 0} records`);
    
    return result.recordsets || [];
  } catch (error) {
    console.error(`[${new Date().toISOString()}][HuaweiCloud] Get records failed: ${error}`);
    return [];
  }
};

const deleteRecord = async (domain: string, subDomain: string, recordId: string) => {
  try {
    const zoneId = process.env.DNS_PROVIDER_HUAWEI_CLOUD_ZONE_ID;
    
    if (!zoneId) {
      throw new Error("DNS_PROVIDER_HUAWEI_CLOUD_ZONE_ID is not set");
    }

    console.log(`[${new Date().toISOString()}][HuaweiCloud] Delete record: ${subDomain}.${domain} (${recordId})`);

    const request = new DeleteRecordSetsRequest();
    request.withZoneId(zoneId)
      .withRecordsetId(recordId);

    client.deleteRecordSets(request).then
    
    console.log(`[${new Date().toISOString()}][HuaweiCloud] Delete record success: ${recordId}`);
    
    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}][HuaweiCloud] Delete record failed: ${error}`);
    return false;
  }
}

export const cleanRecord = async (domain: string, subDomain: string) => {
  // 先获取所有记录
  const size = 500;
  let offset = 0;

  const promises: Promise<boolean>[] = [];
  
  while (true) {
    console.log(`[${new Date().toISOString()}][HuaweiCloud] Get records: ${subDomain}.${domain} (offset: ${offset}, size: ${size})`);
    const records = await getRecords(domain, subDomain, size, offset);
    
    if (records.length === 0) {
      break;
    }

    // 删除获取到的所有记录
    for (const record of records) {
      if (record.id) {
        promises.push(deleteRecord(domain, subDomain, record.id));
      }
    }

    offset += records.length;
  }

  await Promise.all(promises);

  console.log(`[${new Date().toISOString()}][HuaweiCloud] Clean records success`);
}
