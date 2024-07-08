import { LitElement, css, html } from 'lit';
import { getEpre, millisecondsToTimeObj, timeObjToString } from '../utils/talking-timer.utils';
import { getSelect } from './talking-timer.renderers';
import { getHumanOption, getSsTimerlabel, makeInt } from '../utils/general.utils';
import './talking-timer';

const timerOptions = [
  {
    label: '90 second',
    value: 90000,
  },
  {
    label: '2 minute',
    value: 120000,
  },
  {
    label: '3 minute',
    value: 180000,
  },
  {
    label: '4 minute',
    value: 240000,
  },
  {
    label: '5 minute',
    value: 3000000,
  },
];
const endCentering = 'You should be finishing centering and opening up';
const endOpening = 'You should be pulling up by now';

const reps = [];
for (let a = 1; a <= 10; a += 1) {
  reps.push({
    label: a.toString(),
    value: a,
  })
}

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class SpeedThrowing extends LitElement {
  static properties = {
    _duration: { type: Number, state: true },
    _repititions: { type: Number, state: true },
    _repCount: { type: Number, state: true },
    _doCylindars: { type: Boolean, state: true },
    _intermission: { type: Number, state: true },
    _timerState: { type: String, state: true },
    _confirmed: { type: Boolean, state: true },
    _totalMilli: { type: Boolean, state: true },
    _type: { type: String, state: true },
    _state: { type: String, state: true },
    _started: { type: Boolean, state: true },
  }
  constructor() {
    super();

    this._duration = '3:00';
    this._repititions = 5;
    this._repCount = 1;
    this._doCylindars = true;
    this._timerState = 'unset';
    this._intermission = 120000;
    this._confirmed = false;
    this._totalMilli = 180000;
    this._type = 'cylinders';
    this._state = ''
    this._started = false;

    this._dialogue = null;
    this._ePre = getEpre('speed-throwing');
    this._sayExtra = [
      {
        message: 'You should be finishing centering and opening up',
        offset: 115000,
      },
      {
        message: '',
        offset: 85000,
      },
    ];
    this._timer = null;
  }

  _getTimer(context) {
    return () => {
      if (context._timer === null) {
        context._timer = context.renderRoot?.querySelector('#speed-throwing-timer') ?? null;

        if (context._timer !== null) {
          context._timer.addEventListener(
            'statechange',
            context._handleTimerChange,
          );
        } else {
          setTimeout(context._getTimer(context), 1);
        }
      }
    };
  }

  _handleTimerChange(event) {
    console.group(this._ePre('_handleTimerChange'));
    console.log('event:', event);
    console.log('event.target:', event.target);
    console.log('event.target.id:', event.target.id);
    console.log('event.target.state:', event.target.state);
    switch (event.target.state) {
      case 'ended':
      break;

      case 'running':
        this._started = true;
        break;
    }
    console.groupEnd();
  }

  _handleChange(event) {
    const val = event.target.value;

    switch (event.target.id.substring(3)) {
      case 'confirm':
        this._confirmed = true;
        this._state = 'ready';
        this._dialogue.close();
        this._sayExtra = [
          {
            offset: Math.round(this._totalMilli / 3) - 5000,
            message: endCentering,
          },
          {
            offset: Math.round(this._totalMilli / 2) - 5000,
            message: endOpening,
          },
        ];
        setTimeout(this._getTimer(this), 1);
        break;
      case 'start':
        this._state = 'running';
        this._timer = this.renderRoot?.querySelector('#speed-throwing-timer') ?? null;
        if (this._timer !== null) {
          this._timer.addEventListener('statechange', this._handleTimerChange)
        }
        break;
      case 'config':
        this._dialogue.showModal();
        break;
      case 'duration':
        this._totalMilli = makeInt(val);
        this._duration = timeObjToString(millisecondsToTimeObj(this._totalMilli));
        break;
      case 'intermission':
        this.__intermission = makeInt(val);
        break;
      case 'repetitions':
        this._repetitions = makeInt(val);
        break;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    let a = 10;
    const cb = (context) => () => {
      if (context._dialogue === null) {
        context._dialogue = context.renderRoot?.querySelector('#speed-throwing-config') ?? null;

        console.log('context._dialogue:', context._dialogue);
        if (context._dialogue === null) {
          a -= 1;
          if (a > 0) {
            setTimeout(cb(context), 1 );
          }
        } else {
          context._dialogue.showModal();
        }
      }
    }
    setTimeout(cb(this), 1 );
  }

  iWillBe() {
    return html`
      <p>
        I will be throwing ${this._repititions},
        ${getHumanOption(timerOptions, this._totalMilli)}
        ${this._type}, with maximum of
        ${getHumanOption(timerOptions, this._intermission)}s
        break between each ${this._type.substring(0, this._type.length - 1)}.
      </p>
    `;
  }

  render() {
    return html`
      <article>
        <dialog id="speed-throwing-config">
          <div>
            <header><h1>Set up your speed throwing session</h1></header>
            <ul class="fields">
              <li>
                <div role="group" aria-labeledby="ss-type">
                  <span id="ss-type">
                    What are you throwing?
                  </span>
                  <ul class="radio">
                    <li>
                      <label id="ss-type--cylinders">
                        <input
                          class="hidden"
                          type="radio"
                          name="ss-type-radio"
                          value="cylinders"
                          ?checked=${this._doCylindars}
                          @change=${this._handleChange} />
                        Cylinders
                      </label>
                    </li>
                    <li>
                      <label id="ss-type--bowls">
                        <input
                          class="hidden"
                          type="radio"
                          name="ss-type-radio"
                          value="bowls"
                          ?checked=${!this._doCylindars}
                          @change=${this._handleChange} />
                        Bowls
                      </label>
                    </li>
                  </ul>
                </div>
              </li>
              ${getSelect('Throwing time', this._totalMilli, timerOptions, 'ss-duration', this._handleChange)}
              ${getSelect(`Break between ${this._type}`, this._intermission, timerOptions, 'ss-intermission', this._handleChange)}
              ${getSelect(`Number of ${this._type}`, this._repititions, reps, 'ss-repetitions', this._handleChange, '')}
            </ul>
            ${this.iWillBe()}
            <button type="button" value="confirm" id="ss-confirm" @click=${this._handleChange}>Confirm</button>
          </div>
        </dialog>

        ${(this._confirmed === true) ? this.iWillBe() : ''}

        ${(this._state !== 'running')
          ? html`<p><button type="button" value="config" id="ss-config" @click=${this._handleChange}>Configure</button></p>`
          : ''}

        ${(this._confirmed === true)
          ? html`<talking-timer
              id="speed-throwing-timer"
              .autoreset="${Math.round(this._intermission / 10)}"
              .autostartafter="${(this._started === true) ? this._intermission : -1}"
              .duration="${this._duration}"
              endmessage="Hands off your pots"
              .label="${getSsTimerlabel(this._type, this._repCount)}"
              .saydata=${this._sayExtra}></talking-timer>`
          : ''
        }


      </article>
    `;
  }
  static get styles() {
    return css`
      * {
        box-sizing: border-box;
      }
      dialog {
        max-width: 28rem;
        width: 100%:
      }
      dialog h1 {
        margin: 0 0 1rem;
        line-height: 1rem;
      }
      ul.fields {
        box-sizing: border-box;
        margin: 0 -1rem;
        padding: 0;
        list-style-type: none;
      }
      ul.fields > li {
        border-bottom: 0.05rem solid #fff;
        margin: 0;
        padding: 0;
      }
      ul.fields > li div {
        box-sizing: border-box;
        display: flex;
        column-gap: 1rem;
        margin: 0;
        list-style-type: none;
        padding: 0 1rem 0 0;
      }
      ul.fields > li:first-child {
        border-top: 0.05rem solid #fff;
      }
      ul.fields > li > div > label,
      ul.fields > li > div > span {
        display: inline-block;
        padding: 0.5rem 1rem;
        min-width: 13rem;
      }
      ul.fields select {
      flex-grow: 1;
      }

      ul.radio {
        box-sizing: border-box;
        display: inline-flex;
        margin: flex;
        column-gap: 1rem;
        list-style-type: none;
        justify-content: start;
        align-items: center;
      margin: 0;
        padding: 0;
      }
      ul.radio > li {
        box-sizing: border-box;
        border: none;
        margin: 0;
        padding: 0;
      }
      ul.radio label {
        box-sizing: border-box;
        padding: 0.5rem;
        cursor: pointer;
      }
      ul.radio label:hover, ul.radio label:focus-within {
        outline: 0.05rem solid #570;
        outline-offset: 0.2rem;
        background-color: #777;
      }
      ul.radio label:has(> input:checked) {
        background-color: #040;
      }
      /**
       * Copied from Bootstrap 5.x CSS
       */
      .hidden {
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
    `;
  }
}

window.customElements.define('speed-throwing', SpeedThrowing);
