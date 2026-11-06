import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { SERVICES, matchesFilters, servicesOfSphere, type ServiceCatalogItem } from "../../config/serviceCatalog";
import { SPHERES, type Sphere } from "../../config/spheres";
import { useLang } from "../../i18n/LangContext";
import { UI } from "../../i18n/ui";
import ServiceCard from "../catalog/ServiceCard";
import type { ServiceShortStats } from "../../api/portal";
import DemoBadge from "../ui/DemoBadge";
import SphereGrid from "./SphereGrid";
import ServiceDetail from "./ServiceDetail";
import SphereServices from "./SphereServices";
import SpheresHero from "./SpheresHero";
import "../../theme/spheres-n2.css";

/**
 * `/spheres` va `/spheres/:id` N2 ko'rinishida: hero + asosiy karta.
 * - Level 0 (`sphere` yo'q): sohalar to'ri.
 * - Level 1 (`sphere` bor): chapda 66px siqilgan soha ustuni, o'ngda xizmat qatorlari.
 * - Level 2 (`service` ham bor): soha va "Xizmatlar" ustunlari 66px, o'ngda xizmat tafsiloti.
 * - Qidiruv matni (`q`) bo'lsa darajadan qat'i nazar butun katalog bo'yicha natijalar. Filtrlar (`user`, `price`) soha
 *   ichida o'sha soha ro'yxatini, Level 0 da butun katalogni filtrlaydi (avvalgi mantiq).
 * Qidiruv natijalari hozircha mavjud `ServiceCard` bilan (N2 qatoriga keyingi bosqichda o'tadi).
 */
/** Siqilgan ustun (66px): "‹" belgisi va vertikal yozuv. Bosilsa tegishli darajaga qaytadi. */
function Strip({ label, aria, onClick }: { label: string; aria: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={aria}
      className="sn2-strip flex w-full shrink-0 cursor-pointer flex-row items-center gap-3 border-0 border-b border-[var(--sn-line)] bg-[var(--p50)] px-4 py-3 text-[var(--p800)] md:w-[66px] md:flex-col md:gap-3.5 md:border-b-0 md:border-r md:px-0 md:py-4">
      <span className="text-[22px] leading-none" aria-hidden="true">‹</span>
      <span className="sn2-vert text-[15px] font-bold">{label}</span>
    </button>
  );
}

export default function SpheresOverview({ sphere, service, params, q, onQ, advanced, onToggleAdvanced, filters, extra, stats, isSample }: {
  sphere?: Sphere; service?: ServiceCatalogItem; params: URLSearchParams; q: string; onQ: (v: string) => void; advanced: boolean; onToggleAdvanced: () => void;
  filters: ReactNode; extra?: ReactNode; stats: Record<string, ServiceShortStats>; isSample: boolean;
}) {
  const { t } = useLang();
  const navigate = useNavigate();
  const user = params.get("user");
  const price = params.get("price");
  const sub = params.get("sub");
  const searching = sphere ? !!q : !!(q || user || price);
  const hits = searching ? SERVICES.filter((s) => matchesFilters(s, user, price, q)) : [];
  const inSphere = sphere ? servicesOfSphere(sphere.id).filter((s) => (!sub || s.subcategory === sub) && matchesFilters(s, user, price, "")) : [];

  const setSub = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("sub", id);
    else next.delete("sub");
    navigate({ search: next.toString() }, { replace: true });
  };

  return (
    <div className="sn2 flex flex-col gap-3.5 pb-14">
      <SpheresHero total={SERVICES.length} sphereCount={SPHERES.length} q={q} onQ={onQ} advanced={advanced} onToggleAdvanced={onToggleAdvanced} />
      {advanced && filters}
      <div className="sn2-panel flex-col md:flex-row">
        {sphere && !searching && (
          <Strip label={t(sphere.title)} aria={t({ uz: "Sohalar ro'yxatiga qaytish", ru: "Вернуться к списку сфер" })} onClick={() => navigate("/spheres")} />
        )}
        {sphere && service && !searching && (
          <Strip label={t({ uz: "Xizmatlar", ru: "Услуги" })} aria={t({ uz: "Xizmatlar ro'yxatiga qaytish", ru: "Вернуться к списку услуг" })} onClick={() => navigate(`/spheres/${sphere.id}`)} />
        )}
        <div className="min-w-0 flex-1">
          {searching ? (
            <div className="sn2-in p-5">
              <h2 className="m-0 text-xl font-extrabold">
                {t({ uz: "Qidiruv natijalari", ru: "Результаты поиска" })}
                {isSample && <span className="ml-2 align-middle"><DemoBadge /></span>}
              </h2>
              <span className="text-sm text-[var(--sn-muted)]">
                {q ? `"${q}" ` : ""}{t({ uz: `bo'yicha ${hits.length} ta xizmat`, ru: `найдено услуг: ${hits.length}` })}
              </span>
              {hits.length === 0
                ? <p className="mt-6 text-center text-[var(--sn-muted)]">{t(UI.nothingFound)}</p>
                : <div className="mt-4 grid gap-4 md:grid-cols-2">{hits.map((s) => <ServiceCard key={s.number} s={s} stats={stats[s.number]} />)}</div>}
            </div>
          ) : sphere && service ? (
            <ServiceDetail sphere={sphere} s={service} />
          ) : sphere ? (
            <>
              <SphereServices sphere={sphere} services={inSphere} sub={sub} onSub={setSub}
                serviceHref={(s) => `/spheres/${sphere.id}/${s.number}`} />
              {extra && <div className="px-[18px] pb-6 pt-4">{extra}</div>}
            </>
          ) : <SphereGrid />}
        </div>
      </div>
    </div>
  );
}
