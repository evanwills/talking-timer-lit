import { LitElement, css, html } from 'lit';
// import { ifDefined } from 'lit/directives/if-defined.js';
// import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getBtn, getRepOptions, iWillBe, makeInt } from '../utils/speed-throwing.utils';
import { getRadio, getSelect } from './talking-timer.renderers';
import { getEpre } from '../utils/talking-timer.utils';

const boolOptions = [
  { label: 'No', value: 'true' },
  { label: 'Yes', value: 'false' },
];
const audienceOptions = [
  { label: 'Me', value: 'I' },
  { label: 'Group', value: 'We' },
  { label: 'Students', value: 'You' },
];
const lenOptions = [
  { label: 'None', value: '0' },
  { label: 'Short', value: '1' },
  { label: 'Medium', value: '2' },
  { label: 'Long', value: '3' },
];
const timerOptions = [
  {
    label: '30 second',
    value: 30000,
  },
  {
    label: '60 second',
    value: 60000,
  },
  {
    label: '90 second',
    value: 90000,
  },
  {
    label: '2 minute',
    value: 120000,
  },
  {
    label: '2.5 minute',
    value: 150000,
  },
  {
    label: '3 minute',
    value: 180000,
  },
  {
    label: '3.5 minute',
    value: 210000,
  },
  {
    label: '4 minute',
    value: 240000,
  },
  {
    label: '4.5 minute',
    value: 270000,
  },
  {
    label: '5 minute',
    value: 300000,
  },
  {
    label: '6 minute',
    value: 360000,
  },
  {
    label: '7 minute',
    value: 420000,
  },
  {
    label: '8 minute',
    value: 480000,
  },
  {
    label: '9 minute',
    value: 540000,
  },
  {
    label: '10 minute',
    value: 600000,
  },
];

const reps = getRepOptions();

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class SpeedThrowingConfig extends LitElement {
  static properties = {
    doCylinders: { type: Boolean, attribute: 'do-cylinders' },
    duration: { type: Number },
    intermission: { type: Number },
    noEndChime: { type: Boolean, attribute: 'no-end-chime' },
    noSayHelp: { type: Boolean, attribute: 'no-say-help' },
    repetitions: { type: Number },
    saySessionEnd: { type: Number, attribute: 'say-session-end' },
    saySessionStart: { type: Number, attribute: 'say-session-start' },
    who: { type: String },

    _doCylinders: { type: Boolean, state: true },
    _duration: { type: Number, state: true },
    _intermission: { type: Number, state: true },
    _noEndChime: { type: Boolean, state: true },
    _noSayHelp: { type: Boolean, state: true },
    _repetitions: { type: Number, state: true },
    _saySessionEnd: { type: Number, state: true },
    _saySessionStart: { type: Number, state: true },
    _who: { type: String, state: true },
  }
  constructor() {
    super();
    this.doCylinders = false;
    this.duration = 180000;
    this.intermission = 90000;
    this.noEndChime = false;
    this.noSayHelp = false;
    this.repetitions = 5;
    this.saySessionEnd = 0;
    this.saySessionStart = 0;
    this.who = 'I';

    this._ePre = getEpre('<speed-throwing-config>');
    this._dialogue = null;

    this._setFromAttr();
  }

  _setFromAttr() {
    this._doCylinders = this.doCylinders;
    this._duration = this.duration;
    this._intermission = this.intermission;
    this._noEndChime = this.noEndChime;
    this._noSayHelp = this.noSayHelp;
    this._repetitions = this.repetitions;
    this._saySessionEnd = this.saySessionEnd;
    this._saySessionStart = this.saySessionStart;
    this._who = this.who;

    this._setType();
    this._setIwillBe();
  }

  connectedCallback() {
    super.connectedCallback();
    let a = 10;
    const cb = (context) => () => {
      if (context._dialogue === null) {
        context._dialogue = context.renderRoot?.querySelector('#speed-throwing-config') ?? null;

        if (context._dialogue === null) {
          a -= 1;
          if (a > 0) {
            setTimeout(cb(context), 10);
          }
        } else if (context._confirmed === false) {
          context._dialogue.showModal();
        }
      }
    }
    setTimeout(cb(this), 10);
    this._setFromAttr();
  }

  _setIwillBe() {
    this._iWillBe = iWillBe(
      this._who,
      this._repetitions,
      this._duration,
      this._intermission,
      this._type,
      timerOptions,
    );
  }

  _setType() {
    this._type = (this._doCylinders === true)
      ? 'cylinders'
      : 'bowls';
  }

  _handleChange(event) {
    const val = event.target.value;

    switch (event.target.id.substring(3)) {
      case 'close':
        this._dialogue.close();
        this._setFromAttr();
        break;

      case 'config':
        this._dialogue.showModal();
        break;

      case 'confirm':
        this._dialogue.close();
        const detail = {
          doCylinders: this._doCylinders,
          duration: this._duration,
          intermission: this._intermission,
          iWillBe: this._iWillBe,
          noEndChime: this._noEndChime,
          noSayHelp: this._noSayHelp,
          repetitions: this._repetitions,
          saySessionEnd: this._saySessionEnd,
          saySessionStart: this._saySessionStart,
          who: this._who,
        };

        this.dispatchEvent(
          new CustomEvent(
            'confirmconfig',
            { bubbles: true, composed: true, detail },
          ),
        );
        break;

      case 'duration':
        this._duration = makeInt(val);
        this._setIwillBe();
        break;

      case 'intermission':
        this._intermission = makeInt(val);
        this._setIwillBe();
        break;

      case 'repetitions':
        this._repetitions = makeInt(val);
        this._setIwillBe();
        break;

      case 'type--cylinders':
        this._doCylinders = true;
        this._type = val;
        this._setIwillBe();
        break;

      case 'type--bowls':
        this._doCylinders = false;
        this._type = val;
        this._setIwillBe();
        break;
    }
  }

  _handleRadioChange(event) {
    const { id, value } = event.target;

    switch (id) {
      case 'no-end-chime':
        this._noEndChime = (value === 'true');
        break;

      case 'say-session-end':
        this._saySessionEnd = parseInt(value, 10);
        break;

      case 'no-say-help':
        this._noSayHelp = (value === 'true');
        break;

      case 'say-session-start':
        this._saySessionStart = parseInt(value, 10);
        break;

      case 'target-audience':
        this._who = value;
        this._setIwillBe();
        break;
    }
  }


  render() {
    return html`<div>
        <p>${getBtn('config', 'Change settings', this._handleChange)}</p>
        <dialog id="speed-throwing-config">
          <label
            id="ss-close-label"
            for="ss-close"
            title="Close settings without saving">
            <span class="hidden">Close settings</span>
          </label>
          <div id="speed-throwing-config-outer">
            <header><h1>Set up your speed throwing session</h1></header>
            <main>
              <ul class="fields">
                <li>
                  <div role="group" aria-labeledby="ss-type">
                    <span id="ss-type">
                      What are you throwing?
                    </span>
                    <ul class="radio">
                      ${getRadio('Cylinders', this._doCylinders, this._handleChange)}
                      ${getRadio('Bowls', !this._doCylinders, this._handleChange)}
                    </ul>
                  </div>
                </li>
                ${getSelect(
                  `Number of ${this._type}`,
                  this._repetitions,
                  reps,
                  'ss-repetitions',
                  this._handleChange,
                  '',
                )}
                ${getSelect(
                  'Throwing time',
                  this._duration,
                  timerOptions,
                  'ss-duration',
                  this._handleChange,
                )}
                ${getSelect(
                  `Break between ${this._type}`,
                  this._intermission,
                  timerOptions,
                  'ss-intermission',
                  this._handleChange
                )}
                <radio-input
                  id="target-audience"
                  label="Target audience"
                  .options=${audienceOptions}
                  .value="${this._who}"
                  @change=${this._handleRadioChange}></radio-input>
                <radio-input
                  id="say-session-start"
                  label="Say session intro"
                  .options=${lenOptions}
                  .value="${this._saySessionStart}"
                  @change=${this._handleRadioChange}></radio-input>
                <radio-input
                  id="no-say-help"
                  label="Say in session info"
                  .options=${boolOptions}
                  .value="${(this._noSayHelp !== true) ? 'true' : 'false'}"
                  @change=${this._handleRadioChange}></radio-input>
                <radio-input
                  id="no-end-chime"
                  label="Play end chime"
                  .options=${boolOptions}
                  .value="${(this._noEndChime === true) ? 'true' : 'false'}"
                  @change=${this._handleRadioChange}></radio-input>
                <radio-input
                  id="say-session-end"
                  label="Say end of session info"
                  .options=${lenOptions}
                  .value="${this._saySessionEnd}"
                  @change=${this._handleRadioChange}></radio-input>
              </ul>
            </main>
            <footer>
              ${this._iWillBe}
              <button
                class="special-btn config-btn"
                id="ss-confirm"
                type="button"
                value="confirm"
                @click=${this._handleChange}>Save settings</button>
            </footer>
          </div>
          <button
            class="close-btn"
            id="ss-close"
            title="Close settings without saving"
            type="button"
            value="close"
            @click=${this._handleChange}>
            &Cross;
            <span class="hidden">Close setings</span>
          </button>
        </dialog>
    </div>`;
  }

  static get styles() {
    return css`
      * {
        box-sizing: border-box;
      }
      dialog {
      }
      #speed-throwing-config-outer {
        position: relative;
        z-index: 10;
      }

      button {
        cursor: pointer;
        border: none;
      }
      .special-btn {
        font-size: 1.125rem;
        font-weight: bold;
        padding: 0.5rem 1rem;
      }
      .config-btn {
        background-color: var(--st-btn-bg-colour, rgb(255, 239, 0));
        color: var(--st-btn-colour, #232323);
      }
      .abort-btn {
        background-color: var(--st-btn-bg-colour--abort, rgb(150, 0, 0));
        border: 0.05rem solid var(--st-btn-colour--abort, #fff);
        color: var(--st-btn-colour--abort, #fff);
      }
      .reset-btn {
        background-color: var(--st-btn-bg-colour--rest, rgb(0, 100, 0));
        border: 0.05rem solid var(--st-btn-colour--abort, #fff);
        color: var(--st-btn-colour--abort, #fff);
      }
      dialog {
        background: transparent;
        border: none;
        max-width: 39.5rem;
        width: 100%;
        z-index: 1;
      }
      dialog > div {
        background-color: var(--st-bg-colour, #111);
        border: var(--tt-border, 0.05rem solid #000);
        box-shadow: var(--tt-box-shadow, 0.5rem 0.5rem 0.5rem rgba(255, 255, 255, 0.7));
        max-width: 37.5rem
      }
      dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.8);
        background-color: var(--st-backdrop, rgba(0, 0, 0, 0.8));
      }
      dialog > div > footer {
        padding: 1rem;
      }
      dialog > div > footer p {
        margin: 0 0 1rem;
      }
      dialog > div > header {
        margin: 0 0;
        padding: 1rem 3rem 1rem 1rem;
      }
      dialog h1 {
        line-height: 2.25rem;
        margin: 0;
      }
      ul.fields {
        box-sizing: border-box;
        margin: 0;
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
        flex-direction: column;
        justify-content: flex-start;
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
      .close-btn {
        background-color: transparent;
        border: none;
        cursor: pointer;
        display: block;
        font-size: 1.9rem;
        line-height: 0.35em;
        padding: 1rem;
        position: absolute;
        right: 1rem;
        top: 1rem;
        width: 3rem;
        height: 4rem;
        z-index: 11;
      }
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
      #ss-close-label {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        cursor: pointer;
      }
      @media screen and (min-width: 37rem) {
        ul.fields > li div {
          flex-direction: row;
        }
      }`;
  }
};

window.customElements.define('speed-throwing-config', SpeedThrowingConfig);
