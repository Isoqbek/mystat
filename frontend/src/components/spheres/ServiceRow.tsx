import { Link } from "react-router-dom";
import type { ServiceCatalogItem } from "../../config/serviceCatalog";
import { useLang } from "../../i18n/LangContext";
import FavoriteServiceButton from "../catalog/FavoriteServiceButton";
import { TIME_BADGE_CLASS, timeKind, timeText } from "./n2Adapter";
import "../../theme/spheres-n2.css";

/**
 * N2 xizmat qatori: ikonka, nom, 2 qatorlik tavsif, muddat belgisi, sevimli yulduzcha va "›".
 * Butun qator bosiladi (nom — havola, `before:` bilan kengaytirilgan); yulduzcha alohida tugma (z-10).
 * `href` bo'lmasa (masalan, "Tez orada" xizmat) qator havolasiz ko'rsatiladi.
 */
export default function ServiceRow({ s, href }: { s: ServiceCatalogItem; href?: string }) {
  const { t } = useLang();
  const Icon = s.icon;
  const kind = timeKind(s);
  const title = <b className="text-[15px] leading-[1.3]">{t(s.title)}</b>;
  return (
    <li className="sn2-row relative flex items-center gap-3.5 border-b border-[var(--pp-soft)] bg-[var(--sn-card)] px-4 py-3">
      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-[var(--p50)] text-[var(--p800)]">
        <Icon className="h-[21px] w-[21px]" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-px">
        {href
          ? <Link to={href} className="text-[var(--pp-text)] before:absolute before:inset-0 before:content-[''] hover:no-underline">{title}</Link>
          : <span className="text-[var(--pp-text)]">{title}</span>}
        <span className="sn2-clamp2 text-[13.5px] text-[var(--sn-muted)]">{t(s.description)}</span>
      </span>
      <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline-block ${TIME_BADGE_CLASS[kind]}`}>{t(timeText(s))}</span>
      <span className="relative z-10 shrink-0">
        <FavoriteServiceButton number={s.number} title={t(s.title)} />
      </span>
      <span className="w-[34px] shrink-0 text-center text-[22px] text-[var(--sn-muted)]" aria-hidden="true">{href ? "›" : ""}</span>
    </li>
  );
}
