import { LitElement, type TemplateResult, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getEpre, millisecondsToTimeObj } from '../utils/talking-timer.utils.ts';
import type { ITimeObj } from '../types/generic-types.d.ts';

@customElement('time-display')
export class TimeDisplay extends LitElement {
  @property({ type: String, attribute: 'always' })
  always : string = 'mst';

  @property({ type: Number, attribute: 'milliseconds' })
  milliseconds : number = 0;

  @property({ type: String, attribute: 'label' })
  label : string = '';

  @property({ type: Number, attribute: 'progress' })
  progress : number = 0;

  @state()
  _ePre : Function = getEpre('time-display');


  connectedCallback() {
    super.connectedCallback();
  }

  colon(input : string | null, sep : string = ':') : TemplateResult | string {
    const tmp = (sep === '.')
      ? 'colon colon--point'
      : 'colon';

    return (input !== null)
      ? html`<span class="${tmp}">${sep}</span>`
      : ''
  }

  num(input : string | null, small : boolean = false) : TemplateResult | string {
    const tmp = (small === true)
      ? 'num num--small'
      : 'num'
    return (input !== null)
      ? html`<span class="${tmp}">${input}</span>`
      : ''
  }

  alwaysShow(
    key : string,
    current : number,
    previous : string | null = null,
    len : number = 2,
  ) : string | null {
    if (previous === null
      && (current === null || current === 0)
      && this.always.includes(key.substring(0, 1)) === false
    ) {
      return null;
    }

    const val : string = (typeof current === 'number')
      ? current.toString().substring(0, len)
      : '';

    return (previous === null)
      ? val
      : val.padStart(len, '0');
  }

  showNum(
    input : string | null,
    previous : string | null = null,
    small : boolean = false,
    sep : string = ':',
  ) : TemplateResult | string {
    return html`
      ${(previous !== null)
        ? this.colon(input, sep)
        : ''
      }
      ${this.num(input, small)}
    `;
  }

  render() : TemplateResult {
    const tmp : ITimeObj = millisecondsToTimeObj(this.milliseconds);
    const hours : string | null = this.alwaysShow('hours', tmp.hours);
    const minutes : string | null = this.alwaysShow('minutes', tmp.minutes, hours);
    const seconds : string | null = this.alwaysShow('seconds', tmp.seconds, minutes);
    const tenths : string | null = this.alwaysShow('tenths', tmp.tenths, seconds, 1);

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

  static styles = css`
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
    div.human progress {
      display: block;
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap { 'time-display': TimeDisplay }
};
