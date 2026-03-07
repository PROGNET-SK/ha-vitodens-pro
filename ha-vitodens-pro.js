/**
 * HA Vitodens Pro
 * Custom Lovelace Card pre Home Assistant
 * Verzia: 1.1.0
 * Repozitár: https://github.com/PROGNET-SK/ha-vitodens-pro
 * Lumina Design s plnou konfiguráciou Vitodens komponentov.
 */

// No longer using LitElement to avoid startup crashes if HA elements aren't ready


// List form fields based on User Request
const SENSORS = [
  { id: "energia", name: "Energia" },
  { id: "max_tuv", name: "Maximálna teplota TÚV" },
  { id: "min_tuv", name: "Minimálna teplota TÚV" },
  { id: "spotreba_el_vyk_7dni", name: "Spotreba elektrickej energie na vykurovanie trvá sedem dní" },
  { id: "spotreba_el_vyk_mesiac", name: "Spotreba elektriny na vykurovanie v tomto mesiaci" },
  { id: "spotreba_el_vyk_rok", name: "Spotreba elektriny na vykurovanie v tomto roku" },
  { id: "spotreba_el_tyzden", name: "Spotreba elektriny tento týždeň" },
  { id: "spotreba_el_tuv_mesiac", name: "Spotreba elektriny TÚV tento mesiac" },
  { id: "spotreba_el_tuv_rok", name: "Spotreba elektriny TÚV v tomto roku" },
  { id: "spotreba_el_tuv_7dni", name: "Spotreba elektriny TÚV za posledných sedem dní" },
  { id: "spotreba_el_rok", name: "Spotreba elektriny v tomto roku" },
  { id: "spotreba_plyn_vyk_mesiac", name: "Spotreba plynu na kúrenie v tomto mesiaci" },
  { id: "spotreba_plyn_tuv_tyzden", name: "Spotreba plynu TÚV tento týždeň" },
  { id: "spotreba_plyn_tuv_rok", name: "Spotreba plynu TÚV v tomto roku" },
  { id: "spotreba_plyn_vyk_tyzden", name: "Spotreba vykurovacieho plynu tento týždeň" },
  { id: "spotreba_plyn_vyk_rok", name: "Spotreba vykurovacieho plynu v tomto roku" },
  { id: "spotreba_plyn_vyk_7dni", name: "Spotreba vykurovacieho plynu za posledných sedem dní" }
];

const CONTROLS = [
  { id: "ctrl_deakt_poplatok", name: "Deaktivácia jednorazového poplatku" },
  { id: "ctrl_jednoraz_nabijanie", name: "Jednorazové nabíjanie" },
  { id: "ctrl_komfort_temp", name: "Komfortná teplota" },
  { id: "ctrl_normal_temp", name: "Normálna teplota" },
  { id: "ctrl_posun_krivky", name: "Posun vykurovacej krivky" },
  { id: "ctrl_sklon_krivky", name: "Sklon vykurovacej krivky" },
  { id: "ctrl_tuv_temp", name: "Teplota TÚV" },
  { id: "ctrl_zniz_temp", name: "Znížená teplota" }
];

const DIAGNOSTICS = [
  { id: "diag_hodiny_horaka", name: "Hodiny horáka" },
  { id: "diag_starty_horaka", name: "Počet štartov horáka" },
  { id: "diag_tlak", name: "Prívodný tlak" }
];

// GSAP loader pre animácie
function loadGSAP() {
  return new Promise((resolve) => {
    if (window.gsap) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
    script.onload = () => resolve();
    // pre istotu css plugin
    document.head.appendChild(script);
  });
}

class HaVitodensPro extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this.gsapLoaded = false;
    loadGSAP().then(() => this.gsapLoaded = true);
  }

  setConfig(config) {
    if (!config) return;
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateStateValues();
    if (this.gsapLoaded) this.updateAnimations();
  }

  updateStateValues() {
    if (!this._hass || !this.shadowRoot) return;

    // Boiler status (farby)
    let stateEntity = this._config.boiler_state;
    let boilerState = stateEntity ? this._hass.states[stateEntity]?.state : "unknown";

    let container = this.shadowRoot.querySelector(".lumina-card");
    if (container) {
      container.classList.remove("state-on", "state-off", "state-error");
      if (boilerState === "on" || boilerState === "heating") {
        container.classList.add("state-on");
      } else if (boilerState === "error" || boilerState === "unavailable") {
        container.classList.add("state-error");
      } else {
        container.classList.add("state-off");
      }
    }

    // Modifikacia hodnot - prevzate z HA state
    const updateText = (className, entityId) => {
      if (!entityId) return;
      let el = this.shadowRoot.querySelector(className);
      if (el && this._hass.states[entityId]) {
        const s = this._hass.states[entityId];
        el.innerText = `${s.state} ${s.attributes.unit_of_measurement || ""}`;
      }
    };

    SENSORS.forEach(s => updateText(`.val-${s.id}`, this._config[s.id]));
    CONTROLS.forEach(c => updateText(`.val-${c.id}`, this._config[c.id]));
    DIAGNOSTICS.forEach(d => updateText(`.val-${d.id}`, this._config[d.id]));

    // Aktualizacia okruhov
    for (let i = 1; i <= 5; i++) {
      updateText(`.circuit-val-${i}`, this._config[`circuit_${i}_temp`]);
      updateText(`.circuit-tgt-${i}`, this._config[`circuit_${i}_target`]);
      updateText(`.radiator-val-${i}`, this._config[`radiator_${i}_temp`]);
    }
  }

  updateAnimations() {
    if (!this.gsapLoaded || !this.shadowRoot) return;
    let p = this.shadowRoot.querySelector(".pipe-flow");
    if (p) {
      let stateEntity = this._config.boiler_state;
      let boilerState = stateEntity ? this._hass.states[stateEntity]?.state : "unknown";

      if (boilerState === "on" || boilerState === "heating") {
        if (!p.classList.contains("animating")) {
          window.gsap.to(p, { strokeDashoffset: 0, duration: 2, repeat: -1, ease: "linear" });
          p.classList.add("animating");
        }
      } else {
        window.gsap.killTweensOf(p);
        p.classList.remove("animating");
      }
    }
  }

  openModal(ctrlId, currentVal) {
    let overlay = this.shadowRoot.querySelector('.modal-overlay');
    let input = overlay.querySelector('#modal-input');
    overlay.style.display = 'flex';
    input.value = currentVal.replace(/[^\d.]/g, ''); // get just numbers for simplicity

    // Save current target to change later
    this.currentControlTarget = ctrlId;
  }

  closeModal() {
    let overlay = this.shadowRoot.querySelector('.modal-overlay');
    overlay.style.display = 'none';
  }

  saveModal() {
    let val = this.shadowRoot.querySelector('#modal-input').value;
    let entity = this._config[this.currentControlTarget];

    if (entity && this._hass) {
      let domain = entity.split('.')[0];
      let service = "set_value"; // adapt to domain
      if (domain === "input_number" || domain === "number") service = "set_value";
      if (domain === "climate") service = "set_temperature";

      let svcData = { entity_id: entity };
      if (domain === "climate") svcData.temperature = parseFloat(val);
      else svcData.value = parseFloat(val);

      this._hass.callService(domain, service, svcData);
    }
    this.closeModal();
  }

  render() {
    if (!this.shadowRoot) return;

    // Custom names fallback
    const getName = (id, def) => this._config[`${id}_name`] || def;

    // Render okruhov (max 5) a radiatorov (max 5) mapovanych v conf
    let okruhyHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (this._config[`circuit_${i}_temp`]) {
        okruhyHtml += `
                 <div class="circuit-box targetable">
                    <div class="circuit-title">${getName(`circuit_${i}`, `Okruh ${i}`)} <small>(${this._config[`circuit_${i}_type`] || 'radiator'})</small></div>
                    <div class="circuit-temps">
                        <span class="actual circuit-val-${i}">--</span> / <span class="target circuit-tgt-${i}">--</span>
                    </div>
                 </div>
                `;
      }
    }
    let radiatorsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (this._config[`radiator_${i}_temp`]) {
        radiatorsHtml += `
                 <div class="circuit-box rad-color">
                    <div class="circuit-title rad">${getName(`radiator_${i}`, `Radiátor ${i}`)}</div>
                    <div class="circuit-temps">
                        <span class="actual radiator-val-${i}">--</span>
                    </div>
                 </div>
                `;
      }
    }

    const template = `
            <style>
                :host {
                    --lumina-bg: rgba(20, 20, 25, 0.6);
                    --lumina-border: rgba(255, 255, 255, 0.1);
                    --lumina-glow: rgba(0, 255, 213, 0.5);
                    --text-color: #fff;
                    --panel-bg: rgba(10, 10, 15, 0.4);
                    
                    /* Dynamic colors */
                    --boiler-on: #00ffd5;
                    --boiler-off: #555;
                    --boiler-error: #ff3366;
                    
                    --bg-image: url('/hacsfiles/ha-vitodens-pro/bg_dark.png');
                }
                
                @media (prefers-color-scheme: light) {
                    :host {
                        --lumina-bg: rgba(240, 240, 245, 0.85);
                        --lumina-border: rgba(0, 0, 0, 0.1);
                        --lumina-glow: rgba(0, 150, 255, 0.5);
                        --text-color: #333;
                        --panel-bg: rgba(255, 255, 255, 0.6);
                        --bg-image: url('/hacsfiles/ha-vitodens-pro/bg_light.png');
                    }
                }

                .lumina-card {
                    background: var(--lumina-bg);
                    background-image: linear-gradient(var(--lumina-bg), var(--lumina-bg)), var(--bg-image);
                    background-size: cover;
                    background-position: center;
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--lumina-border);
                    border-radius: 20px;
                    padding: 24px;
                    color: var(--text-color);
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    position: relative;
                }
                
                /* Dynamicke stavy - ciarky, tiene */
                .lumina-card.state-on { border-left: 5px solid var(--boiler-on); box-shadow: 0 0 20px var(--boiler-on); }
                .lumina-card.state-error { border-left: 5px solid var(--boiler-error); box-shadow: 0 0 20px var(--boiler-error); }
                .lumina-card.state-off { border-left: 5px solid var(--boiler-off); }

                .boiler-pane {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: var(--panel-bg);
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid var(--lumina-border);
                    position: relative;
                }
                
                .boiler-pane img { max-width: 100%; border-radius: 10px; }

                .boiler-pane h2 {
                    margin: 0 0 10px 0;
                    color: var(--text-color);
                    text-transform: uppercase;
                    font-size: 1.2rem;
                    letter-spacing: 2px;
                }

                .data-pane {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }

                .data-group {
                    background: var(--panel-bg);
                    border-radius: 12px;
                    padding: 15px;
                    border: 1px solid var(--lumina-border);
                }
                .data-group h3 {
                    margin-top:0;
                    font-size: 0.9rem;
                    color: #888;
                    text-transform: uppercase;
                    border-bottom: 1px solid var(--lumina-border);
                    padding-bottom: 5px;
                    margin-bottom: 10px;
                }

                .data-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 0.85rem;
                }
                .data-val {
                    font-weight: bold;
                    color: var(--boiler-on);
                }

                .data-row.interactive {
                    cursor: pointer;
                    transition: all 0.2s;
                    padding: 4px;
                    border-radius: 4px;
                }
                .data-row.interactive:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }

                .circuits-pane {
                    grid-column: 1 / -1;
                    background: var(--panel-bg);
                    border-radius: 12px;
                    padding: 15px;
                    border: 1px solid var(--lumina-border);
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    position: relative;
                }
                
                .circuit-box {
                    flex: 1;
                    min-width: 120px;
                    background: rgba(0,0,0,0.2);
                    padding: 10px;
                    border-radius: 8px;
                    border-left: 3px solid #ff9900;
                    text-align: center;
                }
                .circuit-box.rad-color { border-left-color: #00aaff; }

                .circuit-title { font-size: 0.8rem; opacity: 0.8; margin-bottom: 5px; }
                .circuit-temps { font-weight: bold; font-size: 1rem; }
                .circuit-temps .actual { color: #fff; }
                .circuit-temps .target { color: #ff9900; font-size: 0.8rem;}

                /* GSAP pipes placeholder */
                .pipes-svg {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: none;
                    z-index: 10;
                }
                .pipe-line {
                    fill: none;
                    stroke: var(--boiler-on);
                    stroke-width: 2;
                    stroke-dasharray: 10;
                    stroke-dashoffset: 100;
                    opacity: 0.5;
                }

                /* MODAL */
                .modal-overlay {
                    display: none;
                    position: absolute;
                    top:0; left:0; width:100%; height:100%;
                    background: rgba(0,0,0,0.7);
                    z-index: 999;
                    justify-content: center;
                    align-items: center;
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    background: var(--lumina-bg);
                    padding: 20px;
                    border-radius: 12px;
                    border: 1px solid var(--lumina-glow);
                    text-align: center;
                    width: 250px;
                }
                .modal-content input {
                    width: 80%;
                    padding: 10px;
                    margin: 15px 0;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid var(--lumina-border);
                    color: white;
                    border-radius: 5px;
                    font-size: 16px;
                    text-align: center;
                }
                .modal-content button {
                    background: var(--boiler-on);
                    color: #000;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                }
            </style>
            
            <div class="lumina-card state-off">
                <div class="boiler-pane">
                    <h2>Viessmann</h2>
                    <!-- Placeholder Boiler Graphic -->
                    <svg width="120" height="200" viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="10" y="10" width="80" height="180" rx="10" fill="#222" stroke="#444" stroke-width="2"/>
                        <circle cx="50" cy="50" r="20" fill="#111" stroke="#00ffd5" stroke-width="2"/>
                        <rect x="30" y="100" width="40" height="20" rx="4" fill="#111" />
                        <text x="35" y="114" fill="#00ffd5" font-size="10" font-family="sans-serif">21°C</text>
                    </svg>
                    <div style="margin-top: 15px; font-size: 0.8rem; color: #aaa;">Kotol</div>
                </div>

                <div class="data-pane">
                    <!-- Sensors -->
                    <div class="data-group">
                        <h3>Čidlá & Energia</h3>
                        ${SENSORS.map(s => `
                            <div class="data-row">
                                <span class="data-lbl">${getName(s.id, s.name)}</span>
                                <span class="data-val val-${s.id}">--</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Controls and Diagnostics -->
                    <div class="data-group">
                        <h3>Ovládanie (Kliknite)</h3>
                        ${CONTROLS.map(c => `
                            <div class="data-row interactive" data-ctrl="${c.id}">
                                <span class="data-lbl">${getName(c.id, c.name)}</span>
                                <span class="data-val val-${c.id}">--</span>
                            </div>
                        `).join('')}
                        
                        <h3 style="margin-top:15px;">Diagnostika</h3>
                        ${DIAGNOSTICS.map(d => `
                            <div class="data-row">
                                <span class="data-lbl">${getName(d.id, d.name)}</span>
                                <span class="data-val val-${d.id}">--</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Circuits Box -->
                <div class="circuits-pane">
                    <svg class="pipes-svg">
                        <!-- Example GSAP animated pipe flow from boiler side to top circuits -->
                        <path class="pipe-line pipe-flow" d="M -100 50 L 50 50 L 50 -50" />
                    </svg>
                    ${okruhyHtml}
                    ${radiatorsHtml}
                </div>

                <!-- Modal Overlay -->
                <div class="modal-overlay">
                    <div class="modal-content">
                        <h3>Zmeniť hodnotu</h3>
                        <input type="number" id="modal-input" step="0.5" />
                        <button id="modal-save">OK</button>
                        <button id="modal-close" style="background: #333; color:#fff; margin-left: 5px;">Zrušiť</button>
                    </div>
                </div>
            </div>
        `;

    this.shadowRoot.innerHTML = template;

    // Modal Events
    this.shadowRoot.querySelectorAll('.interactive').forEach(el => {
      el.addEventListener('click', (e) => {
        let ctrlId = el.getAttribute('data-ctrl');
        let curVal = el.querySelector('.data-val').innerText;
        this.openModal(ctrlId, curVal);
      });
    });

    this.shadowRoot.querySelector('#modal-close').addEventListener('click', () => this.closeModal());
    this.shadowRoot.querySelector('#modal-save').addEventListener('click', () => this.saveModal());

    this.updateStateValues();
  }

  static getConfigElement() {
    return document.createElement("ha-vitodens-pro-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:ha-vitodens-pro",
    };
  }
}
customElements.define("ha-vitodens-pro", HaVitodensPro);

// Editor Card
class HaVitodensProEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = { ...config };
    this.render();
  }

  get config() { return this._config; }

  set hass(hass) {
    this._hass = hass;
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-entity-picker").forEach(el => {
        el.hass = hass;
      });
    }
  }

  get hass() {
    return this._hass;
  }

  configChanged(ev) {
    if (!this._config || !this.hass) return;
    const target = ev.target;
    const configVal = target.getAttribute("configValue") || target.configValue;
    if (configVal) {
      const value = (ev.detail && ev.detail.value !== undefined) ? ev.detail.value : target.value;
      this._config = { ...this._config, [configVal]: value };
      window.dispatchEvent(
        new CustomEvent("config-changed", {
          detail: { config: this._config },
          bubbles: true,
          composed: true
        })
      );
    }
  }

  render() {
    if (!this.shadowRoot) return;

    const generatePicker = (label, id) => `
            <div class="mapping-row">
                <div class="mapping-title">${label}</div>
                <div class="mapping-inputs">
                    <ha-entity-picker
                        configValue="${id}"
                        label="Vybrať entitu (Entity ID)"
                        allow-custom-entity
                    ></ha-entity-picker>
                    <ha-textfield
                        label="Vlastný názov (voliteľné)"
                        configValue="${id}_name"
                    ></ha-textfield>
                </div>
            </div>
        `;

    const template = `
            <style>
                :host {
                    --lumina-cyan: #00ffd5;
                    --lumina-glow: rgba(0, 255, 213, 0.4);
                }
                .card-config {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 8px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .editor-header {
                    padding: 16px;
                    background: linear-gradient(90deg, #111, #222);
                    border-radius: 12px;
                    border: 1px solid #333;
                    margin-bottom: 8px;
                    border-left: 4px solid var(--lumina-cyan);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                }
                .editor-header h2 { margin: 0; font-size: 1.1rem; color: #fff; }
                .editor-header p { margin: 5px 0 0; font-size: 0.8rem; color: #aaa; }

                details.section {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    overflow: hidden;
                    margin-bottom: 8px;
                    transition: all 0.3s ease;
                }
                details.section[open] {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(0, 255, 213, 0.3);
                    box-shadow: 0 0 15px rgba(0, 255, 213, 0.05);
                }
                .section-summary {
                    font-weight: bold;
                    font-size: 0.95rem;
                    padding: 14px 16px;
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    list-style: none;
                    user-select: none;
                }
                .section-summary:hover { background: rgba(255,255,255,0.08); }
                .section-summary::-webkit-details-marker { display: none; }
                .section-summary::after {
                    content: '\u25BC';
                    font-size: 0.8rem;
                    transition: transform 0.3s ease;
                    color: var(--lumina-cyan);
                }
                details.section[open] .section-summary::after { transform: rotate(180deg); }

                .section-content { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

                .mapping-row {
                    background: rgba(0,0,0,0.2);
                    border-radius: 10px;
                    padding: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .mapping-title {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--lumina-cyan);
                    letter-spacing: 0.5px;
                }
                .mapping-inputs {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }
                @media (max-width: 500px) {
                    .mapping-inputs { grid-template-columns: 1fr; }
                }

                ha-entity-picker, ha-textfield, ha-select {
                    --mdc-theme-primary: var(--lumina-cyan);
                    --mdc-text-field-fill-color: rgba(255,255,255,0.03);
                    --mdc-text-field-ink-color: #fff;
                    --mdc-text-field-label-ink-color: #aaa;
                }

                .row-select { margin-top: 5px; }
            </style>
            
            <div class="card-config">
                <div class="editor-header">
                    <h2>HA Vitodens Pro</h2>
                    <p>Konfigurácia karty a mapovanie dátových bodov</p>
                </div>

                <details class="section" open>
                    <summary class="section-summary">Hlavný kotol</summary>
                    <div class="section-content">
                        ${generatePicker("Stav kotla", "boiler_state")}
                    </div>
                </details>

                <details class="section">
                    <summary class="section-summary">Čidlá (Energia, teploty, spotreba)</summary>
                    <div class="section-content">
                        ${SENSORS.map(s => generatePicker(s.name, s.id)).join('')}
                    </div>
                </details>

                <details class="section">
                    <summary class="section-summary">Ovládanie a nastavenia</summary>
                    <div class="section-content">
                        ${CONTROLS.map(c => generatePicker(c.name, c.id)).join('')}
                    </div>
                </details>

                <details class="section">
                    <summary class="section-summary">Diagnostika</summary>
                    <div class="section-content">
                        ${DIAGNOSTICS.map(d => generatePicker(d.name, d.id)).join('')}
                    </div>
                </details>

                <details class="section">
                    <summary class="section-summary">Okruhy (Max 5)</summary>
                    <div class="section-content">
                        ${[1, 2, 3, 4, 5].map(i => `
                            <div class="mapping-row">
                                <div class="mapping-title">Okruh ${i}</div>
                                <div class="row-select">
                                    <ha-select
                                        label="Typ okruhu"
                                        configValue="circuit_${i}_type"
                                        fixedMenuPosition
                                        naturalMenuWidth
                                    >
                                        <ha-list-item value="podlaha">Podlaha</ha-list-item>
                                        <ha-list-item value="radiatory">Radiátory</ha-list-item>
                                        <ha-list-item value="stropne">Stropné (Kúrenie/Chladenie)</ha-list-item>
                                    </ha-select>
                                </div>
                                <div class="mapping-inputs">
                                    <ha-entity-picker
                                        configValue="circuit_${i}_temp"
                                        label="Aktuálna teplota"
                                        allow-custom-entity
                                    ></ha-entity-picker>
                                    <ha-entity-picker
                                        configValue="circuit_${i}_target"
                                        label="Žiadaná teplota"
                                        allow-custom-entity
                                    ></ha-entity-picker>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </details>

                <details class="section">
                    <summary class="section-summary">Radiátory samostatne (Max 5)</summary>
                    <div class="section-content">
                        ${[1, 2, 3, 4, 5].map(i => generatePicker(`Radiátor ${i}`, `radiator_${i}_temp`)).join('')}
                    </div>
                </details>
            </div>
        `;

    this.shadowRoot.innerHTML = template;

    // Manual binding after render for vanilla JS
    this.shadowRoot.querySelectorAll("ha-entity-picker, ha-textfield, ha-select").forEach(el => {
      const configVal = el.getAttribute("configValue");
      if (el.tagName === 'HA-ENTITY-PICKER') {
        el.hass = this.hass;
        el.value = this._config[configVal] || "";
        el.addEventListener('value-changed', (ev) => this.configChanged(ev));
      } else if (el.tagName === 'HA-TEXTFIELD') {
        el.value = this._config[configVal] || "";
        el.addEventListener('input', (ev) => this.configChanged(ev));
      } else if (el.tagName === 'HA-SELECT') {
        el.value = this._config[configVal] || "radiatory";
        el.addEventListener('closed', (ev) => ev.stopPropagation());
        el.addEventListener('selected', (ev) => this.configChanged(ev));
      }
    });
  }
}
customElements.define("ha-vitodens-pro-editor", HaVitodensProEditor);

// Registration for Lovelace Dashboard Picker
window.customCards = window.customCards || [];
window.customCards.push({
  type: "ha-vitodens-pro",
  name: "HA Vitodens Pro",
  description: "Moderná vizualizácia SCADA pre kotly Vitodens v Lumina dizajne",
  preview: true
});
