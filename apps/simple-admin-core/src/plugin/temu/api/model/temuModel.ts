export interface IDsUint32Req {
  ids: number[];
}

export interface TemuMerchantInfo {
  id?: number;
  name?: string;
  api_key?: string;
  api_secret?: string;
  status?: string;
  upstream_base_url?: string;
  key_expire_at?: number;
  default_max_concurrent?: number;
  default_rate_limit_per_sec?: number;
  default_burst?: number;
  default_breaker_threshold?: number;
  default_breaker_cooldown_sec?: number;
  createtime?: number;
  updatetime?: number;
  deletetime?: number | null;
}

export interface TemuMerchantListResp {
  total: number;
  data: TemuMerchantInfo[];
}

export interface TemuRequestLogInfo {
  id?: number;
  merchant_id?: number;
  merchant_name?: string;
  merchantName?: string;
  api_key?: string;
  interface_code?: string;
  request_path?: string;
  requestPath?: string;
  method?: string;
  request_method?: string;
  requestMethod?: string;
  path?: string;
  request_ip?: string;
  requestIp?: string;
  status_code?: number;
  statusCode?: number;
  upstream_status?: number;
  upstreamStatus?: number;
  blocked_reason?: string;
  blockedReason?: string;
  latency_ms?: number;
  latencyMS?: number;
  cost_ms?: number;
  blocked?: number;
  request_body?: string;
  requestBody?: string;
  response_body?: string;
  responseBody?: string;
  createtime?: number;
  created_at?: number;
  createdAt?: number;
}

export interface TemuRequestLogListResp {
  total: number;
  data: TemuRequestLogInfo[];
}
