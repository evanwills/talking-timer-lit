import { LitElement, css, html } from 'lit';
import { getEpre, millisecondsToTimeObj } from '../utils/talking-timer.utils';
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class TimeDisplay extends LitElement {
  static properties = {
    always: { type: String },
    milliseconds: { type: Number },
    label: { type: String },
    progress: { type: Number },
  }
  constructor() {
    super();
    this.milliseconds = null;
    this.progress = null;
    this.label = '';
    this.always = 'mst';

    this._ePre = getEpre('time-display');
  }

  connectedCallback() {
    super.connectedCallback();
  }

  colon(input, sep = ':') {
    const tmp = (sep === '.')
      ? 'colon colon--point'
      : 'colon';

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

  alwaysShow(key, current, previous = null) {
    let val = current;

    if (previous === null && (val === null || val === 0) && this.always.includes(key.substring(0, 1)) === false) {
      return null;
    }

    val = val.toString().substring(0, 2);

    return (previous === null)
      ? val
      : val.padStart(2, '0');
  }

  showNum(input, previous = null, small = false, sep = ':') {
    return html`
      ${(previous !== null)
        ? this.colon(input, sep)
        : ''
      }
      ${this.num(input, small)}
    `;
  }

  render() {
    const tmp = millisecondsToTimeObj(this.milliseconds);
    const hours = this.alwaysShow('hours', tmp.hours);
    const minutes = this.alwaysShow('minutes', tmp.minutes, hours);
    const seconds = this.alwaysShow('seconds', tmp.seconds, minutes);
    const tenths = this.alwaysShow('tenths', tmp.tenths, seconds);
    console.log()

    return html`
      <div class="human">
        <span class="whole">
          ${this.showNum(hours)}
          ${this.showNum(minutes, hours)}
          ${this.showNum(seconds, minutes)}
          ${this.showNum(tenths, seconds, true, '.')}
        </span>
        ${(this.progress !== null)
          ? html`
            <label for="tmpProg">
              Time remaining
              ${(this.label.trim() !== '') ? `for ${this.label}` : ''}
            </label>
            <progress id="tmpProg" max="100" .value="${this.progress}" tabindex="0">${this.progress}$</progress>`
          : ''
        }
      </div>
    `;
  }
  static get styles() {
    return css`
      div.human {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      }
      div.human .whole {
        align-items: center;
        display: flex;
        justify-content: center;
        padding
      }
      div.human:has(progress) .whole {
        padding-bottom: 0.5rem;
      }
      div.human .num {
        line-height: 4rem;
        font-size: 4rem;
      }
      div.human .num--small {
        align-self: flex-end;
        font-size: 2rem;
        line-height: 2.1rem;
      }
      div.human .colon {
        font-size: 4rem;
        line-height: 4rem;
      }
      div.human label {
        display: none;
        font-size: 0.875rem;
        text-align: center;
      }
      div.human:focus-within label {
        display: block;
      }
    `;
  }
}

window.customElements.define('time-display', TimeDisplay);
