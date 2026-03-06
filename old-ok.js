/**
 * HA Vitodens Pro
 * Custom Lovelace Card pre Home Assistant
 * Verzia: 1.0.1
 * Repozit├ír: https://github.com/PROGNET-SK/ha-vitodens-pro
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
          <p>Aplik├ícia na prepojenie a vizualiz├íciu kotlov Vitodens a in├Żch komponentov.</p>
          <div id="entities-container">
            <!-- Tu sa bud├║ na─Ź├şta┼ą entity nesk├┤r v ─Ćal┼í├şch krokoch -->
            <p>Konfigur├ícia na─Ź├ştan├í ├║spe┼íne.</p>
          </div>
        </div>
      `;

      card.appendChild(this.content);
      this.appendChild(card);
    }

    // Nesk├┤r sem prid├íme logiku na spracovanie stavov (states) pri ka┼żdej zmene v Home Assistant.
    // this._hass = hass;
  }

  setConfig(config) {
    // Definuj nastavenia pre t├║to Custom Card.
    // Ak napr├şklad config nem├í nejak├║ entitu a je povinn├í:
    // if (!config.nejaka_entita) throw new Error('Zadajte po┼żadovan├║ entitu v konfigur├ícii.');

    this.config = config;
  }

  getCardSize() {
    // Odhadovan├í ve─żkos┼ą karty pre rozlo┼żenie v Home Assistant (1 = 50px).
    return 3;
  }

  // Ak chceme vizu├ílny editor pre kartu, budeme ho musie┼ą registrova┼ą.
  static getStubConfig() {
    return { 
      // Predvolen├Ż YAML pri pridan├ş cez UI
      // tvoja_entita: "sensor.priklad"
    };
  }
}

customElements.define('ha-vitodens-pro', HaVitodensPro);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ha-vitodens-pro",
  name: "HA Vitodens Pro",
  description: "Aplik├ícia pre panel Home Assistant prisp├┤soben├í pre vizualiz├íciu syst├ęmu Vitodens."
});
