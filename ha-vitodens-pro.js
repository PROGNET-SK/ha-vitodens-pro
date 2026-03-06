/**
 * HA Vitodens Pro
 * Custom Lovelace Card pre Home Assistant
 * Verzia: 1.0.1
 * Repozitár: https://github.com/PROGNET-SK/ha-vitodens-pro
 */

class HaVitodensPro extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      card.header = 'HA Vitodens Pro';
      
      this.content = document.createElement('div');
      this.content.style.padding = '0 16px 16px';
      this.content.innerHTML = `
        <div class="vitodens-container">
          <h2>HA Vitodens Pro v1.0.1</h2>
          <p>Aplikácia na prepojenie a vizualizáciu kotlov Vitodens a iných komponentov.</p>
          <div id="entities-container">
            <!-- Tu sa budú načítať entity neskôr v ďalších krokoch -->
            <p>Konfigurácia načítaná úspešne.</p>
          </div>
        </div>
      `;

      card.appendChild(this.content);
      this.appendChild(card);
    }

    // Neskôr sem pridáme logiku na spracovanie stavov (states) pri každej zmene v Home Assistant.
    // this._hass = hass;
  }

  setConfig(config) {
    // Definuj nastavenia pre túto Custom Card.
    // Ak napríklad config nemá nejakú entitu a je povinná:
    // if (!config.nejaka_entita) throw new Error('Zadajte požadovanú entitu v konfigurácii.');

    this.config = config;
  }

  getCardSize() {
    // Odhadovaná veľkosť karty pre rozloženie v Home Assistant (1 = 50px).
    return 3;
  }

  // Ak chceme vizuálny editor pre kartu, budeme ho musieť registrovať.
  static getStubConfig() {
    return { 
      // Predvolený YAML pri pridaní cez UI
      // tvoja_entita: "sensor.priklad"
    };
  }
}

customElements.define('ha-vitodens-pro', HaVitodensPro);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ha-vitodens-pro",
  name: "HA Vitodens Pro",
  description: "Aplikácia pre panel Home Assistant prispôsobená pre vizualizáciu systému Vitodens."
});
