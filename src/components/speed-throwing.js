import { LitElement, css, html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
// import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getEpre, millisecondsToTimeObj, timeObjToString } from '../utils/talking-timer.utils';
import { renderEndMsg } from './talking-timer.renderers';
import {
  getLocalValue,
  setLocalValue,
} from '../utils/general.utils';
import {
  getBtn,
  getDoingSayData,
  getRepOptions,
  // getHumanOption,
  getTimerlabel,
  getTypeLabel,
  getWaitingSayData,
  getWrappingLabel,
  iWillBe,
  makeInt,
} from '../utils/speed-throwing.utils';
import { getVoiceName, saySomething } from '../utils/speach.utils';
import './radio-input';
import './talking-timer';
import './speed-throwing-config';

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
    _totalMilli: { type: Number, state: true },
    _type: { type: String, state: true },
    _timerID: { type: String, state: true },
    _who: { type: String, state: true },
  }
  constructor() {
    super();
    this._ePre = getEpre('<speed-throwing>');
    this._tmp = {};
    this._type = 'Cylinders';

    this._confirmed = getLocalValue('st-confirmed', false, 'bool');
    this._doCylinders = getLocalValue('st-cylinders', true, 'bool');
    this._intermission = getLocalValue('st-intermission', 90000, 'int');
    this._noEndChime = getLocalValue('st-no-end-chime', false, 'bool');
    this._noSayHelp = getLocalValue('st-no-say-help', false, 'bool');
    this._repetitions = getLocalValue('st-repetitions', 5, 'int');
    this._saySessionEnd = getLocalValue('st-say-session-end', 0, 'int');
    this._saySessionStart = getLocalValue('st-say-session-start', 0, 'int');
    this._totalMilli = getLocalValue('st-time', 180000, 'int');
    this._who = getLocalValue('st-who', 'I', 'string');

    this._breakID = null;
    this._defaultVoice = 'Catherine, James, English (Australia), Zira';
    this._duration = timeObjToString(millisecondsToTimeObj(this._totalMilli));
    this._inRestart = false;
    this._setType();
    this._iWillBe = (this._confirmed === true)
      ? iWillBe(
          this._who,
          this._repetitions,
          this._totalMilli,
          this._intermission,
          this._type,
          getRepOptions(),
        )
      : '';
    this._killTT = 100;
    this._noExtras = false;
    this._pauseBtnTxt = 'Pause';
    this._pauseBtnValue = 'pause';
    this._repCount = 1;
    this._say = rawSay;
    this._sayExtra = (this._noSayHelp === false)
      ? getDoingSayData(this._totalMilli)
      : undefined;
    this._started = false;
    this._state = (this._confirmed === true)
      ? 'ready'
      : '';
    this._timer = null;
    this._timerID = 'doing';
    this._timerState = 'unset';
    this._voice = window.speechSynthesis;
    this._voiceName = getVoiceName(this._defaultVoice);

    if (this._state === 'ready') {
      this._getTimer(this)();
    }
    this._setTmp();
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
          context._timer.addEventListener(
            'custompause',
            context._handleCustomPause(context),
          );
        } else if (context._killTT > 0) {
          setTimeout(context._getTimer(context), 100);
        }
      }
    };
  }

  _resetState(val) {
    this._state = 'ready';
    this._repCount = makeInt(val);
    this._timerID = 'doing';
  }

  _triggerTimerRestart(ttElement, force = false) {
    if (this._repCount <= this._repetitions && this._inRestart === false) {
      this._inRestart = true;

      if (this._timerID === 'doing') {
        // update timer config to doing values
        this._duration = timeObjToString(millisecondsToTimeObj(this._totalMilli));;
        this._noExtras = false;
        this._pauseBtnTxt = 'Pause';
        this._pauseBtnValue = `pause`;
        this._say = rawSay;
        this._sayExtra = getDoingSayData(this._totalMilli);
      } else {
        // update timer config to waiting values
        this._duration = timeObjToString(millisecondsToTimeObj(this._intermission));
        this._noExtras = true;
        this._pauseBtnTxt = `Start your next ${getTypeLabel(this._type)} now`;
        this._pauseBtnValue = `start-now`;
        this._repCount += 1;
        this._say = '';
        this._sayExtra = getWaitingSayData(getTypeLabel(this._type), this._intermission);
      }

      if (this._repCount <= this._repetitions) {
        // wait a bit of timer to allow the timer config to propogate
        // before start the timer again.

        setTimeout(() => {
          ttElement.reset(force);
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

  _handleCustomPause() {
    return (event) => {
      if (typeof event.detail === 'string' && event.detail === this._pauseBtnValue) {
        this._timerID = 'doing';

        if (this._repCount < this._repetitions); {
          // We've just finished throwing but we've still got more
          // to do.
          // Start the next intermission.

          this._triggerTimerRestart(event.target, true);
        }
      }
    };
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

  _confirmConfig(event) {
    const {
      doCylinders,
      duration,
      intermission,
      iWillBe,
      noEndChime,
      noSayHelp,
      repetitions,
      saySessionEnd,
      saySessionStart,
      who
    } = event.detail;

    this._confirmed = true;
    this._state = 'ready';

    this._doCylinders = doCylinders;
    this._totalMilli = duration;
    this._duration = timeObjToString(millisecondsToTimeObj(this._totalMilli));
    this._intermission = intermission;
    this._noEndChime = noEndChime;
    this._noSayHelp = noSayHelp;
    this._repetitions = repetitions;
    this._saySessionEnd = saySessionEnd;
    this._saySessionStart = saySessionStart;
    this._who = who;
    this._iWillBe = iWillBe;

    this._setType();
    this._sayExtra = (this._noSayHelp === false)
      ? getDoingSayData(this._totalMilli)
      : undefined;

    this._setTmp();
    this._resetState(1);

    setLocalValue('st-confirmed', this._confirmed);
    setLocalValue('st-cylinders', this._doCylinders);
    setLocalValue('st-intermission', this._intermission);
    setLocalValue('st-time', this._totalMilli);
    setLocalValue('st-repetitions', this._repetitions);
    setLocalValue('st-no-say-help', this._noSayHelp);
    setLocalValue('st-no-end-chime', this._noEndChime);
    setLocalValue('st-say-session-start', this._saySessionStart);
    setLocalValue('st-say-session-end', this._saySessionEnd);
    setLocalValue('st-who', this._who);

    setTimeout(this._getTimer(this), 1);
  }

  _handleChange(event) {
    const val = event.target.value;

    switch (event.target.id.substring(3)) {
      case 'abort':
        // We're bumping the _repCount all the way to the end so we
        // don't transition to the waiting timer
        this._resetState(this._repetitions + 1);

        // We're stopping the timer and forcing it to end silently
        this._timer.stop(true);
        // Reset the timer back to it's initial state
        this._timer.reset(true);

        // We're resetting the state again so the user can start a
        // new session without extra button clicks
        this._resetState(1);

        this._state = 'ready';
        break;

      case 'reset':
        this._resetState(val);
        break;

      case 'start':
        this._state = 'running';
        break;
    }
  }

  _setType() {
    this._type = (this._doCylinders === true)
      ? 'cylinders'
      : 'bowls';
  }

  _setTmp() {
    this._tmp = {
      confirmed: this._confirmed,
      doCylinders: this._doCylinders,
      intermission: this._intermission,
      repetitions: this._repetitions,
      totalMilli: this._totalMilli,
    };
  };

  render() {
    const timerLabel = getTimerlabel(this._type, this._repCount, this._repetitions);
    const timerHead = getWrappingLabel(timerLabel);

    return html`
      <article>
        <p>
          ${(this._state !== 'running')
            ? html`<speed-throwing-config
                ?do-cylinders="${this._doCylinders}"
                .duation="${this._totalMilli}"
                .intermission="${this._intermission}"
                ?no-end-chime="${this._noEndChime}"
                ?no-say-help="${this._noSayHelp}"
                .repetitions="${this._repetitions}"
                .say-session-end="${this._saySessionEnd}"
                .say-session-start="${this._saySessionStart}"
                @confirmconfig=${this._confirmConfig}></speed-throwing-config>`
            : getBtn('abort', 'End speed throwing session now', this._handleChange)
          }
        </p>

        ${(this._confirmed === true) ? this._iWillBe : ''}

        ${(this._confirmed === true && this._repCount <= this._repetitions)
          ? html`<talking-timer
              id="speed-throwing-timer"
              .duration="${this._duration}"
              end-message="Hands off your pots"
              .label="${timerLabel}"
              merge-both
              ?no-end-chime=${this._noExtras || this._noEndChime}
              ?no-say-end=${this._noExtras}
              ?no-say-start=${this._noExtras}
              .pause-btn-txt="${this._pauseBtnTxt}"
              .pause-btn-value="${this._pauseBtnValue}"
              .say=${this._say}
              .say-data=${ifDefined(this._sayExtra)}
              .timer-id="${this._timerID}"
              voice="catherine"><h2>${timerHead}</talking-timer>`
          : ''
        }
        ${(this._repCount > this._repetitions)
          ? renderEndMsg(sessionCompleteHead, sessionCompleteMsg, this._handleChange)
          : ''
        }
      </article>
    `;
  }

  static get styles() {
    return css`
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
        font-family: var(--st-btn-font, verdana, arial, helvetica, sans-serif);
      }
      .i-will--type {
        font-weight: bold;
        font-size: 0.95rem;
        font-family: var(--st-btn-font, verdana, arial, helvetica, sans-serif);
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
    `;
  }
};

window.customElements.define('speed-throwing', SpeedThrowing);
