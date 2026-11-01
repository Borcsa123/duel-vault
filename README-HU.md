# Duel Vault – Windows

Bejelentkezés nélkül működő, helyi Yu-Gi-Oh! gyűjteménykezelő.

## Telepítés és használat

1. Indítsd el a `Duel-Vault-Setup-1.0.0-x64.exe` telepítőt Windows 10/11, 64 bites rendszeren.
2. A Start menüből vagy az asztali Duel Vault ikonról indítsd el.
3. A bal oldalon választhatsz szettet vagy kiemelt lapot.

A gyűjtemény az alkalmazás saját helyi adatmappájába kerül. A „Mentések mappája” gombbal megnyitható. A program újratelepítése nem törli ezt a mappát. Az automatikus másolatok a `backups` almappába kerülnek (legfeljebb 30 mentés). A „Biztonsági mentés” gombbal külön JSON-fájlba is menthetsz.

A katalógus és a Full Art képek a telepítő részei. A többi lapképet a program az első megnyitáskor tölti le és helyben megőrzi; a még le nem töltött képekhez internet kell. A gyűjtemény kezelése internet nélkül is működik.

## Átvitel a weboldalról

A webes Duel Vault „Teljes mentés” gombjával töltsd le a JSON-fájlt. A Windows-alkalmazásban válaszd a „Mentés betöltése” gombot. A betöltés a helyi gyűjteményt lecseréli, előtte automatikus biztonsági másolat készül. Ez egyszeri átvitel: a két változat nem szinkronizál automatikusan.

## Automatikus frissítés – jelenlegi állapot

A frissítő be van építve, de **ebben az első telepítőben nincs éles kiadási csatorna beállítva**. Emiatt az alkalmazás ezt egyértelműen jelzi, és nem állítja, hogy automatikusan frissül.

Az aktivált csatornán a program indulás után, majd hatóránként keresi az új verziókat. Az ellenőrzött frissítést a háttérben tölti le, és bezáráskor indítja el a telepítését. Előtte biztonsági mentést készít. A gyűjtemény nem a program telepítési könyvtárában található.

Az aktiváláshoz a karbantartónak HTTPS-en elérhető kiadási helyet és Ed25519 aláírókulcsot kell beállítania. A privát kulcs nem kerülhet sem a telepítőbe, sem nyilvános forráscsomagba.

## Karbantartás

Node.js 24 és npm szükséges.

```
npm ci
npm test
npm run dist:win
```

Az első kulcspár létrehozása a projekten kívüli, biztonságos könyvtárban:

```
npm run updates:sign -- keygen C:\DuelVaultKeys
node scripts/configure-channel.cjs https://KIADASI-HELY/latest.json C:\DuelVaultKeys\public.pem
npm run dist:win
```

A `KIADASI-HELY` helyére valódi, előzetesen létrehozott kiadási cím szükséges. Ez a példa nem működő frissítési szerver.

Új verziónál emeld a `package.json` verziószámát, építsd meg a telepítőt, és készíts aláírt csomagleírást:

```
npm run updates:sign -- manifest release\Duel-Vault-Setup-1.1.0-x64.exe https://KIADASI-HELY/Duel-Vault-Setup-1.1.0-x64.exe C:\DuelVaultKeys\private.pem release\latest.json
```

A telepítőt és a `latest.json` fájlt ugyanarra a kiadási helyre kell feltölteni. A GitHub Actions munkafolyamat megfelelően beállított tároló és aláírókulcs esetén verziótag létrehozásakor automatikusan épít és publikál. Az éles bekötés még nincs elvégezve.

A csomag jelenleg nem rendelkezik Windows Authenticode kiadói tanúsítvánnyal. A frissítések csomagleírását ettől külön Ed25519 aláírás védi, ha a kiadási csatornát aktiválják.

## Ellenőrzés

A helyi adattárolás, az importálás előtti másolat, a hibás import elutasítása és a frissítés-aláírás ellenőrzése automatizált tesztekkel ellenőrzött. A telepítőt Linuxon készítettük Windowsra; natív Windows-telepítési és indítási teszt itt nem áll rendelkezésre.

Kártyaképek: © Konami; képforrások a `public/images/full-art/SOURCES.json` fájlban.

## GitHub-alapú automatikus kiadás – előkészítve

A `windows-release.yml` munkafolyamat `vVERZIÓ` tag létrehozásakor automatikusan:

1. ellenőrzi a verziót és azt, hogy a kiadási tároló nyilvános;
2. lefuttatja a teszteket;
3. a tároló tényleges nevéből beállítja az állandó frissítési címet;
4. az aláírókulcsból csak a nyilvános részt építi a programba;
5. elkészíti a Windows-telepítőt, aláírja a frissítési csomagleírást;
6. közzéteszi a telepítőt és a `latest.json` fájlt GitHub Release-ként.

Az első bekötéshez egy tényleges GitHub-tároló és az `UPDATE_SIGNING_PRIVATE_KEY` kiadási titok szükséges. Ezek még nincsenek létrehozva vagy összekapcsolva. Az első aktivált kiadást a jelenlegi 1.0.0 használóinak egyszer kézzel kell telepíteniük; onnantól az alkalmazás ellenőrzi és letölti az új kiadásokat. A magánkulcsnak a későbbi kiadásoknál változatlannak kell maradnia.

A gyűjtemény és a biztonsági mentések nem kerülnek a kiadási tárolóba. A munkafolyamat a programfájlokat publikálja. A GitHub-fiók csak a kiadások kezeléséhez kell; az asztali alkalmazás nem igényel bejelentkezést.
