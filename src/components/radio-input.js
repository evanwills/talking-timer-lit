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

  renderInput(id, label, value, defaultVal, changer) {
    return html`
      <li>
        <input
          ?checked="${value == defaultVal}"
          .id="${id}-${value}"
          .name="${id}"
          type="radio"
          .value="${value}"
          @change=${changer} />
        <label for="${id}-${value}">${label}</label>
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
            this.value,
            this._changeHandler,
          ))}
        </ul>
      </li>`;
  }

  static get styles() {
    return css`
        li {
          border-bottom: 0.05rem solid #fff;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
        }
        span.label {
          display: inline-block;
          padding: 0.5rem 1rem;
          min-width: 11rem;
        }
        ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
          display: flex;
          border: 0.05rem solid #fff;
          border-radius: 5rem;
        }
        ul li {
          padding: 0;
          margin: 0;
          border: none;
        }
        input {
          border: 0 !important;
          clip: rect(0,0,0,0) !important;
          height: 1px !important;
          margin: -1px !important;
          overflow: hidden !important;
          padding: 0 !important;
          position: absolute !important;
          white-space: nowrap !important;
          width: 1px !important;
        }
        ul li:nth-child(odd) label {
          border-right: none;
        }
        ul li:nth-child(even) label {
          border-left: none;
        }
        label {
          padding: 0.15rem 1.5rem;
          border-radius: 10rem;
          position: relative;
          display: inline-block;
          cursor: pointer;
          line-height: 1.3rem;
        }
        input:checked + label {
          background-color: #fff;
          border: 0.05rem solid #fff;
          color: #000;
          margin: -0.05rem;
          padding: 0.25rem 0.75rem 0.25rem 2.25rem;
        }
        input:checked + label::before {
          border: 0.175rem solid #000;
          border-radius: 10rem;
          content: '\\02518';
          display: block;
          font-size: 1.1rem;
          font-weight: bold;
          height: 1.1rem;
          left: 1rem;
          line-height: 1.5rem;
          opacity: 1;
          position: absolute;
          padding-left: 0.25rem;
          top: 50%;
          text-align: center;
          transform: translate(-50%, -50%) rotate(30deg) ;
          width: 1.1rem;
        }
      `;
  }
}


window.customElements.define('radio-input', RadioInput);
