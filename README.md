# HA Vitodens Pro

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![Version](https://img.shields.io/badge/Version-1.0.1-blue.svg)](https://github.com/PROGNET-SK/ha-vitodens-pro/releases/tag/v1.0.1)

Aplikácia pre panel **Home Assistant** špeciálne navrhnutá na monitorovanie, riadenie a vizualizáciu kotlov Vitodens a iných vykurovacích komponentov pre PROGNET-SK.  
Repozitár: [PROGNET-SK/ha-vitodens-pro](https://github.com/PROGNET-SK/ha-vitodens-pro)

---

## 🚀 Funkcie (Plánované)
- Integrácia existujúcich HMI návrhov
- Vlastná Lovelace karta pre Home Assistant a HACS
- Responzívny vizuál pre systémy s kotlami, rozdeľovačmi, čerpadlami a zmiešavacími ventilmi.

---

## 📦 Inštalácia

### Variant 1: inštalácia cez [HACS](https://hacs.xyz/) (odporúčané)
1. Prejdite na panel HACS vo vašom Home Assistant inštancii.
2. Vyberte položku **Frontend** v postrannom paneli HACS.
3. Kliknite na ikonu troch bodiek (`⋮`) v pravom hornom rohu a zvoľte **Vlastné repozitáre** (Custom repositories).
4. Do poľa Repozitár vložte nasledujúcu URL adresu repozitára:  
   `https://github.com/PROGNET-SK/ha-vitodens-pro`
5. V sekcii Kategória zvoľte **Lovelace**.
6. Kliknite na pridať a repozitár sa Vám stiahne zo zoznamu dostupných pluginov.
7. Nakoniec vyhľadajte plugin v katalógu, stlačte **Stiahnuť pre Home Assistant** a reštartujte Home Assistant ak je to potrebné.

### Variant 2: Manuálna inštalácia
1. Stiahnite si súbor `ha-vitodens-pro.js` z tohto repozitára.
2. Nahrajte tento súbor do svojej zložky `www` v konfiguračnom adresári vášho Home Assistantu (`/config/www/`).
3. V Home Assistante prejdite do sekcie **Nastavenia -> Lovelace -> Zdroje (Resources)**.
4. Pridajte nový zdroj:
   - **URL:** `/local/ha-vitodens-pro.js`
   - **Typ zdroja:** Modul (JavaScript Module)

---

## 🛠 Konfigurácia

Karta môže byť po pridaní dostupná prostredníctvom používateľského vizuálneho editora na paneli Lovelace (Dashboard), kde zadávate napríklad `type: custom:ha-vitodens-pro`.

Ručná definícia YAML na obrazovke Dashboard môže vyzerať zatiaľ takto (po odkomunikovaní logiky nasledujú zmeny):

```yaml
type: 'custom:ha-vitodens-pro'
```

---

*Vyvinuté pre PROGNET-SK v rámci požiadaviek na HA.*
