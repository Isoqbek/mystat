# HANDOFF — my.stat.uz /spheres sahifasini N2 dizayniga o'tkazish

Bu fayl Claude Code uchun birinchi o'qiladigan hujjat. Avval shuni, keyin `design-spec.json` ni o'qi.

## Loyiha
- my.stat.uz — O'zbekiston rasmiy statistika portali. Foydalanuvchi: dasturchi (Isoqbek), muloqot o'zbek tilida.
- Frontend `localhost:5173` da ishlaydi (Vite). Hozirgi sahifa: `/spheres` ("Barcha xizmatlar (43)": chapda sohalar ro'yxati, o'ngda soha bo'yicha guruhlangan xizmat kartochkalari, qidiruv va "Kengaytirilgan qidiruv").
- Backend va logika ishlayapti. Ularga tegilmaydi.

## Vazifa
`/spheres` sahifasining **faqat ko'rinishini** N2 dizayniga o'tkazish. Funksiyalar (ma'lumot olish, qidiruv, sevimlilar) mavjud mantiq bo'yicha ishlashda davom etadi.

## Nima uchun N2
Hozirgi sahifadagi muammolar: uzun ikki ustunli ro'yxat, ma'nosiz raqamlar (#101, ikonka yonidagi sonlar), ichiga kirib bo'lmaydigan chap menyu, qaytish qiyin.
N2 yechimi: soha -> xizmat -> tafsilot (3 daraja). Tanlaganda oldingi ro'yxat chapga ingichka ustun bo'lib siqiladi, bosilsa qaytadi. Tepada oxirgi ko'rilgan joylarga tezkor o'tish. Soha ichidan boshqa sohaga bir bosishda o'tish.

## Fayllar (docs/design/)
- `N2.dc.html` — ko'rinish namunasi. Standart HTML emas, canvas formati (`{{nom}}`, `<sc-for>`, `<sc-if>`, `renderVals()`). Brauzerda ochilmaydi. Faqat o'qi. Palitra paneli va `__P` ro'yxatini e'tiborsiz qoldir.
- `design-spec.json` — N2 ning tuzilmasi, xatti-harakati, ranglari va qoidalari (asosiy manba).
- `flows.json` — 2-bosqich uchun (xizmat jarayoni). Hozir ishlatilmaydi.
- `README.md` — qisqa tavsif.

## Qoidalar
1. Faqat UI/stil fayllarini o'zgartir. API chaqiruvlari, state/store, ma'lumot turlari, servislar, marshrutlashga tegma.
2. Mavjud komponent nomlari va props'larini saqlab qol, kerak bo'lsa yangi komponent qo'sh.
3. Ma'lumot loyihaning O'ZIDA bor (sohalar va xizmatlar). Yangi ma'lumot yozma, demo ma'lumot kiritma. Faqat mavjud ma'lumotni N2 ko'rinishi va navigatsiya mantig'i (3 daraja, siqiluvchi ustun, oxirgilar, qidiruv) bilan ko'rsat. Maydon nomlari farq qilsa, kichik mapper yoz.
4. Noaniq joyda taxmin qilma, so'ra.
5. Matnlar o'zbek tilida. "Boshlash" so'zi ishlatilmaydi (design-spec dagi `actionButtonLabel` qoidasi).
6. Har katta qadamdan keyin foydalanuvchi `localhost:5173/spheres` da ko'radi, keyingisiga o'tishdan oldin tasdig'ini kut.
7. git: alohida branch'da ishla. Commit va push'ni foydalanuvchi o'zi qiladi.

## Ish tartibi
1. Tahlil: hozirgi `/spheres` fayllari, ma'lumot oqimi, faqat ko'rinish bo'lgan qismlar. Reja ber. Kod yozma.
2. Reja tasdiqlangach: stil o'zgaruvchilari va umumiy qismlar (rang, shrift, kartochka).
3. Level 0: sohalar to'ri.
4. Level 1: xizmatlar ro'yxati va soha tugmalari, ustun siqilishi.
5. Level 2: tafsilot.
6. Tezkor o'tish (oxirgilar) va qidiruv natijalari.
7. Tekshirish: eski funksiyalar buzilmaganini va backend fayli o'zgarmaganini (`git status`).

## Xizmat tafsiloti (level 2) tuzilmasi
Tepada rangli gradient sarlavha (hero): oq ikonka, soha, nom, tavsif, 2 ta ko'rsatkich (Bajarish vaqti, marotaba foydalanilgan), baho belgisi, harakat qatori (asosiy yashil tugma, Sevimlilarga qo'shish, Ulashish) va tarif izohi. Uning ostida oq qismda 4 tab: Qanday ishlaydi / Hujjatlar va huquqiy asos / Aloqa / Statistika va baholar. `#101` raqami, katta ko'k fon va "Kirish" qatori yo'q. Haqiqiy matnlar (tarif narxi, huquqiy asos, aloqa, 'Qanday ishlaydi') loyihadagi mavjud ma'lumotdan olinadi. Bo'sh maydonlar (hujjatlar, mas'ul tashkilot) ko'rsatilmaydi yoki 'Hujjat talab qilinmaydi' deyiladi. Baho, sharhlar va statistika grafigi hozircha namuna. Narx asosan tarif paketi limitidan yechiladi; pul to'lovi faqat alohida pulli xizmatlarda.

## 2-bosqich: xizmat jarayoni (N2 ichida yon oyna)
Tafsilotdagi asosiy tugma bosilganda xizmat nomi ham ingichka vertikal ustunga siqiladi (soha va xizmatlar ustunlari yonida), jarayon esa qolgan butun kenglikda o'tadi. Pulli xizmatda to'lov ham shu yerda. Ro'yxatdan o'tish majburiy, shuning uchun 'shaxsni tasdiqlash' qadami yo'q: yon oyna tepasida faqat 'Shaxsingiz tasdiqlangan' qatori turadi. To'liq tavsif: `flows.json`. Avval 1-bosqichni (sahifa) tugating, keyin shuni boshlang.

## Ma'lum bo'sh joylar
- 8 ta xizmat (1301-1304, 1401-1404) nomi taxminiy.
- Barcha tavsif va "Qanday ishlaydi" matnlarini jamoa tasdiqlashi kerak.
- Ikonka kutubxonasi: loyihada nima ishlatilayotganini tekshir, `iconKey` ni unga moslab ber.
