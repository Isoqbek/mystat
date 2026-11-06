import { describe, expect, it } from "vitest";
import { SERVICES } from "../../config/serviceCatalog";
import { translate } from "../../i18n/LangContext";
import { actionLabel, timeKind } from "./n2Adapter";

const uz = (s: Parameters<typeof actionLabel>[0]) => translate(actionLabel(s), "uz");

describe("n2Adapter", () => {
  it("katalogdagi har bir xizmat uchun muddat turi va tugma matni bor", () => {
    for (const s of SERVICES) {
      expect(["instant", "minute", "days", "soon"]).toContain(timeKind(s));
      expect(uz(s).length).toBeGreaterThan(0);
      expect(uz(s)).not.toMatch(/boshlash/i);
    }
  });

  it("muddat qoidalari design-spec.json ga mos", () => {
    const base = { status: "live" as const };
    const d = (uz: string) => ({ uz, ru: uz });
    expect(timeKind({ ...base, duration: d("Darhol") })).toBe("instant");
    expect(uz({ ...base, duration: d("Darhol") })).toBe("Xizmatdan foydalanish");
    expect(uz({ ...base, duration: d("1 daqiqa") })).toBe("Xizmatdan foydalanish");
    expect(uz({ ...base, duration: d("3 daqiqa") })).toBe("Buyurtma berish");
    expect(uz({ ...base, duration: d("1–3 ish kuni") })).toBe("So'rov yuborish");
    expect(timeKind({ status: "soon", duration: d("Darhol") })).toBe("soon");
    expect(uz({ status: "soon", duration: d("Darhol") })).toBe("Tez orada");
  });
});
