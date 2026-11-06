import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  BarChart3, Building2, ChevronDown, ChevronRight, Clock, CreditCard, FileText, ListOrdered, MessageSquareText,
  Phone, Scale, Share2, Star, UserCheck, Users,
} from "lucide-react";
import { CONTACT, serviceByNumber, type Access, type Audience } from "../../config/serviceCatalog";
import { sphereById } from "../../config/spheres";
import { useLang, type I18nText } from "../../i18n/LangContext";
import { UI } from "../../i18n/ui";
import { useAuth } from "../../contexts/AuthContext";
import { loginUrl } from "../../utils/loginRedirect";
import {
  fetchServiceStats, recordServiceUse, type ServiceStats,
} from "../../api/portal";
import FavoriteServiceButton from "../../components/catalog/FavoriteServiceButton";
import { Ratings, Stars, UsageStats } from "../../components/service/ServiceFeedback";

const USERS: Record<Audience, I18nText> = {
  all: { uz: "Jismoniy va yuridik shaxslar", ru: "Физические и юридические лица" },
  legal: { uz: "Yuridik shaxslar", ru: "Юридические лица" },
  individual: { uz: "Jismoniy shaxslar", ru: "Физические лица" },
};
const ACCESS: Record<Access, I18nText> = {
  open: { uz: "Ro'yxatdan o'tmasdan foydalanish mumkin", ru: "Доступно без регистрации" },
  login: { uz: "Tizimga kirish talab qilinadi", ru: "Требуется вход в систему" },
  package: { uz: "Tarif paketi bo'yicha (limitdan yechiladi)", ru: "По тарифному пакету (списывается с лимита)" },
  priced: { uz: "Alohida narx bo'yicha", ru: "По отдельной цене" },
  credits: { uz: "Asosiy qismi bepul, batafsil tahlil pullik (hamyondan)", ru: "Основная часть бесплатно, подробный анализ — платно (из кошелька)" },
};

/** Ikonkali yig'iladigan bo'lim (my.gov.uz xizmat sahifasidagi kabi). */
function InfoSection({ icon: Icon, title, subtitle, children, wide }: {
  icon: typeof Star; title: string; subtitle?: string; children: ReactNode; wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-mg bg-mg-info ${wide ? "md:col-span-2" : ""}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        className="flex w-full items-center gap-4 px-6 py-5 text-left">
        <Icon className="h-6 w-6 shrink-0 text-mg-primary-light" aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-base font-semibold text-black dark:text-white">{title}</span>
          {subtitle && <span className="block text-sm text-mg-text">{subtitle}</span>}
        </span>
        <ChevronDown className={`h-5 w-5 text-mg-primary-light transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && <div className="px-6 pb-5 pl-16 text-[15px] leading-relaxed text-mg-text">{children}</div>}
    </div>
  );
}

/**
 * MG-07: xizmat pasporti `/service/:number` — MG-00 dagi my.gov.uz tuzilishi: ko'k hero (ikonka, nom, bajarish vaqti,
 * foydalanish soni, reyting, asosiy tugma, "Tanlanganlarga qo'shish", ulashish) → ikonkali yig'iladigan bo'limlar
 * (2 ustun) → "Umumiy statistika" → "Baho va sharhlar". Asosiy tugma mavjud ishchi sahifaga olib boradi.
 */
export default function ServicePage() {
  const { number } = useParams();
  const { t } = useLang();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const s = serviceByNumber(Number(number));
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [statsTick, setStatsTick] = useState(0);

  useEffect(() => {
    if (!s) return;
    document.title = `#${s.number} ${t(s.title)} — my.stat.uz`;
    const meta = document.querySelector('meta[name="description"]');
    meta?.setAttribute("content", t(s.description));
  }, [s, t]);

  useEffect(() => {
    if (!s) return;
    let alive = true;
    fetchServiceStats(s.number).then((d) => alive && setStats(d)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [s, statsTick]);

  if (!s || s.status !== "live") return <Navigate to="/spheres" replace />;
  const sphere = sphereById(s.sphere)!;
  const Icon = s.icon;
  // Paketli/pullik xizmatlarning ochiq qismi ham bor (qisqa bozor tahlili, hamkor qidiruvi) — login faqat shart bo'lsa
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

  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li><Link to="/" className="text-mg-primary hover:underline">{t(UI.home)}</Link></li>
          <li className="flex items-center gap-2"><ChevronRight className="h-4 w-4" aria-hidden="true" /><Link to="/spheres" className="text-mg-primary hover:underline">{t(UI.spheres)}</Link></li>
          <li className="flex items-center gap-2"><ChevronRight className="h-4 w-4" aria-hidden="true" /><Link to={`/spheres/${sphere.id}`} className="text-mg-primary hover:underline">{t(sphere.title)}</Link></li>
          <li className="flex items-center gap-2"><ChevronRight className="h-4 w-4" aria-hidden="true" /><span aria-current="page">#{s.number}</span></li>
        </ol>
      </nav>

      <div className="overflow-hidden rounded-mg border border-mg-border">
        <section className="bg-mg-primary px-6 py-8 text-white md:px-8 dark:bg-blue-900">
          <div className="flex items-start gap-4">
            <Icon className="h-11 w-11 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p className="text-sm text-white/80">#{s.number}</p>
              <h1 className="text-xl font-bold leading-snug md:text-2xl">{t(s.title)}</h1>
              <p className="mt-2 max-w-3xl text-[15px] text-white/90">{t(s.description)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/20"><Clock className="h-5 w-5" aria-hidden="true" /></span>
              <span className="leading-tight"><span className="block font-bold">{t(s.duration)}</span><span className="text-xs">{t({ uz: "Bajarish vaqti", ru: "Время выполнения" })}</span></span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/20"><UserCheck className="h-5 w-5" aria-hidden="true" /></span>
              <span className="leading-tight">
                <span className="block font-bold">{stats ? stats.usage_total.toLocaleString("ru-RU") : "—"}</span>
                <span className="text-xs">{t({ uz: "marotaba foydalanilgan", ru: "раз использовано" })}</span>
              </span>
            </div>
          </div>
          {stats?.rating_avg != null && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-white/25 px-3 py-2 text-sm">
              <Stars value={stats.rating_avg} />
              {stats.rating_avg.toFixed(2)} ({stats.rating_count} {t({ uz: "baho", ru: "оценок" })})
              {stats.is_sample && <span className="rounded bg-white/30 px-1.5 text-xs">{t(UI.sample)}</span>}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={start}
              className="h-[42px] rounded-mg bg-mg-success px-6 text-sm font-semibold text-white shadow-[0_13px_27px_rgba(0,0,0,0.08)] hover:brightness-110">
              {s.actionType === "apply" ? t({ uz: "Ariza yuborish", ru: "Подать заявку" }) : t({ uz: "Xizmatdan foydalanish", ru: "Воспользоваться услугой" })}
            </button>
            <FavoriteServiceButton number={s.number} title={t(s.title)} variant="button" />
            <button type="button" onClick={share} aria-label={t({ uz: "Ulashish", ru: "Поделиться" })}
              className="flex h-[42px] w-[62px] items-center justify-center rounded-mg bg-white text-black hover:bg-slate-50">
              <Share2 className="h-5 w-5" aria-hidden="true" />
            </button>
            {copied && <span className="text-sm">{t({ uz: "Havola nusxalandi", ru: "Ссылка скопирована" })}</span>}
          </div>
          {s.access !== "open" && (
            <p className="mt-4 text-sm text-white/90">
              {needsLogin ? t({ uz: "Xizmatdan foydalanish uchun tizimga kirasiz, keyin shu xizmatga qaytasiz.", ru: "Для использования услуги нужно войти, после входа вы вернётесь к услуге." }) : t(ACCESS[s.access])}
            </p>
          )}
        </section>

        <section className="bg-[#F9FBFE] px-6 py-8 md:px-8 dark:bg-gray-900">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoSection icon={CreditCard} title={t({ uz: "Xizmat narxi", ru: "Стоимость услуги" })}>{t(s.price)}</InfoSection>
            <InfoSection icon={Users} title={t({ uz: "Xizmat foydalanuvchilari", ru: "Получатели услуги" })}>
              {t(USERS[s.users])}. {t(ACCESS[s.access])}.
            </InfoSection>
            <InfoSection icon={Scale} title={t({ uz: "Xizmat ko'rsatishning huquqiy asosi", ru: "Правовое основание" })}>{t(s.legalBasis)}</InfoSection>
            <InfoSection icon={Phone} title={t({ uz: "Aloqa", ru: "Контакты" })}>
              <a href={CONTACT.phoneHref} className="font-semibold text-mg-primary">{CONTACT.phone}</a> ·{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-mg-primary">{CONTACT.email}</a>
            </InfoSection>
            <InfoSection icon={Clock} title={t({ uz: "Xizmat ko'rsatish muddati", ru: "Срок оказания услуги" })}>{t(s.duration)}</InfoSection>
            <InfoSection icon={Building2} title={t({ uz: "Mas'ul tashkilot", ru: "Ответственная организация" })}>{t(s.unit)}</InfoSection>
            <InfoSection icon={FileText} title={t({ uz: "Xizmatni olish uchun kerakli hujjatlar", ru: "Необходимые документы" })}>{t(s.requiredDocs)}</InfoSection>
            <InfoSection icon={ListOrdered} title={t({ uz: "Bu qanday ishlaydi?", ru: "Как это работает?" })}>
              <ol className="list-decimal space-y-1 pl-5">{s.howItWorks.map((step, i) => <li key={i}>{t(step)}</li>)}</ol>
            </InfoSection>
            <InfoSection wide icon={BarChart3} title={t({ uz: "Umumiy statistika", ru: "Общая статистика" })}
              subtitle={t({ uz: "Xizmat bo'yicha umumiy ma'lumotlar", ru: "Общие сведения по услуге" })}>
              <UsageStats number={s.number} />
            </InfoSection>
          </div>

          <Ratings number={s.number} stats={stats} onRated={() => setStatsTick((n) => n + 1)} />

          <p className="mt-8 flex items-center gap-2 text-sm text-mg-muted">
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            <Link to={`/spheres/${sphere.id}`} className="text-mg-primary hover:underline">{t(sphere.title)}</Link>
            {" — "}{t({ uz: "sohadagi boshqa xizmatlar", ru: "другие услуги сферы" })}
          </p>
        </section>
      </div>
    </div>
  );
}
