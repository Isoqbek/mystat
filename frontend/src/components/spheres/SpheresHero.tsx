import { Search, SlidersHorizontal } from "lucide-react";
import { useLang } from "../../i18n/LangContext";
import { UI } from "../../i18n/ui";
import "../../theme/spheres-n2.css";

/**
 * N2 hero: gradient fon, sarlavha, "{N} ta xizmat, {M} ta sohada" va oq qidiruv maydoni.
 * Qidiruv matni (`q`) va "Kengaytirilgan qidiruv" holati tashqaridan beriladi (URL'dagi mavjud mantiq).
 */
export default function SpheresHero({ total, sphereCount, q, onQ, advanced, onToggleAdvanced }: {
  total: number; sphereCount: number; q: string; onQ: (v: string) => void; advanced: boolean; onToggleAdvanced: () => void;
}) {
  const { t, lang } = useLang();
  const sub = lang === "ru" ? `${total} услуг в ${sphereCount} сферах` : `${total} ta xizmat, ${sphereCount} ta sohada`;
  return (
    <section aria-labelledby="sn2-h" className="sn2-hero rounded-[22px] px-[clamp(16px,3vw,40px)] py-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-x-7 gap-y-3.5">
        <div>
          <h1 id="sn2-h" className="m-0 text-[28px] font-extrabold leading-[1.15] tracking-[-0.03em]">{t({ uz: "Xizmatlar", ru: "Услуги" })}</h1>
          <p className="mb-0 mt-1 text-[15px] text-white/90">{sub}</p>
        </div>
        <div className="flex min-w-0 flex-1 basis-[340px] flex-wrap items-center justify-end gap-2.5">
          <form role="search" onSubmit={(e) => e.preventDefault()}
            className="sn2-sbox flex min-w-0 max-w-[540px] flex-1 basis-[260px] items-center gap-2 rounded-[14px] bg-white py-[5px] pl-4 pr-2 shadow-[0_18px_36px_-22px_rgba(0,0,0,0.5)]">
            <Search className="h-5 w-5 shrink-0 text-[var(--btn)]" aria-hidden="true" />
            <label htmlFor="sphere-q" className="sr-only">{t(UI.serviceSearch)}</label>
            <input id="sphere-q" type="search" value={q} onChange={(e) => onQ(e.target.value)} placeholder={t(UI.serviceSearch)}
              className="h-11 min-w-0 flex-1 border-0 bg-transparent text-base text-[#1b2530]" />
            {q && (
              <button type="button" onClick={() => onQ("")}
                className="h-[34px] rounded-[9px] border-0 bg-[#f2f7f9] px-3 text-sm text-[#1b2530]">
                {t({ uz: "Tozalash", ru: "Очистить" })}
              </button>
            )}
          </form>
          <button type="button" onClick={onToggleAdvanced} aria-expanded={advanced}
            className="inline-flex h-[54px] items-center gap-2 rounded-[14px] border border-white/40 bg-white/15 px-4 text-sm font-semibold text-white hover:bg-white/25">
            <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />{t(UI.advancedSearch)}
          </button>
        </div>
      </div>
    </section>
  );
}
