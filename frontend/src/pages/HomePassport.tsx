import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import { POPULAR, SERVICES, type Access, type ServiceCatalogItem } from "../config/serviceCatalog";
import { SPHERES, sphereById } from "../config/spheres";
import { POPULAR_QUERIES, searchUrl } from "../config/searchFilters";
import { SITUATIONS } from "../config/situations";
import { useLang, type I18nText } from "../i18n/LangContext";
import { UI } from "../i18n/ui";
import { compactNumber, useServiceStats } from "../components/catalog/useServiceStats";
import type { ServiceShortStats } from "../api/portal";

/**
 * "Shaffof xizmat pasporti" (Variant P) bosh sahifasi. Hamma xizmat `serviceCatalog.ts` dan o'qiladi (takroriy ro'yxat yo'q):
 * hero → xizmat pasporti slayderi (6 ta ommabop) → eng ko'p foydalaniladigan 8 ta → barcha xizmatlar (soha tablari) →
 * hayotiy vaziyatlar va yordam bloki. Foydalanish soni va baho `/portal/services/stats/` dan; namuna bo'lsa "namuna" deb belgilanadi.
 */
const ACCESS_SHORT: Record<Access, I18nText> = {
  open: { uz: "Bepul", ru: "Бесплатно" },
  login: { uz: "Bepul", ru: "Бесплатно" },
  package: { uz: "Paket", ru: "Пакет" },
  priced: { uz: "Pullik", ru: "Платно" },
  credits: { uz: "Hamyondan", ru: "Из кошелька" },
};
const ACCESS_NOTE: Record<Access, I18nText> = {
  open: { uz: "kirishsiz", ru: "без входа" },
  login: { uz: "kirish orqali", ru: "после входа" },
  package: { uz: "tarif limitidan", ru: "из лимита тарифа" },
  priced: { uz: "alohida narx", ru: "отдельная цена" },
  credits: { uz: "StatCoin hamyonidan", ru: "из кошелька StatCoin" },
};
const USERS_NOTE: Record<ServiceCatalogItem["users"], I18nText> = {
  all: { uz: "hamma uchun", ru: "для всех" },
  legal: { uz: "yuridik shaxslar", ru: "юридические лица" },
  individual: { uz: "jismoniy shaxslar", ru: "физические лица" },
};

const cardLink = "pp-card block rounded-[20px] border border-transparent bg-[var(--pp-card)] text-[var(--pp-text)] hover:no-underline";

function Soon() {
  const { t } = useLang();
  return <span className="rounded-full border border-dashed border-amber-700 bg-amber-50 px-1.5 text-[10.5px] font-normal text-amber-800">{t(UI.soon)}</span>;
}

function Hero({ featured, stats, isSample }: { featured: ServiceCatalogItem[]; stats: Record<string, ServiceShortStats>; isSample: boolean }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);

  useEffect(() => {
    if (hold || featured.length < 2) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % featured.length), 6000);
    return () => window.clearInterval(id);
  }, [hold, featured.length]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate(searchUrl(q.trim()));
  };
  const s = featured[i];
  const st = s ? stats[s.number] : undefined;
  const fields = s ? [
    { k: t({ uz: "MUDDAT", ru: "СРОК" }), v: t(s.duration), n: t({ uz: "bajarish vaqti", ru: "время выполнения" }) },
    { k: t({ uz: "NARX", ru: "ЦЕНА" }), v: t(ACCESS_SHORT[s.access]), n: t(ACCESS_NOTE[s.access]) },
    { k: t({ uz: "USUL", ru: "СПОСОБ" }), v: s.actionType === "apply" ? t({ uz: "Ariza", ru: "Заявка" }) : t({ uz: "Onlayn", ru: "Онлайн" }), n: t(USERS_NOTE[s.users]) },
    { k: t({ uz: "SOHA", ru: "СФЕРА" }), v: String(sphereById(s.sphere)?.id ?? "").padStart(2, "0"), n: sphereById(s.sphere) ? t(sphereById(s.sphere)!.title) : "" },
    { k: t({ uz: "FOYDALANISH", ru: "ИСПОЛЬЗОВАНИЙ" }), v: st?.usage ? compactNumber(st.usage) : "—", n: t({ uz: "jami", ru: "всего" }) },
    { k: t({ uz: "BAHO", ru: "ОЦЕНКА" }), v: st?.rating != null ? `${st.rating.toFixed(1)} / 5` : "—", n: st?.ratings ? `${st.ratings} ${t({ uz: "baho", ru: "оценок" })}` : t({ uz: "baho yo'q", ru: "оценок нет" }) },
  ] : [];
  const Icon = s?.icon;

  return (
    <section role="search" aria-label={t({ uz: "Rasmiy statistika portali va qidiruv", ru: "Портал официальной статистики и поиск" })}
      className="pp-fu relative flex min-h-[clamp(560px,70vh,820px)] flex-col overflow-hidden rounded-[32px] p-6 text-white sm:p-10"
      style={{ background: "linear-gradient(135deg, var(--p800) 0%, var(--btn) 100%)" }}>
      <svg aria-hidden="true" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" className="pointer-events-none absolute inset-0 h-full w-full">
        <circle cx="1080" cy="80" r="260" fill="#fff" opacity=".05" />
        <circle cx="1080" cy="80" r="380" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".08" />
        <circle cx="120" cy="720" r="320" fill="#fff" opacity=".04" />
        <circle cx="120" cy="720" r="440" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".06" />
      </svg>
      <div className="relative z-[1] flex flex-1 flex-wrap items-stretch gap-8">
        <div className="flex min-w-0 flex-[5_1_560px] flex-col justify-center gap-6">
          <span className="flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/15 px-3.5 py-[7px] text-[13px] font-semibold">
            <span className="h-[7px] w-[7px] rounded-full bg-[#5be37a]" />
            {SERVICES.length} {t({ uz: "ta davlat xizmati · onlayn", ru: "государственных услуг · онлайн" })}
          </span>
          <h1 className="m-0 max-w-[820px] text-[clamp(36px,5vw,58px)] font-extrabold leading-none tracking-[-0.045em]">
            {t({ uz: "Kerakli raqamni yozing — ", ru: "Введите нужную цифру — " })}
            <span className="text-[#ffe08a]">{t({ uz: "qolganini biz topamiz.", ru: "остальное найдём мы." })}</span>
          </h1>
          <p className="m-0 max-w-[620px] text-lg text-white/90">
            {t({ uz: "Hisobot topshirish, korxonani tekshirish, rasmiy ko'rsatkichlar — bitta qidiruvda, bir necha soniyada.", ru: "Сдача отчётов, проверка предприятия, официальные показатели — в одном поиске, за секунды." })}
          </p>
          <form onSubmit={submit} className="flex w-full gap-2 rounded-[20px] bg-white p-2 shadow-[0_22px_44px_-20px_rgba(0,0,0,0.55)]">
            <span aria-hidden="true" className="flex w-12 shrink-0 items-center justify-center text-[var(--btn)]"><Search className="h-[22px] w-[22px]" /></span>
            <label htmlFor="pp-q" className="sr-only">{t({ uz: "Xizmatlarni qidirish", ru: "Поиск услуг" })}</label>
            <input id="pp-q" type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={t({ uz: "Masalan: hisobot topshirish, STIR bo'yicha tekshiruv, inflyatsiya", ru: "Например: сдача отчёта, проверка по ИНН, инфляция" })}
              className="h-[60px] min-w-0 flex-1 rounded-xl border-0 bg-transparent px-2 text-lg text-[#1b2530] outline-none placeholder:text-[#6b7885]" />
            <button type="submit" className="h-[60px] rounded-[14px] bg-[var(--btn)] px-6 text-base font-extrabold text-white hover:brightness-110 sm:px-8">{t({ uz: "Topish", ru: "Найти" })}</button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-white/85">{t({ uz: "Ko'p qidiriladi:", ru: "Часто ищут:" })}</span>
            {POPULAR_QUERIES.map((c) => (
              <Link key={c} to={searchUrl(c)} className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/25 hover:no-underline">{c}</Link>
            ))}
          </div>
        </div>

        {s && Icon && (
          <div onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}
            className="relative flex min-w-0 flex-[3_1_400px] flex-col gap-3.5 overflow-hidden rounded-3xl border border-white/30 bg-white/[0.13] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.18)]">
            <div key={s.number} className="pp-slide relative flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="text-xs font-bold tracking-[0.16em] text-white/80">{t({ uz: "XIZMAT PASPORTI", ru: "ПАСПОРТ УСЛУГИ" })} · № {s.number}</span>
                  <span className="text-[clamp(26px,2.4vw,36px)] font-extrabold leading-[1.04] tracking-[-0.035em]">{t(s.title)}</span>
                </div>
                <span aria-hidden="true" className="relative flex h-[84px] w-[84px] shrink-0 items-center justify-center">
                  <svg width="84" height="84" viewBox="0 0 74 74" className="absolute inset-0">
                    <circle cx="37" cy="37" r="34" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="37" cy="37" r="28" fill="none" stroke="currentColor" strokeWidth=".8" strokeDasharray="2 2.5" />
                    <circle cx="37" cy="37" r="22" fill="currentColor" fillOpacity=".14" />
                  </svg>
                  <Icon className="relative h-[34px] w-[34px]" strokeWidth={1.8} />
                </span>
              </div>
              <span className="line-clamp-3 max-w-[520px] text-[17px] font-semibold leading-snug">{t(s.description)}</span>
              <div className="mt-1 grid grid-cols-2 overflow-hidden rounded-xl border-l border-t border-white/25">
                {fields.map((f) => (
                  <span key={f.k} className="flex min-w-0 flex-col gap-1.5 border-b border-r border-white/25 bg-white/[0.06] px-4 py-3.5">
                    <span className="text-xs font-bold tracking-[0.12em] text-white/75">{f.k}</span>
                    <span className="truncate text-[22px] font-extrabold leading-[1.1] tracking-[-0.02em]">{f.v}</span>
                    <span className="truncate text-xs text-white/70">{f.n}</span>
                  </span>
                ))}
              </div>
              <span className="mono mt-auto flex items-center gap-2.5 pt-2 text-xs text-white/75">
                <span className="tracking-[0.06em]">STAT·UZ·{String(s.number).padStart(4, "0")}·{new Date().getFullYear()}</span>
                {isSample && <span>· {t({ uz: "namuna", ru: "образец" })}</span>}
              </span>
            </div>
            <div className="relative flex min-h-[52px] items-center gap-1.5 border-t border-dashed border-white/30 pt-3 pr-[190px]">
              {featured.map((f, n) => (
                <button key={f.number} type="button" onClick={() => { setI(n); setHold(true); }} aria-label={t(f.title)} aria-current={n === i}
                  className="h-2 rounded-full border-0 p-0 transition-all duration-300"
                  style={{ width: n === i ? 30 : 8, background: n === i ? "#fff" : "rgba(255,255,255,0.35)" }} />
              ))}
              <span className="mono ml-2 text-[11px] text-white/75">{i + 1} / {featured.length}</span>
            </div>
            <Link to={`/service/${s.number}`} className="absolute bottom-6 right-6 z-[2] flex h-[50px] items-center rounded-full bg-white px-6 text-base font-extrabold text-[var(--p800)] shadow-[0_14px_28px_-12px_rgba(0,0,0,0.45)] hover:no-underline">
              {t({ uz: "Foydalanish →", ru: "Использовать →" })}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function TopServices({ items, stats, isSample }: { items: ServiceCatalogItem[]; stats: Record<string, ServiceShortStats>; isSample: boolean }) {
  const { t } = useLang();
  const max = Math.max(1, ...items.map((s) => stats[s.number]?.usage ?? 0));
  return (
    <section aria-labelledby="pp-top" className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="pp-top" className="m-0 text-[28px] font-extrabold tracking-[-0.03em]">{t({ uz: "Eng ko'p foydalaniladigan xizmatlar", ru: "Самые востребованные услуги" })}</h2>
          <span className="text-[13px] text-[var(--pp-muted)]">
            {t({ uz: "Foydalanishlar soni bo'yicha", ru: "По числу использований" })}{isSample ? ` · ${t({ uz: "namuna ma'lumot", ru: "образец данных" })}` : ""}
          </span>
        </div>
        <span className="text-[13px] text-[var(--pp-muted)]">{items.length} {t({ uz: "ta xizmat", ru: "услуг" })}</span>
      </div>
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(270px,1fr))]">
        {items.map((s, n) => {
          const Icon = s.icon;
          const use = stats[s.number]?.usage ?? 0;
          return (
            <Link key={s.number} to={`/service/${s.number}`} className={`${cardLink} pp-fu flex flex-col gap-3.5 p-[18px]`}>
              <span className="flex items-start justify-between gap-2">
                <span aria-hidden="true" className="flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-[var(--btn)] text-white shadow-[0_8px_18px_-10px_var(--btn)]"><Icon className="h-6 w-6" strokeWidth={1.9} /></span>
                <span className="mono rounded-full bg-[var(--p50)] px-2.5 py-1 text-xs font-bold text-[var(--p800)]">#{n + 1}</span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2 text-lg font-bold tracking-[-0.01em]">{t(s.title)}{s.status === "soon" && <Soon />}</span>
                <span className="line-clamp-2 text-sm text-[var(--pp-muted)]">{t(s.description)}</span>
              </span>
              <span className="mt-auto flex items-center justify-between gap-2">
                <span className="mono text-xs text-[var(--pp-muted)]">{use ? `${compactNumber(use)} ${t({ uz: "marta", ru: "раз" })}` : t(s.duration)}</span>
                <span className="text-sm font-bold text-[var(--btn)]">{t({ uz: "Boshlash →", ru: "Начать →" })}</span>
              </span>
              <span className="block h-[5px] overflow-hidden rounded-full bg-[var(--pp-soft)]"><span className="block h-full rounded-full bg-[var(--btn)]" style={{ width: `${use ? Math.max(6, (use / max) * 100) : 6}%` }} /></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function AllServices({ stats }: { stats: Record<string, ServiceShortStats> }) {
  const { t } = useLang();
  const [sphere, setSphere] = useState<number | 0>(0);
  const list = useMemo(() => {
    const base = sphere ? SERVICES.filter((s) => s.sphere === sphere || s.alsoIn?.includes(sphere)) : SERVICES;
    return [...base].sort((a, b) => (stats[b.number]?.usage ?? 0) - (stats[a.number]?.usage ?? 0) || (a.popularOrder ?? 99) - (b.popularOrder ?? 99) || a.number - b.number);
  }, [sphere, stats]);
  const count = (id: number) => SERVICES.filter((s) => s.sphere === id || s.alsoIn?.includes(id)).length;
  const tab = (on: boolean) => `pp-focus rounded-full px-3.5 py-2 text-[13px] font-semibold ${on ? "bg-[var(--btn)] text-white" : "text-[var(--pp-muted)] hover:bg-[var(--pp-soft)]"}`;
  return (
    <section aria-labelledby="pp-all" className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="pp-all" className="m-0 text-2xl font-extrabold tracking-[-0.03em]">{t({ uz: "Barcha xizmatlar", ru: "Все услуги" })}</h2>
          <span className="text-[13px] text-[var(--pp-muted)]">{t({ uz: "Har bir sohada ko'p foydalaniladigani birinchi", ru: "В каждой сфере сначала самые востребованные" })}</span>
        </div>
        <div role="tablist" aria-label={t({ uz: "Soha", ru: "Сфера" })} className="flex max-w-full flex-wrap gap-1 rounded-[22px] border border-[var(--pp-line)] bg-[var(--pp-card)] p-1">
          <button type="button" role="tab" aria-selected={sphere === 0} onClick={() => setSphere(0)} className={tab(sphere === 0)}>
            {t({ uz: "Hammasi", ru: "Все" })} <span className="mono opacity-70">{SERVICES.length}</span>
          </button>
          {SPHERES.map((sp) => (
            <button key={sp.id} type="button" role="tab" aria-selected={sphere === sp.id} onClick={() => setSphere(sp.id)} className={tab(sphere === sp.id)}>
              {t(sp.title)} <span className="mono opacity-70">{count(sp.id)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
        {list.map((s) => {
          const Icon = s.icon;
          const use = stats[s.number]?.usage;
          const sp = sphereById(s.sphere);
          return (
            <Link key={s.number} to={`/service/${s.number}`} className={`${cardLink} flex items-start gap-3 p-4`}>
              <span aria-hidden="true" className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[var(--p50)] text-[var(--p800)]"><Icon className="h-5 w-5" strokeWidth={1.9} /></span>
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="flex flex-wrap items-center gap-1.5 text-[15px] font-bold leading-tight">{t(s.title)}{s.status === "soon" && <Soon />}</span>
                <span className="line-clamp-2 text-[13px] leading-snug text-[var(--pp-muted)]">{t(s.description)}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--pp-muted)]">
                  {sp && <span className="max-w-full truncate rounded-full bg-[var(--pp-soft)] px-2 py-0.5">{t(sp.title)}</span>}
                  <span className="mono">{use ? `${compactNumber(use)} ${t({ uz: "marta", ru: "раз" })}` : t(ACCESS_SHORT[s.access])}</span>
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Situations() {
  const { t } = useLang();
  return (
    <section aria-labelledby="pp-sit" className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="pp-sit" className="m-0 text-2xl font-extrabold tracking-[-0.03em]">{t({ uz: "Hayotiy vaziyatlar", ru: "Жизненные ситуации" })}</h2>
        <Link to="/situations" className="text-sm font-semibold">{t({ uz: "Hammasi →", ru: "Все →" })}</Link>
      </div>
      <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        {SITUATIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.slug} to={`/situations/${s.slug}`} className={`${cardLink} flex items-start gap-3 p-4`}>
              <span aria-hidden="true" className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[var(--p50)] text-[var(--p800)]"><Icon className="h-5 w-5" strokeWidth={1.9} /></span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-[15px] font-bold leading-tight">{t(s.title)}</span>
                <span className="line-clamp-2 text-[13px] leading-snug text-[var(--pp-muted)]">{t(s.description)}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function HelpBlock() {
  const { t } = useLang();
  const row = "flex h-[46px] items-center rounded-[14px] px-4 text-[15px] font-semibold text-white hover:no-underline";
  return (
    <section className="pp-fu flex flex-col justify-between gap-4 rounded-[28px] bg-[#1b2530] p-6 text-white sm:flex-row sm:items-center">
      <div className="flex max-w-xl flex-col gap-1.5">
        <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.02em]">{t({ uz: "Kerakli xizmatni topa olmadingizmi?", ru: "Не нашли нужную услугу?" })}</h2>
        <span className="text-sm text-[#c3ccd4]">{t({ uz: "Savolingizni oddiy tilda yozing yoki mutaxassis bilan bog'laning.", ru: "Напишите вопрос простыми словами или свяжитесь со специалистом." })}</span>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-[340px]">
        <button type="button" onClick={() => window.dispatchEvent(new Event("open-global-search"))} className={`${row} justify-between bg-white/10 text-left hover:bg-white/15`}>
          <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" aria-hidden="true" />{t({ uz: "Qidiruv va yordamchi", ru: "Поиск и помощник" })}</span>
          <span className="mono rounded-md border border-white/30 px-1.5 py-0.5 text-xs">Ctrl K</span>
        </button>
        <Link to="/consultation" className={`${row} bg-white/10 hover:bg-white/15`}>{t({ uz: "Mutaxassis konsultatsiyasi →", ru: "Консультация специалиста →" })}</Link>
        <Link to="/contact" className={`${row} bg-[var(--btn)] hover:brightness-110`}>{t({ uz: "Murojaat yuborish →", ru: "Отправить обращение →" })}</Link>
      </div>
    </section>
  );
}

export default function HomePassport() {
  const { t } = useLang();
  const { items: stats, isSample } = useServiceStats();
  useEffect(() => {
    document.title = `my.stat.uz — ${t(UI.portalLine2)}`;
  }, [t]);

  const top = useMemo(() => {
    const live = POPULAR.filter((s) => s.status === "live");
    return [...live].sort((a, b) => (stats[b.number]?.usage ?? 0) - (stats[a.number]?.usage ?? 0) || a.popularOrder! - b.popularOrder!).slice(0, 8);
  }, [stats]);

  return (
    <div className="flex flex-col gap-6 px-4 pb-7 pt-5 sm:px-6">
      <Hero featured={top.slice(0, 6)} stats={stats} isSample={isSample} />
      <TopServices items={top} stats={stats} isSample={isSample} />
      <AllServices stats={stats} />
      <Situations />
      <HelpBlock />
    </div>
  );
}
