import { LitElement, css, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
// import { ifDefined } from 'lit/directives/if-defined.js';
import { getEpre, millisecondsToTimeObj, timeObjToString } from '../utils/talking-timer.utils';
import { getRadio, getSelect, renderEndMsg } from './talking-timer.renderers';
import {
  getDoingSayData,
  getHumanOption,
  getLocalValue,
  getTimerlabel,
  getTypeLabel,
  getWaitingSayData,
  getWrappingLabel,
  makeInt,
  setLocalValue,
} from '../utils/general.utils';
import { getVoiceName, saySomething } from '../utils/speach.utils';
import './radio-input';
import './talking-timer';

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
    value: 3000000,
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
    value: 4800000,
  },
  {
    label: '9 minute',
    value: 5400000,
  },
  {
    label: '10 minute',
    value: 6000000,
  },
];
const endCentering = 'You should be finishing centering and opening up';
const endOpening = 'You should be pulling up by now';
const sessionCompleteHead = 'Speed throwing complete';
const sessionCompleteMsg = 'Take a few deep breaths. '
  + 'Then, when your ready, in the order they were made, cut each '
  + 'pot in half and examine and critique it. Look at what you did '
  + 'well and what can be improved on. Think about what was going '
  + 'on when things went wrong and how you might avoid doing the '
  + 'same thing next time.';
const aboutCritiquing = 'The greatest value of the speed throwing '
  + 'exercise is critiquing the pots you\'ve made after the '
  + 'throwing part of the session. '
  + 'However, the critique will be useless if you only focus on the '
  + 'good or only focus at the bad. '
  + 'Be kind and fair to yourself. '
  + 'The mistakes you make will have been made by every other '
  + 'potter in the world at one time or another.';
const aimsAndObjectives = 'The aim of this exercise is to throw a '
  + 'pot in a limited period of time, using all the time available. '
  + 'But not more and not less. '
  + 'This is an exercise to extend your skills, or to help you '
  + 'focus, or both. The pots you make are just for exercise, not '
  + 'to keep. However, within the time limit, you should strive '
  + 'for personal excellence (which is not the same as perfection). '
  + 'To get the most out of the exercise, you should be pushing '
  + 'yourself to the limit of your skills. Whether it be striving '
  + 'to fully centre your clay within the first minute or make your '
  + 'cylinder as tall and thin as you can, pushing yourself without '
  + 'the requirement of keeping what you make, will improve your '
  + 'skills faster than anything else.';
const aboutFailure = 'This is an exercise where the expectation is '
  + 'that you\'ll cut everything you make in half, so there\'s no '
  + 'need to be precious. '
  + 'If you\'re doing it right you\'ll also be pushing yourself to '
  + 'the limit of your skill. '
  + 'The important (but often disappointing) part of pushing '
  + 'yourself in this way, is that you\'ll often have failures. '
  + 'Don\'t squish or recycle the failures immediately. '
  + 'Instead, add them to the ware-board along with your successes. '
  + 'When it\'s time to review & critique your pots, think about '
  + 'what was going on when the pot failed. '
  + 'Also think about what went right with the pot, even though '
  + 'the final result was a failure.';
const aboutFailureDecline = 'For most beginners (and many '
  + 'experienced potters) the first three or four speed thrown '
  + 'pots will get better with each pot. After that it is very '
  + 'common to see a decline in the quality. This is because your '
  + 'brain is getting tired.'
const aboutTiming = ''

const boolOptions = [
  { label: 'No', value: 'true' },
  { label: 'Yes', value: 'false' },
];
const lenOptions = [
  { label: 'None', value: '0' },
  { label: 'Short', value: '1' },
  { label: 'Medium', value: '2' },
  { label: 'Long', value: '3' },
]

const reps = [];
for (let a = 1; a <= 10; a += 1) {
  reps.push({
    label: a.toString(),
    value: a,
  })
}

const rawSay = '1/2 30s last20 last15 allLast10';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class SpeedThrowing extends LitElement {
  static properties = {
    _confirmed: { type: Boolean, state: true },
    _doCylinders: { type: Boolean, state: true },
    _duration: { type: Number, state: true },
    _intermission: { type: Number, state: true },
    _repCount: { type: Number, state: true },
    _repetitions: { type: Number, state: true },
    _started: { type: Boolean, state: true },
    _state: { type: String, state: true },
    _timerState: { type: String, state: true },
    _totalMilli: { type: Boolean, state: true },
    _type: { type: String, state: true },
    _timerID: { type: String, state: true },
  }
  constructor() {
    super();
    this._ePre = getEpre('<speed-throwing>');

    this._confirmed = getLocalValue('st-confirmed', false, 'bool');
    this._doCylinders = getLocalValue('st-cylinders', true, 'bool');
    this._intermission = getLocalValue('st-intermission', 120000, 'int');
    this._repetitions = getLocalValue('st-repetitions', 5, 'int');
    this._totalMilli = getLocalValue('st-time', 180000, 'int');

    this._breakID = null;
    this._defaultVoice = 'Catherine, James, English (Australia), Zira';
    this._dialogue = null;
    this._duration = timeObjToString(millisecondsToTimeObj(this._totalMilli));
    this._inRestart = false;
    this._killTT = 100;
    this._noExtras = false;
    this._noEndChime = false;
    this._pauseBtnTxt = 'Pause';
    this._repCount = 1;
    this._say = rawSay;
    this._sayExtra = getDoingSayData(this._totalMilli);
    this._saySessionEnd = 1;
    this._saySessionStart = 0;
    this._started = false;
    this._state = (this._confirmed === true)
      ? 'ready'
      : '';
    this._timer = null;
    this._timerID = 'doing';
    this._timerState = 'unset';
    this._type = (this._doCylinders === true)
      ? 'cylinders'
      : 'bowls';
    this._voice = window.speechSynthesis;
    this._voiceName = getVoiceName(this._defaultVoice);

    if (this._state === 'ready') {
      this._getTimer(this)();
    }
  }

  _getTimer(context) {
    return () => {
      context._killTT -= 1;
      if (context._timer === null) {
        context._timer = context.renderRoot?.querySelector('#speed-throwing-timer') ?? null;

        if (context._timer !== null) {
          context._timer.addEventListener(
            'statechange',
            context._handleTimerChange(context),
          );
        } else if (context._killTT > 0) {
          setTimeout(context._getTimer(context), 100);
        }
      }
    };
  }

  _triggerTimerRestart(ttElement) {
    if (this._repCount <= this._repetitions && this._inRestart === false) {
      this._inRestart = true;

      if (this._timerID === 'doing') {
        // update timer config to doing values
        this._duration = timeObjToString(millisecondsToTimeObj(this._totalMilli));;
        this._noExtras = false;
        this._pauseBtnTxt = 'Pause';
        this._say = rawSay;
        this._sayExtra = getDoingSayData(this._totalMilli);
      } else {
        // update timer config to waiting values
        this._duration = timeObjToString(millisecondsToTimeObj(this._intermission));
        this._noExtras = true;
        this._pauseBtnTxt = `Start your next ${getTypeLabel(this._type)} now`;
        this._repCount += 1;
        this._say = '';
        this._sayExtra = getWaitingSayData(getTypeLabel(this._type), this._intermission);
      }

      if (this._repCount <= this._repetitions) {
        // wait a bit of timer to allow the timer config to propogate
        // before start the timer again.

        setTimeout(() => {
          ttElement.reset();
          ttElement.start();
          this._inRestart = false;
        }, 100);
      } else {
        // There's nothing left to do, so make sure we can start again if we need.
        this._inRestart = false;
        setTimeout(() => {
          saySomething(sessionCompleteMsg, this._voice, this._voiceName);
        }, 2000);
      }
    }
  }

  _handleTimerChange() {
    return (event) => {
      const ttElement = event.target
      const { state, timerid } = event.target;

      switch (state) {
        case 'ending':
          break;

        case 'ended':
          this._timerID = (timerid === 'doing')
            ? 'waiting'
            : 'doing';
          if (timerid === 'waiting') {
            // Our latest intermission has ended so start the doing
            // timer
            this._triggerTimerRestart(ttElement);
          } else if (this._repCount < this._repetitions); {
            // We've just finished throwing but we've still got more
            // to do.
            // Start the next intermission.

            this._triggerTimerRestart(ttElement);
          }
          break;

        case 'pause':
          if (timerid === 'waiting') {
            this._timerID = 'doing';
            // User wants to start their next pot in before the end of
            // the intermission.
            // That's fine.
            this._triggerTimerRestart(ttElement);
          }
          break;

        case 'starting':
          break;

        case 'running':
          this._state = 'running'
          break;
      }
    }
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
        setLocalValue('st-confirmed', this._confirmed);
        setLocalValue('st-cylinders', this._doCylinders);
        setLocalValue('st-intermission', this._intermission);
        setLocalValue('st-time', this._totalMilli);
        setLocalValue('st-repetitions', this._repetitions);
        setTimeout(this._getTimer(this), 1);
        this._duration = timeObjToString(millisecondsToTimeObj(this._totalMilli));
        break;
      case 'close':
        this._dialogue.close();
        break;
      case 'start':
        this._state = 'running';
        break;
      case 'config':
        this._dialogue.showModal();
        break;
      case 'duration':
        this._totalMilli = makeInt(val);
        break;
      case 'intermission':
        this._intermission = makeInt(val);
        break;
      case 'repetitions':
        this._repetitions = makeInt(val);
        break;

      case 'type--cylinders':
        this._doCylinders = true;
        this._type = val;
        break;

      case 'type--bowls':
        this._doCylinders = true;
        this._type = val;
        break;
    }
  }

  _handleRadioChange(event) {
    console.group(this._ePre('_handleRadioChange'));
    const { id, value } = event.target;
    console.log('event.target:', event.target);
    console.log('event.target.id:', event.target.id);
    console.log('id:', id);
    console.log('value:', value);
    console.log('this._noEndChime (before):', this._noEndChime);
    console.log('this._saySessionEnd (before):', this._saySessionEnd);
    console.log('this._saySessionStart (before):', this._saySessionEnd);

    switch (id) {
      case 'no-end-chime':
        this._noEndChime = (value === 'true');
        break;
      case 'say-session-end':
        this._saySessionEnd = parseInt(value, 10);
        break;
      case 'say-session-start':
        this._saySessionStart = parseInt(value, 10);
        break;
    }
    console.log('this._saySessionStart (after):', this._saySessionEnd);
    console.log('this._saySessionEnd (after):', this._saySessionEnd);
    console.log('this._noEndChime (after):', this._noEndChime);
    console.groupEnd();
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
            setTimeout(cb(context), 1 );
          }
        } else if (context._confirmed === false) {
          context._dialogue.showModal();
        }
      }
    }
    setTimeout(cb(this), 1 );
  }

  iWillBe() {
    return html`
      <p>
        I will be throwing <span class="i-will--count">${this._repetitions}</span>,
        <span class="i-will--time">${unsafeHTML(getHumanOption(timerOptions, this._totalMilli))}</span>
        <span class="i-will--type">${this._type}</span>, with maximum of
        <span class="i-will--break">${unsafeHTML(getHumanOption(timerOptions, this._intermission))}s</span>
        break between each ${this._type.substring(0, this._type.length - 1)}.
      </p>
    `;
  }

  render() {
    const timerLabel = getTimerlabel(this._type, this._repCount, this._repetitions);
    const timerHead = getWrappingLabel(timerLabel);
    const iWill = this.iWillBe()

    return html`
      <article>
        <dialog id="speed-throwing-config">
          <div>
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
                  this._totalMilli,
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
                  id="say-session-start"
                  label="Say session intro"
                  .options=${lenOptions}
                  .value="${this._saySessionStart}"
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
              ${iWill}
              <button
                class="settings-btn"
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

        ${(this._confirmed === true) ? iWill : ''}

        ${(this._state !== 'running')
          ? html`
            <p>
              <button
                class="settings-btn"
                id="ss-config"
                type="button"
                value="config"
                @click=${this._handleChange}>
                Change settings
              </button>
            </p>`
          : ''}

        ${(this._confirmed === true && this._repCount <= this._repetitions)
          ? html`<talking-timer
              id="speed-throwing-timer"
              .duration="${this._duration}"
              endmessage="Hands off your pots"
              .label="${timerLabel}"
              ?noendchime=${this._noExtras || this._noEndChime}
              ?nosayend=${this._noExtras}
              ?nosaystart=${this._noExtras}
              .pausebtntxt="${this._pauseBtnTxt}"
              .say=${this._say}
              .saydata=${this._sayExtra}
              .timerid="${this._timerID}"
              voice="catherine"><h2>${timerHead}</talking-timer>`
          : ''
        }
        ${(this._repCount > this._repetitions)
          ? renderEndMsg(sessionCompleteHead, sessionCompleteMsg)
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
      button {
        cursor: pointer;
        border: none;
      }
      .settings-btn {
        padding: 0.5rem 1rem;
        background-color: var(--tt-btn-bg-colour, rgb(255, 239, 0));
        color: var(--tt-btn-colour, #232323);
        font-weight: bold;
        font-size: 1.125rem;
      }
      dialog {
        border: none;
        max-width: 39.5rem;
        width: 100%;
        background: transparent;
      }
      dialog > div {
        background-color: var(--tt-bg-colour, #111);
        border: var(--tt-border, 0.05rem solid #000);
        box-shadow: var(--tt-box-shadow, 0.5rem 0.5rem 0.5rem rgba(255, 255, 255, 0.7));
        max-width: 37.5rem
      }
      dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.8);
        background-color: var(--tt-backdrop, rgba(0, 0, 0, 0.8));
      }
      dialog > div > footer {
        padding: 1rem;
      }
      dialog > div > footer p {
        margin: 0 0 1rem;
      }
      dialog > div > header {
        margin: 0 0;
        padding: 1rem;
      }
      dialog h1 {
        line-height: 1rem;
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
      .i-will--count {
        font-weight: bold;
        font-size: 0.95rem;
        font-family: var(--tt-btn-font, verdana, arial, helvetica, sans-serif);
      }
      .i-will--type {
        font-weight: bold;
        font-size: 0.95rem;
        font-family: var(--tt-btn-font, verdana, arial, helvetica, sans-serif);
      }
      .i-will--time {
        font-weight: bold;
        font-style: italic;
      }
      .i-will--break {
        font-weight: bold;
      }

      talking-timer h2 {
        font-family: var(--tt-h-font, verdana, arial, helvetica, sans-serif);
        font-size: var(--tt-h-size, 1.5rem);
        font-weight: var(--tt-h-weight, normal);
        line-height: var(--tt-h-line-h, 1.5rem);
        margin: 0;
        padding: 0.5rem 0.5rem 0 0.5rem;
        text-align: center;
        text-wrap: pretty;
      }
      .close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        border: none;
        padding: 1rem;
        background-color: transparent;
        font-size: 1.9rem;
        line-height: 0.35em;
        cursor: pointer;
      }
    `;
  }
}

window.customElements.define('speed-throwing', SpeedThrowing);
