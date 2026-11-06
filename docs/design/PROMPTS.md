# Claude Code uchun tayyor so'rovlar (ketma-ket yuboring)

## 1. Tahlil (hali kod yo'q)
```
docs/design/HANDOFF.md ni o'qi, keyin docs/design/design-spec.json va N2.dc.html ni o'qi.
/spheres sahifasi hozir qaysi fayllardan iborat, ma'lumot qayerdan va qanday keladi, qaysi qismlari faqat ko'rinish ekanini tushuntirib ber.
Keyin HANDOFF.md dagi ish tartibi bo'yicha o'zgartirish rejasini yoz. Hali kod yozma va hech narsani o'zgartirma.
```

## 2. Stil asosi
```
Reja yaxshi. 2-qadamni bajar: design-spec.json dagi "tokens" bo'yicha CSS o'zgaruvchilari (rang, shrift, radius) va umumiy kartochka stillarini qo'sh.
HANDOFF.md dagi qoidalarga amal qil, backendga va mantiqqa tegma. Tugagach qaysi fayllar o'zgarganini ayt va to'xta. Men brauzerda ko'raman.
```

## 3. Sohalar to'ri (level 0)
```
3-qadam: design-spec.json dagi levels[0] bo'yicha sohalar to'rini yoz. Ma'lumot hozirgi API'dan kelsin (yangi ma'lumot yozma, loyihadagi mavjud ma'lumotni ishlat).
Qidiruvni ham ulab qo'y. Tugagach to'xta.
```

## 4. Xizmatlar ro'yxati va siqilish (level 1)
```
4-qadam: levels[1] bo'yicha soha ichidagi xizmatlar ro'yxatini yoz: boshqa sohalar tugmalari, xizmat qatorlari, muddat belgisi, sevimli yulduzcha (mavjud mexanizm bilan).
Soha ro'yxati chapga ingichka vertikal ustun bo'lib siqilsin, bosilsa qaytsin. Joylashuv URL'da bo'lsin (navigation.routes), brauzer orqaga/oldinga ishlasin.
```

## 5. Tafsilot (level 2)
```
5-qadam: levels[2] bo'yicha tafsilot ko'rinishini yoz. Tugma matni actionButtonLabel qoidasi bo'yicha. "Boshlash" yozma.
Tugma hozircha hozirgi xizmatni ochish mantig'iga ulansin (yangi jarayon yozma).
```

## 6. Tezkor o'tish
```
6-qadam: navigation.recents bo'yicha "Oldingi / Undan oldin" tezkor o'tishni qo'sh. Oxirgi 4 ta ko'rilgan joyni saqlash uchun eng sodda yechimni tanla va nimani tanlaganingni tushuntir.
```

## 7. Yakuniy tekshiruv
```
Yakuniy tekshiruv: git status ni ko'rsat. Backend, API, store yoki servis fayllari o'zgarganmi? O'zgargan bo'lsa qaytar va sababini ayt.
Eski funksiyalar (qidiruv, filtr, xizmatni ochish) ishlashini kod bo'yicha qayta ko'rib chiq va xavfli joylarni ayt.
```

## 8. Jarayon (siqiluvchi ustun + keng oyna) (1-bosqich tugagandan keyin)
```
8-qadam: flows.json va N2.dc.html dagi <aside> qismini o'qi. Tafsilotdagi asosiy tugma bosilganda xizmat nomi ingichka vertikal ustunga siqilsin va jarayon qolgan kenglikda ochilsin (container bo'limi).
Hozircha faqat UI va mavjud API'ga ulanish nuqtalarini qoldir: mavjud xizmat ochish/so'rov yuborish mantig'ini o'zgartirma. Shaxsni tasdiqlash qadamini yozma, foydalanuvchi allaqachon kirgan.
To'lov qadamini UI sifatida yoz, haqiqiy to'lov chaqiruvini alohida funksiya qilib bo'sh qoldir va menga ayt. Avval reja ber, keyin kod yoz.
```

## Muammo bo'lsa
- Claude backendga teginsa: "Bu faylga tegma. O'zgarishni qaytar va faqat UI da hal qil."
- Dizayndan chetga chiqsa: "design-spec.json dagi levels[N] bilan solishtir, farqlarni ayt va tuzat."
- Noaniq joyda: "Taxmin qilma, menga savol ber."
