import { Link } from "react-router-dom";
import type { ServiceCatalogItem } from "../../config/serviceCatalog";
import { SPHERES, type Sphere } from "../../config/spheres";
import { useLang } from "../../i18n/LangContext";
import { UI } from "../../i18n/ui";
import ServiceRow from "./ServiceRow";
import "../../theme/spheres-n2.css";

/**
 * N2 Level 1: soha nomi + "N ta xizmat", boshqa sohalar tugmalari (gorizontal scroll), kichik toifa filtri (`?sub=`)
 * va xizmat qatorlari. Xizmat tafsiloti (Level 2) hozircha mavjud `/service/:number` sahifasi.
 */
export default function SphereServices({ sphere, services, sub, onSub, serviceHref }: {
  sphere: Sphere; services: ServiceCatalogItem[]; sub: string | null; onSub: (id: string | null) => void;
  serviceHref: (s: ServiceCatalogItem) => string | undefined;
}) {
  const { t, lang } = useLang();
  const chip = "h-[38px] shrink-0 whitespace-nowrap rounded-full border px-3.5 text-sm";
  return (
    <div key={sphere.id} className="sn2-in flex flex-col">
      <div className="flex items-baseline gap-2.5 px-[18px] pb-2.5 pt-[18px]">
        <h2 className="m-0 text-[22px] font-extrabold">{t(sphere.title)}</h2>
        <span className="text-sm text-[var(--sn-muted)]">{lang === "ru" ? `${services.length} услуг` : `${services.length} ta xizmat`}</span>
      </div>

      <nav aria-label={t(UI.spheres)} className="sn2-hscroll flex gap-2 overflow-x-auto px-[18px] pb-3.5">
        {SPHERES.map((sp) => {
          const on = sp.id === sphere.id;
          return (
            <Link key={sp.id} to={`/spheres/${sp.id}`} aria-current={on ? "page" : undefined}
              className={`${chip} inline-flex items-center hover:no-underline ${on
                ? "border-transparent bg-[var(--sn-g1)] font-semibold text-white"
                : "sn2-pill border-[var(--sn-line)] bg-[var(--sn-card)] text-[var(--pp-text)]"}`}>
              {t(sp.title)}
            </Link>
          );
        })}
      </nav>

      {sphere.subcategories.length > 0 && (
        <div role="group" aria-label={t({ uz: "Kichik toifalar", ru: "Подкатегории" })} className="sn2-hscroll flex gap-2 overflow-x-auto px-[18px] pb-3.5">
          {[{ id: null as string | null, title: UI.all }, ...sphere.subcategories].map((c) => {
            const on = (sub ?? null) === c.id;
            return (
              <button key={c.id ?? "all"} type="button" onClick={() => onSub(c.id)} aria-pressed={on}
                className={`${chip} ${on
                  ? "border-[var(--btn)] bg-[var(--p50)] font-semibold text-[var(--p800)]"
                  : "sn2-pill border-[var(--sn-line)] bg-[var(--sn-card)] text-[var(--pp-text)]"}`}>
                {t(c.title)}
              </button>
            );
          })}
        </div>
      )}

      {services.length === 0
        ? <p className="border-t border-[var(--pp-soft)] px-4 py-10 text-center text-[var(--sn-muted)]">{t(UI.nothingFound)}</p>
        : <ul className="m-0 list-none border-t border-[var(--pp-soft)] p-0">{services.map((s) => <ServiceRow key={s.number} s={s} href={serviceHref(s)} />)}</ul>}
    </div>
  );
}
