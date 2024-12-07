export type ISP = "中国电信" | "中国联通" | "中国移动" | "默认"

export const getData = async () => {
  const resp = await fetch(`https://kong.owonet.work/api/cloudflare/${process.env.NSOWO_API_KEY}`);
  const json = await resp.json();

  return json as {
    isp: ISP,
    v4: {
      ip: string,
      tcp_latency: number,
      created_at: string
    }[],
    v6: {
      ip: string,
      tcp_latency: number,
      created_at: string
    }[]
  }[]
}