import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useLang, type I18nText } from "../../i18n/LangContext";
import { UI } from "../../i18n/ui";
import { useAuth } from "../../contexts/AuthContext";
import { loginUrl } from "../../utils/loginRedirect";
import { fetchReviews, fetchServiceStats, postReview, voteReview, type Review, type ReviewsResponse, type ServiceStats } from "../../api/portal";
import DemoBadge from "../ui/DemoBadge";

/**
 * Xizmat bahosi, sharhlar va foydalanish statistikasi (haqiqiy API: `api/portal`). ServicePage (`/service/:number`)
 * dan o'zgartirishsiz ko'chirilgan, endi N2 tafsilotida (`/spheres/:id/:number`) ham ishlatiladi.
 */
export function Stars({ value, size = "h-5 w-5" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex" aria-label={`${value.toFixed(2)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i + 1));
        return (
          <span key={i} className={`relative ${size}`}>
            <Star className={`absolute inset-0 ${size} text-slate-300`} aria-hidden="true" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} fill-amber-400 text-amber-400`} aria-hidden="true" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function timeAgo(iso: string, lang: string) {
  const min = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  const ru = lang === "ru";
  if (min < 60) return ru ? `${min} мин назад` : `${min} daqiqa oldin`;
  const h = Math.round(min / 60);
  if (h < 24) return ru ? `${h} ч назад` : `${h} soat oldin`;
  const d = Math.round(h / 24);
  if (d < 31) return ru ? `${d} дн назад` : `${d} kun oldin`;
  return new Date(iso).toLocaleDateString(ru ? "ru-RU" : "uz-UZ");
}


/** Sharh ostidagi "Foydali / Foydasiz" (my.gov.uz dagi kabi). Mehmon bosganda login'ga yuboriladi. */
function ReviewVotes({ review }: { review: Review }) {
  const { t } = useLang();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ helpful: review.helpful, unhelpful: review.unhelpful, my_vote: review.my_vote });
  if (review.is_mine) return null;
  const vote = async (helpful: boolean) => {
    if (!isAuthenticated) {
      navigate(loginUrl());
      return;
    }
    try {
      setState(await voteReview(review.id, helpful));
    } catch {
      /* tarmoq xatosi — holat o'zgarmaydi */
    }
  };
  const btn = (on: boolean) => `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ${on ? "bg-mg-primary text-white" : "bg-slate-200/70 text-mg-text dark:bg-gray-700"}`;
  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-mg-muted">{t({ uz: "Sharh sizga foydali bo'ldimi?", ru: "Был ли отзыв полезен?" })}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" className={btn(state.my_vote === true)} aria-pressed={state.my_vote === true} onClick={() => vote(true)}>
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />{t({ uz: "Foydali", ru: "Полезно" })} ({state.helpful})
        </button>
        <button type="button" className={btn(state.my_vote === false)} aria-pressed={state.my_vote === false} onClick={() => vote(false)}>
          <ThumbsDown className="h-4 w-4" aria-hidden="true" />{t({ uz: "Foydasiz", ru: "Бесполезно" })} ({state.unhelpful})
        </button>
      </div>
    </div>
  );
}

export function UsageStats({ number }: { number: number }) {
  const { t } = useLang();
  const [period, setPeriod] = useState("all");
  const [data, setData] = useState<ServiceStats | null>(null);
  useEffect(() => {
    let alive = true;
    fetchServiceStats(number, period).then((d) => alive && setData(d)).catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, [number, period]);
  if (!data) return <p className="text-sm text-mg-muted">—</p>;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {([["all", { uz: "Barcha", ru: "Все" }], ["year", { uz: "Yil", ru: "Год" }], ["month", { uz: "Oy", ru: "Месяц" }]] as [string, I18nText][]).map(([p, label]) => (
          <button key={p} type="button" onClick={() => setPeriod(p)} aria-pressed={period === p}
            className={`rounded-mg border px-3 py-1 text-sm ${period === p ? "border-mg-primary bg-mg-primary text-white" : "border-mg-primary bg-mg-surface"}`}>
            {t(label)}
          </button>
        ))}
        <DemoBadge show={data.is_sample} />
      </div>
      <p>
        <span className="text-2xl font-bold text-mg-heading">{data.usage_count.toLocaleString("ru-RU")}</span>{" "}
        {t({ uz: "marta foydalanilgan", ru: "использований" })}
        {data.since && period === "all" && <span className="text-sm text-mg-muted"> · {t({ uz: "xizmat ishga tushirilganidan beri", ru: "с момента запуска услуги" })} ({data.since})</span>}
      </p>
      {data.monthly.length > 1 && (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthly} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(m: string) => m.slice(5)} />
              <Tooltip formatter={(v: number) => [v, t({ uz: "Foydalanish", ru: "Использования" })]} />
              <Bar dataKey="count" fill="#1D5FBF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function Ratings({ number, stats, onRated }: { number: number; stats: ServiceStats | null; onRated: () => void }) {
  const { t, lang } = useLang();
  const { isAuthenticated } = useAuth();
  const [ordering, setOrdering] = useState("recent");
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    fetchReviews(number, ordering, 10).then((d) => {
      if (!alive) return;
      setData(d);
      if (d.my_review) {
        setScore(d.my_review.score);
        setComment(d.my_review.comment);
      }
    }).catch(() => alive && setData(null));
    return () => {
      alive = false;
    };
  }, [number, ordering, reload]);

  const total = stats?.rating_count ?? 0;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score) return;
    try {
      const r = await postReview(number, score, comment.trim());
      setMsg(r.moderation
        ? t({ uz: "Rahmat! Bahoyingiz hisobga olindi, sharh moderatsiyadan keyin ko'rinadi.", ru: "Спасибо! Оценка учтена, отзыв появится после модерации." })
        : t({ uz: "Rahmat! Bahoyingiz hisobga olindi.", ru: "Спасибо! Оценка учтена." }));
      setReload((n) => n + 1);
      onRated();
    } catch {
      setMsg(t({ uz: "Yuborib bo'lmadi, keyinroq urinib ko'ring.", ru: "Не удалось отправить, попробуйте позже." }));
    }
  };

  return (
    <section aria-labelledby="ratings-title" className="mt-8">
      <div className="flex flex-wrap items-center gap-4">
        <h2 id="ratings-title" className="text-[28px] text-black dark:text-white">{t({ uz: "Baho va sharhlar", ru: "Оценки и отзывы" })}</h2>
        <label className="sr-only" htmlFor="review-order">{t({ uz: "Saralash", ru: "Сортировка" })}</label>
        <select id="review-order" value={ordering} onChange={(e) => setOrdering(e.target.value)}
          className="rounded-full border-0 bg-mg-info px-4 py-2 text-sm font-semibold text-mg-primary">
          <option value="recent">{t({ uz: "Yaqinda qo'shilgan", ru: "Недавно добавленные" })}</option>
          <option value="high">{t({ uz: "Avval yuqori baho", ru: "Сначала высокие" })}</option>
          <option value="low">{t({ uz: "Avval past baho", ru: "Сначала низкие" })}</option>
        </select>
        <DemoBadge show={!!stats?.is_sample} />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[200px_1fr]">
        <div>
          <p className="text-[40px] font-bold leading-none text-black dark:text-white">{stats?.rating_avg?.toFixed(2) ?? "—"}</p>
          <div className="mt-2"><Stars value={stats?.rating_avg ?? 0} size="h-8 w-8" /></div>
          <p className="mt-3 text-sm font-semibold text-mg-muted">{t({ uz: "Baholashdi", ru: "Оценили" })}: {total}</p>
          <p className="mt-1 text-sm font-semibold text-mg-muted">{t({ uz: "Sharhlar soni", ru: "Количество отзывов" })}: {stats?.comment_count ?? 0}</p>
        </div>
        <ul className="max-w-xl space-y-1.5" aria-label={t({ uz: "Baholar taqsimoti", ru: "Распределение оценок" })}>
          {[5, 4, 3, 2, 1].map((n) => {
            const c = stats?.distribution[String(n) as "1"] ?? 0;
            return (
              <li key={n} className="flex items-center gap-3">
                <span className="w-3 text-sm font-semibold">{n}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
                  <span className="block h-full rounded-full bg-amber-400" style={{ width: total ? `${(100 * c) / total}%` : 0 }} />
                </span>
                <span className="sr-only">{c}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 max-w-3xl rounded-mg bg-mg-surface p-5">
        {isAuthenticated ? (
          <form onSubmit={submit} className="space-y-3">
            <p className="font-semibold text-mg-heading">{data?.my_review ? t({ uz: "Bahoyingizni o'zgartirish", ru: "Изменить оценку" }) : t({ uz: "Xizmatni baholang", ru: "Оцените услугу" })}</p>
            <div className="flex gap-1" role="radiogroup" aria-label={t({ uz: "Baho", ru: "Оценка" })}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" role="radio" aria-checked={score === i} aria-label={`${i}`} onClick={() => setScore(i)}>
                  <Star className={`h-8 w-8 ${i <= score ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} aria-hidden="true" />
                </button>
              ))}
            </div>
            <label htmlFor="review-comment" className="sr-only">{t({ uz: "Sharh", ru: "Отзыв" })}</label>
            <textarea id="review-comment" rows={3} maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder={t({ uz: "Sharh (ixtiyoriy)", ru: "Отзыв (необязательно)" })}
              className="w-full rounded-[10px] border border-mg-border bg-mg-surface p-3 text-sm" />
            <button type="submit" disabled={!score} className="rounded-mg bg-mg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50">
              {t({ uz: "Yuborish", ru: "Отправить" })}
            </button>
            {msg && <p className="text-sm text-mg-success">{msg}</p>}
          </form>
        ) : (
          <p className="text-sm text-mg-text">
            <Link to={loginUrl()} className="font-semibold text-mg-primary hover:underline">{t(UI.login)}</Link>
            {" — "}{t({ uz: "xizmatni baholash uchun tizimga kiring.", ru: "чтобы оценить услугу." })}
          </p>
        )}
      </div>

      <ul className="mt-6 max-w-3xl divide-y divide-mg-border">
        {data?.results.map((r) => (
          <li key={r.id} className="py-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mg-info text-sm font-semibold text-mg-muted">{r.author[0]}</span>
              <span className="text-sm font-semibold uppercase text-black dark:text-white">{r.author}</span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <Stars value={r.score} />
              <span className="text-sm text-mg-muted">{timeAgo(r.created_at, lang)}</span>
            </div>
            {r.comment && <p className="mt-2 text-[15px] text-mg-text">{r.comment}</p>}
            <ReviewVotes review={r} />
          </li>
        ))}
        {data && data.results.length === 0 && <li className="py-5 text-sm text-mg-muted">{t({ uz: "Hozircha sharhlar yo'q.", ru: "Пока нет отзывов." })}</li>}
      </ul>
    </section>
  );
}
