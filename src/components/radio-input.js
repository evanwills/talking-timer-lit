import { LitElement, css, html } from 'lit';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class RadioInput extends LitElement {
  static properties = {
    options: { type: Array },
    value: { type: String, reflect: true },
    label: { type: String },
    id: { type: String },
  }
  constructor() {
    super();

    this.options = [];
    this.value = '';
    this.label = '';
    this.id = '';
  }

  _changeHandler(event) {
    this.value = event.target.value;

    this.dispatchEvent(
      new Event('change', { bubbles: true, composed: true }),
    );
  }


  connectedCallback() {
    super.connectedCallback();
  }

  renderInput(id, label, value, changer, defaultVal) {
    return html`
      <li>
        <input
          ?checked="${value == defaultVal}"
          .id="${id}-${value}"
          .name="${id}"
          type="radio"
          .value="${value}"
          @change=${changer} />
        <label :for="${id}-${value}">${label}</label>
      </li>`
  }

  render() {
    const descID = `${this.id}--desc-by`;
    return html`
      <li>
        <span class="label" id="${descID}">${this.label}</span>
        <ul
          role="group"
          aria-labelledby="${descID}">

          ${this.options.map((option) => this.renderInput(
            this.id,
            option.label,
            option.value,
            this._changeHandler,
            this.value,
          ))}
        </ul>
      </li>`;
  }

  static get styles() {
    return css`
      `;
  }
}


window.customElements.define('radio-input', RadioInput);
