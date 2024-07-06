import { LitElement, css, html } from 'lit';
import { isNum, makeNullNum } from '../utils/general.utils';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class TimeDisplay extends LitElement {
  static properties = {
    fraction: { type: String },
    hours: { type: Number },
    hundredths: { type: Boolean },
    label: { type: String },
    minutes: { type: Number },
    progress: { type: Number },
    seconds: { type: Number },
  }
  constructor() {
    super();

    this.hours = null;
    this.minutes = null;
    this.seconds = null;
    this.fraction = null;
    this.progress = null;
    this.label = '';

    this._hours = null;
    this._minutes = null;
    this._seconds = null;
    this._fraction = null;
    this._progress = null;
  }


  validateAttrs() {
    this._hours = makeNullNum(this.hours);
    this._minutes = makeNullNum(this.minutes, this._hours);
    this._seconds = makeNullNum(this.seconds, this._minutes);
    this._progress = isNum(this.progress)
      ? this.progress
      : null;

    if (typeof this.fraction === 'string' && this.fraction.trim() !== '') {
      this._fraction = (this.hundredths !== true)
        ? this.fraction.substring(0, 1)
        : this.fraction;
    }

    if (this._progress !== null && this._progress > 100 ||this._progress < 0) {
      throw new Error(
        '<time-display> expects `progress` attribute to be omitted '
        + `or a decimal between 0 & 100. "${this._progress}" given`,
      )
    }
  }

  colon(input, sep = ':') {
  const tmp = (sep === '.')
    ? 'colon colon--point'
    : 'colon'
    return (input !== null)
      ? html`<span class="${tmp}">${sep}</span>`
      : ''
  }

  num(input, small = false) {
    const tmp = (small === true)
      ? 'num num--small'
      : 'num'
    return (input !== null)
      ? html`<span class="${tmp}">${input}</span>`
      : ''
  }

  connectedCallback() {
    super.connectedCallback();

    this.validateAttrs();
  }

  wholeClass() {
    return (this._progress !== null)
      ? 'whole whole--w-progress'
      : 'whole';
  }

  render() {
    console.group('render()');
    console.log('this.progress:', this.progress);
    console.log('this._progress:', this._progress);
    console.groupEnd();
    return html`
      <div>
        <span class="${this.wholeClass()}">
          ${this.num(this._hours)}
          ${this.colon(this._hours)}
          ${this.num(this._minutes)}
          ${this.colon(this._minutes)}
          ${this.num(this._seconds)}
          ${this.colon(this._fraction, '.')}
          ${this.num(this._fraction, true)}
        </span>
        ${(this._progress !== null)
          ? html`
            <label for="tmpProg">
              Time remaining
              ${(this.label.trim() !== '') ? `for ${this.label}` : ''}
            </label>
            <progress id="tmpProg" max="100" .value="${this._progress}" tabindex="0">${this._progress}$</progress>`
          : ''
        }
      </div>
    `;
  }

  static get styles () {
    return css`
      div {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }
      .whole {
        align-items: center;
        display: flex;
        justify-content: center;
        padding
      }
      .whole--w-progress {
        padding-bottom: 0.5rem;
      }
      .num {
        line-height: 4rem;
        font-size: 4rem;
      }
      .num--small {
        align-self: flex-end;
        font-size: 2rem;
        line-height: 2.1rem;
      }
      .colon {
        font-size: 4rem;
        line-height: 4rem;
      }
      label {
        display: none;
        font-size: 0.875rem;
        text-align: center;
      }
      div:focus-within label {
        display: block;
      }`;
  }
}

window.customElements.define('time-display', TimeDisplay);
