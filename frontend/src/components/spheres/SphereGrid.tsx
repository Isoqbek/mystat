import { Link } from "react-router-dom";
import { SPHERES } from "../../config/spheres";
import { useLang } from "../../i18n/LangContext";
import { sphereServiceCount } from "./n2Adapter";
import "../../theme/spheres-n2.css";


/** N2 Level 0: sohalar to'ri (auto-fill, min 260px). Soha tanlansa `/spheres/:id` ga o'tadi. */
export default function SphereGrid() {
  const { t, lang } = useLang();
  return (
    <div className="sn2-in flex flex-col gap-3.5 p-5">
      <div>
        <h2 className="m-0 text-[22px] font-extrabold">{t({ uz: "Soha tanlang", ru: "Выберите сферу" })}</h2>
        <span className="text-sm text-[var(--sn-muted)]">
          {t({
            uz: "Tanlaganingizdan keyin bu ro'yxat chapga siqiladi. Qaytish uchun siqilgan ustunni bosing.",
            ru: "После выбора этот список сожмётся влево. Чтобы вернуться, нажмите на узкую колонку.",
          })}
        </span>
      </div>
      <ul className="m-0 grid list-none gap-2.5 p-0 [grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))]">
        {SPHERES.map((sp) => {
          const n = sphereServiceCount(sp);
          return (
            <li key={sp.id} className="contents">
              <Link to={`/spheres/${sp.id}`}
                className="sn2-sk flex min-h-[78px] items-center gap-2.5 rounded-2xl border border-[var(--sn-line)] bg-[var(--sn-card)] px-4 py-3.5 text-left text-[var(--pp-text)]">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <b className="text-base leading-[1.3]">{t(sp.title)}</b>
                  <span className="text-[13px] font-semibold text-[var(--btn)]">{lang === "ru" ? `${n} услуг` : `${n} ta xizmat`}</span>
                </span>
                <span className="sn2-go shrink-0 text-2xl text-[var(--btn)]" aria-hidden="true">›</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
