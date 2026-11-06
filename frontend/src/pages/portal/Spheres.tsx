import { lazy, Suspense, useEffect, useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { servicesOfSphere, serviceByNumber } from "../../config/serviceCatalog";
import { sphereById } from "../../config/spheres";
import { useLang } from "../../i18n/LangContext";
import { UI } from "../../i18n/ui";
import { useServiceStats } from "../../components/catalog/useServiceStats";
import SpheresOverview from "../../components/spheres/SpheresOverview";

// Sohaga xos qo'shimcha bloklar (MYGOV_DIZAYN 0.4: 1-etap komponentlari shu sohalarga ko'chdi)
const TariffComponent = lazy(() => import("../../components/TariffComponent"));
const CalendarReport = lazy(() => import("../../components/CalendarReport"));

function FilterPanel({ params, setParams }: { params: URLSearchParams; setParams: (p: URLSearchParams) => void }) {
  const { t } = useLang();
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };
  const group = (key: string, title: string, options: [string, string][]) => (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-mg-heading">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([value, label]) => {
          const on = (params.get(key) ?? "") === value;
          return (
            <button key={value} type="button" onClick={() => set(key, value)} aria-pressed={on}
              className={`rounded-mg border px-4 py-1.5 text-sm ${on ? "border-mg-primary bg-mg-primary text-white" : "border-mg-primary bg-mg-surface text-mg-text"}`}>
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
  return (
    <div className="grid gap-4 rounded-mg bg-mg-surface p-5 sm:grid-cols-2">
      {group("user", t(UI.userType), [["", t(UI.everyone)], ["individual", t(UI.individual)], ["legal", t(UI.legal)]])}
      {group("price", t(UI.priceFilter), [["", t(UI.everyone)], ["free", t(UI.free)], ["paid", t(UI.paid)]])}
    </div>
  );
}

/**
 * `/spheres` va `/spheres/:id` — N2 dizayni (docs/design). Mantiq avvalgidek: filtrlar URL'da (`?user=&price=&q=&sub=`),
 * noto'g'ri soha id bo'lsa `/spheres` ga yo'naltiriladi, soha sahifasida tarif/hisobot bloklari saqlanadi.
 * Ko'rinish `components/spheres/` da.
 */
export default function Spheres() {
  const { id, number } = useParams();
  const { t } = useLang();
  const [params, setParams] = useSearchParams();
  const { items: stats, isSample } = useServiceStats();
  const [advanced, setAdvanced] = useState(() => params.has("user") || params.has("price"));
  const sphere = id ? sphereById(Number(id)) : undefined;
  const q = params.get("q") ?? "";
  // Level 2: `/spheres/:id/:number` — xizmat shu sohada (o'z xizmati yoki `alsoIn`) bo'lishi shart
  const service = number ? serviceByNumber(Number(number)) : undefined;
  const serviceInSphere = !!(sphere && service && servicesOfSphere(sphere.id).some((x) => x.number === service.number));

  useEffect(() => {
    const page = service && serviceInSphere ? t(service.title) : sphere ? t(sphere.title) : t(UI.allServices);
    document.title = `${page} — my.stat.uz`;
  }, [sphere, service, serviceInSphere, t]);

  if (id && !sphere) return <Navigate to="/spheres" replace />;
  if (number && !serviceInSphere) return <Navigate to={`/spheres/${id}`} replace />;
  const setQ = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    setParams(next, { replace: true });
  };

  // Sohaga xos qo'shimcha bloklar (tariflar — 14-soha, hisobot kalendari — 2-soha): xizmatlar ro'yxati ostida
  const extra = sphere?.slug === "tariffs" ? <Suspense fallback={null}><TariffComponent /></Suspense>
    : sphere?.slug === "reporting" ? <Suspense fallback={null}><CalendarReport /></Suspense>
    : null;

  return (
    <SpheresOverview sphere={sphere} service={service} params={params} q={q} onQ={setQ} advanced={advanced} onToggleAdvanced={() => setAdvanced((v) => !v)}
      filters={<FilterPanel params={params} setParams={setParams} />} extra={extra} stats={stats} isSample={isSample} />
  );
}
