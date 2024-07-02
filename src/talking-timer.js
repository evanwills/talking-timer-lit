import { LitElement, css, html } from 'lit';
// import {customElement, property} from 'lit/decorators.js';
import litLogo from './assets/lit.svg'
import viteLogo from '/vite.svg'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class TalkingTimer extends LitElement {
  static get properties() {
    return {
      saystart: { type: Boolean, default: false },
      nosayend: { type: Boolean, default: false },
      noendchime: { type: Boolean, default: false },
      autoreset: { type: Boolean, default: false },
      endMessage: { type: String },
      say: { type: String },
      /**
       * Copy for the read the docs hint.
       */
      noPause: { type: Boolean, default: false },
      sayStart: { type: Boolean, default: false },

      /**
       * The number of times the button has been clicked.
       */
      time: { type: String },
      selfdestruct: { type: Number },
    }
  }

  constructor() {
    super()
    this.docsHint = 'Click on the Vite and Lit logos to learn more'
    this.count = 0
  }

  render() {
    return html`
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src=${viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://lit.dev" target="_blank">
          <img src=${litLogo} class="logo lit" alt="Lit logo" />
        </a>
      </div>
      <slot></slot>
      <div class="card">
        <button @click=${this._onClick} part="button">
          count is ${this.count}
        </button>
      </div>
      <p class="read-the-docs">${this.docsHint}</p>
    `
  }

  _onClick() {
    this.count++
  }

  static get styles() {
    return css`
    `
  }
}

window.customElements.define('talking-timer', TalkingTimer);
