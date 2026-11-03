import axiosT from "./baseUrl";

/** `total` — aylanma (eksport + import), TI-02 */
export type TradeFlow = "export" | "import" | "total";

export const FLOW_LABEL: Record<TradeFlow, string> = { export: "Eksport", import: "Import", total: "Aylanma" };

/** Bazadagi TradeData.value birligi. Statistika qo'mitasi tashqi savdoni odatda ming AQSh dollarida beradi —
 *  egasi tomonidan tasdiqlanishi kerak (ISH_REJASI.md, OS-10). */
export const TRADE_VALUE_UNIT = "ming AQSh $";

export interface TradeFlowCountry {
  country_id: number;
  country_name: string;
  country_name_en: string;
  iso_numeric: string | null;
  value: number;
  quantity: number;
  share: number;
  prev_value: number | null;
  change_pct: number | null;
}

export interface TradeFlowsResponse {
  year: number;
  flow: TradeFlow;
  hs: string | null;
  period: string;
  period_label: string;
  total_value: number;
  other_countries_value: number;
  countries_count: number;
  /** Ma'lumot sifati haqida ogohlantirishlar (taqqoslangan yillar to'liq bo'lmasa) */
  warnings?: string[];
  years: number[];
  countries: TradeFlowCountry[];
}

export interface TradeDynamicsPoint {
  year: number;
  period: string;
  period_label: string;
  value: number;
}

const BASE = "/additional-services/external-trade/trade-flows/";

export const fetchTradeFlows = async (params: { flow: TradeFlow; year?: number; hs?: string; limit?: number }) => {
  const query: Record<string, string> = { flow: params.flow, limit: String(params.limit ?? 300) };
  if (params.year) query.year = String(params.year);
  if (params.hs) query.hs = params.hs;
  return (await axiosT.get<TradeFlowsResponse>(BASE, { params: query })).data;
};

/** U-16: joriy jadvalni yuklab olish (server ko'pi bilan 10 000 qator qaytaradi). */
export const downloadTradeExport = async (params: { flow: TradeFlow; year?: number; hs?: string; detail: "country" | "hs4"; format: "csv" | "xlsx" }) => {
  const query: Record<string, string> = { flow: params.flow, detail: params.detail, file: params.format };
  if (params.year) query.year = String(params.year);
  if (params.hs) query.hs = params.hs;
  const res = await axiosT.get(`${BASE}export/`, { params: query, responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tashqi-savdo-${params.flow}-${params.year ?? ""}.${params.format}`;
  a.click();
  URL.revokeObjectURL(url);
  return { rows: Number(res.headers["x-rows"] ?? 0), truncated: res.headers["x-truncated"] === "1" };
};

export const fetchTradeDynamics = async (flow: TradeFlow, country?: number | null) => {
  const query: Record<string, string> = { flow };
  if (country) query.country = String(country);
  return (await axiosT.get<TradeDynamicsPoint[]>(`${BASE}dynamics/`, { params: query })).data;
};

export interface TradeAdviceBlock {
  summary: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  /** Savolga javob (savol berilgan bo'lsa) */
  answer: string;
  /** ai — lokal Gemma; rules — raqamlarga asoslangan qoidalar */
  source: "ai" | "rules";
}

export interface TradeAdviceResponse {
  snapshot: { year: number; period_label: string; hs: string | null; warnings: string[] };
  advice: TradeAdviceBlock;
}

/** Eksport/import bo'yicha maslahatchi tahlili (AI yoki qoidalar). Raqamlar serverda bazadan olinadi. */
export const fetchTradeAdvice = async (params: { year?: number; hs?: string; question?: string }) =>
  (await axiosT.post<TradeAdviceResponse>(`${BASE}advice/`, params)).data;

/** Shu tahlilni Word (.docx) hisobot qilib yuklab oladi. */
export const downloadTradeAdviceDocx = async (params: { year?: number; hs?: string; question?: string }) => {
  const res = await axiosT.post(`${BASE}advice/docx/`, params, { responseType: "blob" });
  const url = URL.createObjectURL(res.data as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tashqi-savdo-tahlil-${params.year ?? ""}${params.hs ? `-${params.hs}` : ""}.docx`;
  a.click();
  URL.revokeObjectURL(url);
};
