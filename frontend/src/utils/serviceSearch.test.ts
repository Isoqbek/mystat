import { describe, expect, it } from "vitest";
import { SERVICES } from "../config/serviceCatalog";
import { normalize, searchServices } from "./serviceSearch";

const live = SERVICES.filter((s) => s.status === "live");
const nums = (q: string, lang: "uz" | "ru" = "uz") => searchServices(live, q, lang).map((s) => s.number);

describe("serviceSearch", () => {
  it("apostrof va tutuq belgisini e'tiborsiz qoldiradi", () => {
    expect(normalize("Oʻzbekiston")).toBe(normalize("O'zbekiston"));
    expect(normalize("  Ko'rsatkich!  ")).toBe("korsatkich");
  });

  it("bo'sh so'rovga natija bermaydi", () => {
    expect(nums("")).toEqual([]);
    expect(nums("   ")).toEqual([]);
  });

  it("raqam bo'yicha xizmatni topadi, '#' bilan ham", () => {
    const n = live[0].number;
    expect(nums(String(n))[0]).toBe(n);
    expect(nums(`#${n}`)[0]).toBe(n);
  });

  it("kalit so'z (STIR) va sarlavha bo'yicha topadi", () => {
    expect(nums("stir").length).toBeGreaterThan(0);
    const first = live[0];
    expect(nums(first.title.uz.split(" ")[0])).toContain(first.number);
  });

  it("bitta harf xatosiga bardosh beradi", () => {
    expect([...nums("kontragnt")].sort()).toEqual([...nums("kontragent")].sort());
    expect(nums("kontragent").length).toBeGreaterThan(0);
  });

  it("hamma so'z topilishi shart", () => {
    expect(nums("stir qwertyuiop")).toEqual([]);
  });

  it("limitdan oshmaydi va rus tilida ham ishlaydi", () => {
    expect(searchServices(live, "a", "uz", 3).length).toBeLessThanOrEqual(3);
    expect(nums("отчет", "ru").length).toBeGreaterThan(0);
  });
});
