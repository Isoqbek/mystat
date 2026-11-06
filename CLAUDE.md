# CLAUDE.md

**MUHIM:** Har sessiya boshida, hech qanday ishni boshlashdan oldin [docs/CLAUDE_HISOBOT.md](docs/CLAUDE_HISOBOT.md) ni to'liq o'qing.
Unda loyiha holati, bajarilgan va qolgan ishlar, qayerda to'xtalgani (7-bo'lim, "Sessiyalar jurnali") va davom etish yo'riqnomasi (0-bo'lim) bor.

- Fayldagi oxirgi commit `git log` bilan mos kelmasa, avval faylni yangilang.
- Har ish bosqichi tugagach, `docs/CLAUDE_HISOBOT.md` ning 4, 5 va 7-bo'limlarini yangilang.
- Javoblar va hujjatlar o'zbek tilida (lotin).
## Dizayn namunasi (/spheres)
Dizayn bo'yicha hamma narsa `docs/design/` da. Avval `docs/design/HANDOFF.md` ni o'qi, keyin `design-spec.json` ni.
- Faqat `src/` ichidagi UI fayllarini (komponent, stil) o'zgartir.
- Backend, API chaqiruvlari, store/servislar va marshrutlash mantig'iga tegma.
- Mavjud komponent nomlari va props'larini saqlab qol.
- `N2.dc.html` standart HTML emas, canvas formati: faqat ko'rinish namunasi sifatida o'qi.
- Matnlar o'zbek tilida. "Boshlash" so'zini ishlatma.
