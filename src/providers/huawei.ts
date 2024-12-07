import { BasicCredentials } from "@huaweicloud/huaweicloud-sdk-core";
import { DnsClient, CreateRecordSetWithLineRequest, CreateRecordSetWithLineRequestBody } from "@huaweicloud/huaweicloud-sdk-dns/v2/public-api";
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