import type { Access, Audience, ServiceCatalogItem } from "../../config/serviceCatalog";
import { translate, type I18nText } from "../../i18n/LangContext";
import { servicesOfSphere } from "../../config/serviceCatalog";
import type { Sphere } from "../../config/spheres";

/**
 * N2 dizayni uchun mapper: loyihadagi `ServiceCatalogItem` -> N2 ko'rinish modeli (design-spec.json: timeBadge,
 * actionButtonLabel). Ma'lumot manbai o'zgarmaydi, faqat ko'rsatish qoidalari shu yerda.
 */
export type TimeKind = "instant" | "minute" | "days" | "soon";

/** Natija muddati turi. `status === "soon"` bo'lsa muddatdan qat'i nazar "Tez orada". */
export function timeKind(s: Pick<ServiceCatalogItem, "status" | "duration">): TimeKind {
  if (s.status === "soon") return "soon";
  const d = translate(s.duration, "uz").toLowerCase();
  if (d.includes("kun")) return "days";
  if (d.includes("daqiqa")) return "minute";
  return "instant";
}

/** Muddat belgisi sinfi (ranglar spheres-n2.css dagi o'zgaruvchilardan). */
export const TIME_BADGE_CLASS: Record<TimeKind, string> = {
  instant: "bg-[var(--sn-ok-bg)] text-[var(--sn-ok-fg)]",
  minute: "bg-[var(--p50)] text-[var(--p800)]",
  days: "bg-[var(--sn-warn-bg)] text-[var(--sn-warn-fg)]",
  soon: "bg-[var(--sn-gray-bg)] text-[var(--sn-gray-fg)]",
};

const SOON_TEXT: I18nText = { uz: "Tez orada", ru: "Скоро" };

/** Belgidagi matn: tez orada bo'lsa "Tez orada", aks holda katalogdagi `duration`. */
export const timeText = (s: Pick<ServiceCatalogItem, "status" | "duration">): I18nText =>
  timeKind(s) === "soon" ? SOON_TEXT : s.duration;

const ACTION: Record<TimeKind, I18nText> = {
  instant: { uz: "Xizmatdan foydalanish", ru: "Воспользоваться услугой" },
  minute: { uz: "Xizmatdan foydalanish", ru: "Воспользоваться услугой" },
  days: { uz: "So'rov yuborish", ru: "Отправить запрос" },
  soon: SOON_TEXT,
};
const ORDER: I18nText = { uz: "Buyurtma berish", ru: "Оформить заказ" };

/** Asosiy tugma matni: 3 daqiqa -> "Buyurtma berish" (spec). "Boshlash" ishlatilmaydi. */
export function actionLabel(s: Pick<ServiceCatalogItem, "status" | "duration">): I18nText {
  const kind = timeKind(s);
  if (kind === "minute" && translate(s.duration, "uz").startsWith("3")) return ORDER;
  return ACTION[kind];
}

/** "Kimlar uchun" — ServicePage dagi mavjud matnlar bilan bir xil. */
export const AUDIENCE_TEXT: Record<Audience, I18nText> = {
  all: { uz: "Jismoniy va yuridik shaxslar", ru: "Физические и юридические лица" },
  legal: { uz: "Yuridik shaxslar", ru: "Юридические лица" },
  individual: { uz: "Jismoniy shaxslar", ru: "Физические лица" },
};

/** Soha kartochkasidagi son: sohaning o'z xizmatlari + `alsoIn` orqali kelganlari (soha sahifasidagi ro'yxat bilan bir xil). */
export const sphereServiceCount = (sp: Sphere) => servicesOfSphere(sp.id).length;

/** Kirish turi matni — ServicePage dagi mavjud matnlar bilan bir xil. */
export const ACCESS_TEXT: Record<Access, I18nText> = {
  open: { uz: "Ro'yxatdan o'tmasdan foydalanish mumkin", ru: "Доступно без регистрации" },
  login: { uz: "Tizimga kirish talab qilinadi", ru: "Требуется вход в систему" },
  package: { uz: "Tarif paketi bo'yicha (limitdan yechiladi)", ru: "По тарифному пакету (списывается с лимита)" },
  priced: { uz: "Alohida narx bo'yicha", ru: "По отдельной цене" },
  credits: { uz: "Asosiy qismi bepul, batafsil tahlil pullik (hamyondan)", ru: "Основная часть бесплатно, подробный анализ — платно (из кошелька)" },
};
