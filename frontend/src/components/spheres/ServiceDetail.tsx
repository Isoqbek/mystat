import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, Share2, UserCheck } from "lucide-react";
import { CONTACT, servicesOfSphere, type ServiceCatalogItem } from "../../config/serviceCatalog";
import type { Sphere } from "../../config/spheres";
import { translate, useLang, type I18nText } from "../../i18n/LangContext";
import { UI } from "../../i18n/ui";
import { useAuth } from "../../contexts/AuthContext";
import { loginUrl } from "../../utils/loginRedirect";
import { fetchServiceStats, recordServiceUse, type ServiceStats } from "../../api/portal";
import FavoriteServiceButton from "../catalog/FavoriteServiceButton";
import { Ratings, Stars, UsageStats } from "../service/ServiceFeedback";
import { ACCESS_TEXT, AUDIENCE_TEXT, actionLabel } from "./n2Adapter";
import "../../theme/spheres-n2.css";

type TabId = "how" | "docs" | "contact" | "stats";
const TABS: [TabId, I18nText][] = [
  ["how", { uz: "Qanday ishlaydi", ru: "Как это работает" }],
  ["docs", { uz: "Hujjatlar va huquqiy asos", ru: "Документы и правовое основание" }],
  ["contact", { uz: "Aloqa", ru: "Контакты" }],
  ["stats", { uz: "Statistika va baholar", ru: "Статистика и оценки" }],
];
const NO_DOCS_UZ = "Talab etilmaydi";

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2"><b className="text-[14.5px]">{title}</b>{children}</div>
);

/**
 * N2 Level 2: xizmat tafsiloti — gradient hero (ikonka, nom, tavsif, vaqt, foydalanish soni, baho, harakatlar) va 4 tab.
 * Barcha matn va raqamlar loyihadagi haqiqiy ma'lumotdan (katalog + `api/portal`). Asosiy tugma mavjud xatti-harakatni
 * saqlaydi (`recordServiceUse` + ishchi sahifaga o'tish, kirish kerak bo'lsa login), ServicePage dagi mantiq bilan bir xil.
 */
export default function ServiceDetail({ sphere, s }: { sphere: Sphere; s: ServiceCatalogItem }) {
  const { t } = useLang();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("how");
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement | null>>>({});

  useEffect(() => {
    let alive = true;
    fetchServiceStats(s.number).then((d) => alive && setStats(d)).catch(() => alive && setStats(null));
    return () => {
      alive = false;
    };
  }, [s.number, tick]);

  const Icon = s.icon;
  const soon = s.status === "soon";
  const needsLogin = !isAuthenticated && (s.access === "login" || s.route.startsWith("/cabinet"));
  const start = () => {
    void recordServiceUse(s.number);
    navigate(needsLogin ? loginUrl(s.route) : s.route);
  };
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: t(s.title), url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* foydalanuvchi bekor qildi */
    }
  };

  const onTabKey = (e: KeyboardEvent, i: number) => {
    const to = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
    if (to === null) return;
    e.preventDefault();
    const next = TABS[(to + TABS.length) % TABS.length][0];
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  const siblings = servicesOfSphere(sphere.id).filter((x) => x.number !== s.number).slice(0, 8);
  const noDocs = translate(s.requiredDocs, "uz") === NO_DOCS_UZ;
  const chip = "flex h-8 items-center rounded-full bg-[var(--p50)] px-3.5 text-sm font-semibold text-[var(--p800)]";
  const metricIcon = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20";

  return (
    <div className="sn2-in flex flex-col">
      <section className="sn2-hero flex flex-col gap-[18px] px-7 pb-6 pt-[26px]">
        <div className="flex items-start gap-4">
          <Icon className="h-11 w-11 shrink-0" strokeWidth={1.8} aria-hidden="true" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-[13px] text-white/80">{t(sphere.title)}</span>
            <h2 className="m-0 text-[30px] font-extrabold leading-[1.15] tracking-[-0.02em]">{t(s.title)}</h2>
            <p className="m-0 mt-0.5 text-[15.5px] leading-normal text-white/90">{t(s.description)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <span className="flex items-center gap-2.5">
            <span className={metricIcon}><Clock className="h-[22px] w-[22px]" aria-hidden="true" /></span>
            <span className="flex flex-col"><b className="text-base">{soon ? t({ uz: "Tez orada", ru: "Скоро" }) : t(s.duration)}</b><span className="text-[12.5px] text-white/85">{t({ uz: "Bajarish vaqti", ru: "Время выполнения" })}</span></span>
          </span>
          <span className="flex items-center gap-2.5">
            <span className={metricIcon}><UserCheck className="h-[22px] w-[22px]" aria-hidden="true" /></span>
            <span className="flex flex-col"><b className="text-base">{stats ? stats.usage_total.toLocaleString("ru-RU") : "—"}</b><span className="text-[12.5px] text-white/85">{t({ uz: "marotaba foydalanilgan", ru: "раз использовано" })}</span></span>
          </span>
        </div>

        {stats?.rating_avg != null && (
          <span className="flex h-10 flex-wrap items-center gap-2 self-start rounded-[10px] bg-white/20 px-3.5 text-[14.5px]">
            <Stars value={stats.rating_avg} size="h-4 w-4" />
            <span>{stats.rating_avg.toFixed(2)} ({stats.rating_count} {t({ uz: "baho", ru: "оценок" })})</span>
            {stats.is_sample && <span className="rounded-md bg-white/25 px-2 py-0.5 text-[11.5px]">{t(UI.sample)}</span>}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          {soon ? (
            <span className="flex h-[52px] items-center rounded-[14px] bg-white/20 px-5 text-[15px]">{t({ uz: "Tez orada ishga tushadi", ru: "Скоро будет доступно" })}</span>
          ) : (
            <button type="button" onClick={start}
              className="flex h-[52px] items-center gap-2 rounded-[14px] border-0 bg-[#2f855a] px-[26px] text-[16.5px] font-bold text-white shadow-[0_8px_18px_-8px_rgba(0,0,0,0.5)] hover:brightness-110">
              {t(actionLabel(s))} <span aria-hidden="true">→</span>
            </button>
          )}
          <FavoriteServiceButton number={s.number} title={t(s.title)} variant="button" buttonClass="h-[52px] gap-2 rounded-[14px] px-5 text-[15.5px]" />
          <button type="button" onClick={share} aria-label={t({ uz: "Ulashish", ru: "Поделиться" })}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border-0 bg-white text-[#1b2530] hover:bg-slate-50">
            <Share2 className="h-5 w-5" aria-hidden="true" />
          </button>
          {copied && <span className="text-sm" role="status">{t({ uz: "Havola nusxalandi", ru: "Ссылка скопирована" })}</span>}
        </div>

        {!soon && s.access !== "open" && (
          <span className="-mt-1.5 text-sm text-white/90">
            {needsLogin
              ? t({ uz: "Xizmatdan foydalanish uchun tizimga kirasiz, keyin shu xizmatga qaytasiz.", ru: "Для использования услуги нужно войти, после входа вы вернётесь к услуге." })
              : t(ACCESS_TEXT[s.access])}
          </span>
        )}
      </section>

      <div className="flex flex-col gap-[18px] px-7 pb-[30px] pt-[22px]">
        <div role="tablist" aria-label={t({ uz: "Xizmat haqida", ru: "Об услуге" })} className="sn2-hscroll flex gap-1 overflow-x-auto border-b border-[var(--sn-line)]">
          {TABS.map(([id, label], i) => {
            const on = tab === id;
            return (
              <button key={id} ref={(el) => { tabRefs.current[id] = el; }} type="button" role="tab" id={`sn2-tab-${id}`}
                aria-selected={on} aria-controls={`sn2-panel-${id}`} tabIndex={on ? 0 : -1}
                onClick={() => setTab(id)} onKeyDown={(e) => onTabKey(e, i)}
                className={`-mb-px h-11 shrink-0 whitespace-nowrap border-0 border-b-[3px] border-solid bg-transparent px-4 text-[15px] ${on
                  ? "border-b-[var(--btn)] font-bold text-[var(--p800)]" : "border-b-transparent font-medium text-[var(--sn-muted)]"}`}>
                {t(label)}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`sn2-panel-${tab}`} aria-labelledby={`sn2-tab-${tab}`} key={tab} className="sn2-in flex flex-col gap-4">
          {tab === "how" && (
            <>
              <Block title={t({ uz: "Xizmat narxi", ru: "Стоимость услуги" })}>
                <div className="flex flex-col gap-1 rounded-[14px] border border-[var(--sn-line)] bg-[var(--sn-card)] px-3.5 py-3">
                  <span className="text-lg font-bold leading-snug">{t(s.price)}</span>
                  {s.access === "package" && <span className="text-[13px] text-[var(--sn-muted)]">{t({ uz: "Tarif paketi limitidan yechiladi", ru: "Списывается с лимита тарифного пакета" })}</span>}
                </div>
              </Block>
              <ol className="m-0 grid list-none gap-2.5 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr))]" aria-label={t({ uz: "Qanday ishlaydi", ru: "Как это работает" })}>
                {s.howItWorks.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-[14px] border border-[var(--sn-line)] bg-[var(--sn-soft)] p-3">
                    <b className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--btn)] text-[13px] text-white">{i + 1}</b>
                    <span className="text-sm leading-[1.4]">{t(step)}</span>
                  </li>
                ))}
              </ol>
              <Block title={t({ uz: "Xizmat foydalanuvchilari", ru: "Получатели услуги" })}>
                <div className="flex flex-wrap gap-2">
                  <span className={chip}>{t(AUDIENCE_TEXT[s.users])}</span>
                  <span className={chip}>{t(ACCESS_TEXT[s.access])}</span>
                </div>
              </Block>
              {siblings.length > 0 && (
                <div className="border-t border-[var(--sn-line)] pt-3.5">
                  <Block title={t({ uz: "Shu sohada yana", ru: "Ещё в этой сфере" })}>
                    <div className="flex flex-wrap gap-2">
                      {siblings.map((x) => (
                        <Link key={x.number} to={`/spheres/${sphere.id}/${x.number}`}
                          className="sn2-pill inline-flex h-[38px] items-center rounded-full border border-[var(--sn-line)] bg-[var(--sn-card)] px-3.5 text-sm text-[var(--pp-text)] hover:no-underline">
                          {t(x.title)}
                        </Link>
                      ))}
                    </div>
                  </Block>
                </div>
              )}
            </>
          )}

          {tab === "docs" && (
            <>
              <Block title={t({ uz: "Xizmatni olish uchun kerakli hujjatlar", ru: "Необходимые документы" })}>
                {noDocs
                  ? <span className="text-[14.5px] text-[var(--sn-muted)]">{t({ uz: "Hujjat talab qilinmaydi.", ru: "Документы не требуются." })}</span>
                  : (
                    <div className="flex items-center gap-2.5 rounded-xl border border-[var(--sn-line)] bg-[var(--sn-soft)] px-3.5 py-3 text-[14.5px]">
                      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--p50)] text-[13px] text-[var(--p800)]" aria-hidden="true">✓</span>
                      {t(s.requiredDocs)}
                    </div>
                  )}
              </Block>
              <Block title={t({ uz: "Xizmat ko'rsatishning huquqiy asosi", ru: "Правовое основание" })}>
                <p className="m-0 text-[14.5px] leading-[1.55]">{t(s.legalBasis)}</p>
              </Block>
              <Block title={t({ uz: "Mas'ul tashkilot", ru: "Ответственная организация" })}>
                <p className="m-0 text-[14.5px] leading-[1.55]">{t(s.unit)}</p>
              </Block>
            </>
          )}

          {tab === "contact" && (
            <div className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))]">
              <span className="flex flex-col gap-0.5 rounded-[14px] border border-[var(--sn-line)] bg-[var(--sn-soft)] p-3.5">
                <span className="text-xs text-[var(--sn-muted)]">{t({ uz: "Telefon", ru: "Телефон" })}</span>
                <a href={CONTACT.phoneHref} className="text-[15px] font-bold text-[var(--pp-text)]">{CONTACT.phone}</a>
              </span>
              <span className="flex flex-col gap-0.5 rounded-[14px] border border-[var(--sn-line)] bg-[var(--sn-soft)] p-3.5">
                <span className="text-xs text-[var(--sn-muted)]">{t({ uz: "E-pochta", ru: "Эл. почта" })}</span>
                <a href={`mailto:${CONTACT.email}`} className="text-[15px] font-bold text-[var(--pp-text)]">{CONTACT.email}</a>
              </span>
            </div>
          )}

          {tab === "stats" && (
            <>
              <UsageStats number={s.number} />
              <Ratings number={s.number} stats={stats} onRated={() => setTick((n) => n + 1)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
