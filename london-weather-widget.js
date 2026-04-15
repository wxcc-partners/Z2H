/**
 * london-weather-widget.js
 * Self-contained WxCC header weather widget for London.
 * Uses Open-Meteo free API (no API key required, CORS-enabled).
 * Host this file on any web server (e.g. GitHub Pages) and reference
 * it from the desktop layout JSON via the "script" property.
 */
(function () {
  const WMO_ICONS = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '❄️',
    77: '🌨️', 80: '🌦️', 81: '🌧️', 82: '⛈️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  };

  const API_URL =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=51.5074&longitude=-0.1278' +
    '&current=temperature_2m,apparent_temperature,weather_code' +
    '&wind_speed_unit=ms&timezone=Europe%2FLondon';

  const STYLES = `
    :host {
      display: inline-flex;
      align-items: center;
    }
    .widget {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      font-family: "CiscoSansTT", Arial, sans-serif;
      cursor: default;
      border-left: 1px solid rgba(255,255,255,0.15);
    }
    .icon { font-size: 20px; line-height: 1; }
    .info { display: flex; flex-direction: column; line-height: 1.25; }
    .label {
      font-size: 10px;
      opacity: 0.7;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--wx-header-text, #fff);
    }
    .temp {
      font-size: 14px;
      font-weight: 700;
      color: var(--wx-header-text, #fff);
    }
    .feels {
      font-size: 10px;
      opacity: 0.6;
      color: var(--wx-header-text, #fff);
    }
    .error { font-size: 11px; color: #ff6b6b; padding: 0 8px; }
  `;

  class LondonWeatherWidget extends HTMLElement {
    constructor() {
      super();
      this._shadow = this.attachShadow({ mode: 'open' });
      this._intervalId = null;
    }

    connectedCallback() {
      this._render('⏳', '--', '--');
      this._fetch();
      // Refresh every 5 minutes
      this._intervalId = setInterval(() => this._fetch(), 5 * 60 * 1000);
    }

    disconnectedCallback() {
      if (this._intervalId) clearInterval(this._intervalId);
    }

    _render(icon, temp, feels) {
      this._shadow.innerHTML = `
        <style>${STYLES}</style>
        <div class="widget" title="London weather — updates every 5 min">
          <span class="icon">${icon}</span>
          <div class="info">
            <span class="label">🇬🇧 London</span>
            <span class="temp">${temp}</span>
            <span class="feels">Feels ${feels}</span>
          </div>
        </div>`;
    }

    _renderError() {
      this._shadow.innerHTML = `
        <style>${STYLES}</style>
        <div class="widget">
          <span class="icon">🌡️</span>
          <div class="info">
            <span class="label">London</span>
            <span class="error">Unavailable</span>
          </div>
        </div>`;
    }

    async _fetch() {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const cur = data.current;
        const icon = WMO_ICONS[cur.weather_code] ?? '🌡️';
        const temp = cur.temperature_2m.toFixed(1) + '°C';
        const feels = cur.apparent_temperature.toFixed(1) + '°C';
        this._render(icon, temp, feels);
      } catch (_) {
        this._renderError();
      }
    }
  }

  if (!customElements.get('london-weather-widget')) {
    customElements.define('london-weather-widget', LondonWeatherWidget);
  }
})();
