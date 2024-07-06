import { LitElement, css, html } from 'lit';
import { getEpre, millisecondsToTimeObj, sayDataIsValid, validateTimeDuration } from '../utils/talking-timer.utils';
import { filterOffsets, parseRawIntervals, sayDataAdapter, sortOffsets } from '../utils/interval-parser.utils';
import {
  getMainBtn,
  getOtherBtn,
  renderHumanTime,
  stateError,
} from './talking-timer.renderers';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class TalkingTimer extends LitElement {
  static properties = {
    /**
     * Whether or not to auto reset the timer as soon
     *
     * If `autoreset` is not a number or is less than zero, auto
     * restart is off.
     *
     * [default: -1] (off)
     *
     * @property {string} autoreset
     */
    autoreset: { type: Number },

    /**
     * The number of times the button has been clicked.
     *
     * * If `duration` is a number less than 10000 it will be assumed
     *   to represent _seconds
     * * If `duration` is a number greater than or equal to 10000 it
     *   will be assumed to represent milliseconds
     * * If `duration` is a string that can be matched by the pattern:
     *   HH:MM:SS or MM:SS it will be converted to milliseconds
     *   /^[0-9]{1,2}(?::[0-9]{2}(?::[0-9]{2})?)?$/
     *
     * @property {number|string} duration
     */
    duration: {},

    /**
     * Heading to show at the top of the timer.
     *
     * [default: "Time's up"]
     *
     * @property {string} endmessage
     */
    endmessage: { type: String },

    /**
     * The human readable time string for the amount of time
     * remaining before the timer ends
     *
     * @property {string} humanremaining
     */
    humanremaining: { type: String, reflect: true },

    /**
     * ID of set interval used for decrementing time
     *
     * @property {number} _intervalID
     */
    _intervalID: { type: Number, state: true },

    /**
     * Timestamp for the last time we decremented the time.
     *
     * @property {number} _lastTime
     */
    _lastTime: { type: Number, state: true },

    /**
     * Label for talking timer
     *
     * @property {string} label
     */
    label: { type: String },

    /**
     * List of messages to announce
     *
     * @property {Array<{time: number, msg: string}>} _messages
     */

    _remainingLabel: { type: String, state: true },

    /**
     * Sometimes you just want to add a couple of custom messages in
     * between the normal interval messages. If that's the case add
     * your custom messages to `saydata` and set your normal
     * intervals in `say.
     *
     * [default: false]
     *
     * @property {boolean} mergesaydata
     */
    mergesaydata: { type: Boolean },

    /**
     * The number of milliseconds remaining
     *
     * This is used to keep track of the number of milliseconds
     * remaining. It's value is used to update the `remaining` value.
     *
     * It will be updated no more than once every tenth of a second
     *
     * @property {number} _milliseconds
     */
    _milliseconds: { type: Number, state: true },

    _nextTime: { type: Number, state: true },
    _nextMsg: { type: String, state: true },

    /**
     * whether or not to play the end chime
     *
     * [default: false]
     *
     * @property {string} noendchime
     */
    noendchime: { type: Boolean },

    /**
     * Copy for the read the docs hint.
     *
     * [default: false]
     *
     * @property {boolean} noPause
     */
    nopause: { type: Boolean },

    /**
     * Whether or not to say the end phrase
     *
     * [default: false]
     *
     * @property {boolean} nosayend
     */
    nosayend: { type: Boolean },

    /**
     * Human readable parts of the time string
     *
     * @property {Object<{hours:number, _minutes: number, _seconds: number}}
     */
    _hours: { type: Number, state: true },
    _minutes: { type: Number, state: true },
    _seconds: { type: Number, state: true },
    _tenths: { type: Number, state: true },

    /**
     * The percentage of time remaining until timer ends
     *
     * `percent` is represented as a number between 1 & 0
     *
     * > __Note:__ `percent` will be updated every time
     * >           `_milliseconds` is updated
     *
     * [default: 1]
     *
     * @property {number} percent
     */
    percent: { type: Number, reflect: true },

    /**
     * `priority` sets which announcements are discarded and which
     * are spoken if multiple announcements are due around the same
     * time.
     *
     * To reduce the amount of talking, announcements can only be
     * made if they are seven _seconds later or earlier than another
     * anouncement. By default fraction anouncements have priority
     * e.g. when the timer is set to 3 _minutes, the "Half way"
     * announcement is also the same as the "One minute, thirty
     * _seconds to go" anouncement so the "Half way" announcement
     * is spoken but the "One minute, thirty _seconds to go." is
     * skipped.
     *
     * `priority` options:
     * It's possible (even probable) that, when using fraction
     * intervals (like `1/2`) and time intervals (like `30s`) you
     * will get two announcements for the same interval. In this
     * case, the priority decides which is spoken.
     *
     * * `fraction` (default) Fraction intervals are spoken if
     *              there's a confilict between a time and a fraction
     *              announcement.
     * * `time`     time intervals are spoken if there's a confilict
     *              between a time and a fraction announcement.
     * * `order`    order they're defined in `speak` - the one defined
     *              first over-rides one spoken at a similar time but
     *              defined later.
     *
     * @property {string} priority
     */
    priority: { type: String },

    /**
     * The number of milliseconds remaining
     *
     * > __Note:__ `remaining` is never read internally.
     * >           Every time `_milliseconds` is updated, `remaining`
     * >           will be overwritten with the value from `_milliseconds`
     *
     * @property {number} remaining
     */
    remaining: { type: Number, reflect: true },

    /**
     * List of messages to announce
     *
     * @property {Array<{time: number, msg: string}>} _messages
     */

    _remainingLabel: { type: String, state: true },

    /**
     * A string that will be parsed to determin which intervals are
     * to be spoken
     *
     * > __Note:__ If both `say` and `saydata` are present, the value
     * >           from `say` will be ignored and `saydata` will be
     * >           used.
     *
     * > __Note also:__ If both `say` and `saydata` are empty, an
     * >           error will be thrown. (We can't have a talking
     * >           timer with nothing to say)
     *
     * [default: "1/2 30s last20 last15 allLast10"]
     *
     * @property {string} heading
     */
    say: { type: String },

    /**
     * A list of time/message pairs, where the time represents the
     * time from end the message is to be announced and the message
     * is the text that will be converted to speach and announced.
     *
     * > __Note:__ If both `saydata` and `say` are present, the value
     * >           from `saydata` will be used and `say` will be
     * >           ignored.
     *
     * > __Note also:__ If both `saydata` and `say` are empty, an
     * >           error will be thrown. (We can't have a talking
     * >           timer with nothing to say)
     *
     * [default: []]
     *
     * @property {Array<{offset: number, message: string}>} saydata
     */
    saydata: { type: Array },

    /**
     * Whether or not to say the start phrase
     *
     * [default: false]
     *
     * @property {boolean} saystart
     */
    saystart: { type: Boolean },

    /**
     * Message to say to indicate the timer is about to start
     *
     * [default: "Ready, set, go!"]
     *
     * @property {string} startmessage
     */
    startmessage: { type: String },

    /**
     * The number of _seconds after which the talking timer will self
     * destruct (i.e. will be removed from the DOM)
     *
     * If `selfdestruct` is not a number or is less than zero, self
     * destruct is off.
     *
     * [default: -1]
     *
     * @property {number} selfdestruct
     */
    selfdestruct: { type: Number },

    /**
     * Current state of the timer
     * * `unset`   - Not enough data to start
     * * `ready`   - Timer is set but has not yet started
     * * `running` - Timer is counting down
     * * `paused`  - Timer has started but is currently paused
     * * `ended`   - Timer has finished counting down
     *
     * [default: "unset"]
     *
     * @property {string} state
     */
    state: { type: String, reflect: true },

    /**
     * The total number milliseconds the timer will run for
     *
     * > __Note:__ This number will never be read internally.
     * >           It is instead a public representation of `_total`
     *
     * @property {number} timer
     */
    timer: { type: Number, reflect: true },

    /**
     * The total number milliseconds the timer will run for.
     *
     * Once the timer has started, this number will not be updated.
     *
     * > __Note:__ `_total` is used to calculate the percentage of
     * >           time remaining and the spacing of intervals if
     * >           `saydata` is empty.
     *
     * (non-reactive)
     *
     * @property {number} _total
     */

    /**
     * The number of times the button has been clicked.
     *
     * * If `duration` is a number less than 10000 it will be assumed
     *   to represent _seconds
     * * If `duration` is a number greater than or equal to 10000 it
     *   will be assumed to represent milliseconds
     * * If `duration` is a string that can be matched by the pattern:
     *   HH:MM:SS or MM:SS it will be converted to milliseconds
     *   /^[0-9]{1,2}(?::[0-9]{2}(?::[0-9]{2})?)?$/
     *
     * @property {number|string} duration
     */
    duration: {},
  }

  constructor() {
    super();
    this.autoreset = -1;
    this.endmessage = "Time's up!";
    this.noendchime = false;
    this.nopause = false;
    this.nosayend = false;
    this._hours = 0;
    this._minutes = 0;
    this._seconds = 0;
    this._tenths = 0;
    this.priority = 'fraction'
    this.percent = 1;
    this.say = '1/2 30s last20 last15 allLast10';
    this.saydata = [];
    this.mergesaydata = false;
    this.saystart = false;
    this.startmessage = 'Ready. Set. Go!';
    this.selfdestruct = -1;
    this.state = 'unset';

    // ----------------------------------------------------
    // START: non-reactive properties


    this._decrementCB = this._getDecrementTimer(this);
    /**
     * List of messages to announce
     *
     * Messages are ordered from next to last
     *
     * @property {Array<{time: number, msg: string}>} _messages
     */
    this._messages = [];
    this._ogMessages = [];

    /**
     * The next message to be spoke
     *
     * > __Note:__ `_nextMsg` shifted off the front of the
     * >           `_messages` list at the start of the timer or
     * >           when the current `_nextMsg` is spoken.
     */
    this._nextMsg = null;

    /**
     * The total number milliseconds the timer will run for.
     *
     * Once the timer has started, this number will not be updated.
     *
     * > __Note:__ `_total` is used to calculate the percentage of
     * >           time remaining and the spacing of intervals if
     * >           `saydata` is empty.
     *
     * @property {number} _total
     */
    this._total = 0;

    this._suffixes = {
      first: ' gone',
      last: ' to go',
      half: 'Half way',
    };
    this._ePre = getEpre('talking-timer');
    this._keyUp = this._getKeyUp(this);

    //  END:  non-reactive properties
    // ----------------------------------------------------
  }

  _parseAttributes () {
    // ----------------------------------------------------
    // START: Process duration

    const tmp = validateTimeDuration(this.duration);

    if (tmp === false) {
      throw new Error('<talking-timer> must have a duration to work with. `duration` was invalid');
    }
    this._total = tmp;
    this.state = 'ready';

    //  END:  Process duration
    // ----------------------------------------------------
    // START: Message list

    const validSay = sayDataIsValid(this.saydata);

    if (this.mergesaydata !== true && validSay) {
      this._ogMesseges = sortOffsets(filterOffsets(sayDataAdapter(this.saydata)));
    } else if (typeof this.say === 'string' || this.say.trim() === '') {
      this._ogMesseges = parseRawIntervals(this._total, this.say);

      if (this.mergesaydata === true) {
        this._ogMesseges = sortOffsets(filterOffsets([
          ...this._ogMesseges,
          sayDataAdapter(this.saydata),
        ]));
      }
    }

    this._resetData();

    //  END:  Message list
    // ----------------------------------------------------

    this.state = 'ready' ;
  }

  _btnClick(event) {
    const { value } = event.target;

    switch (value) {
      case 'start':
        this._startTimer();
        break;

      case 'pause':
        this._pauseTimer();
        break;

      case 'resume':
        this._resumeTimer();
        break;

      case 'restart':
        this._restartTimer();
        break;

      case 'reset':
        this._resetTimer();
        break;
    }
    console.groupEnd();
  }

  _getDecrementTimer(context) {
    return () => {
      const now = Date.now();
      const minus = now - context._lastTime;
      context._lastTime = now;
      context.remaining = (context.remaining - minus);

      if (context.remaining <= 0) {
        this._timerEnded();
      }

      context._setParts();

      context.percent = (context.remaining > 0)
        ? (Math.round((context.remaining / context._total) * 100000) / 1000)
        : 0;


      if (context._nextTime < now) {
        // say message
        this._getNextMsg();
      }
    };
  }

  _getNextMsg() {
    const tmp = this._messages.shift();
    if (typeof tmp !== 'undefined') {
      this._nextTime = tmp.time;
      this._nextMsg = tmp.message;
    }
  }

  _initInterval() {
    if (this._intervalID === null) {
      this._intervalID = setInterval(this._decrementCB, 50);
    }
  }

  _getKeyUp(context) {
    return (event) => {
      // if (event.shiftKey === true) {
      //   switch (event.key) {
      //     case 'S':
      //       event.preventDefault();
      //       switch (context.state) {
      //         case 'ready':
      //           if (context.nopause !== true) {
      //             context._startTimer();
      //           }
      //           break;
      //         case 'running':
      //           context._pauseTimer();
      //           break;
      //         case 'paused':
      //           context._resumeTimer();
      //           break;
      //         case 'ended':
      //           context._restartTimer();
      //           break;
      //       }
      //       break;
      //     case 'N':
      //       switch (context.state) {
      //         case 'paused':
      //         case 'ended':
      //           context._resetTimer();
      //           break;
      //       }

      //     case 'R':
      //       switch (context.state) {
      //         case 'paused':
      //         case 'ended':
      //           context._restartTimer();
      //           break;
      //       }
      //   }
      // }
      console.log('context:', context);

      console.group(context._ePre('_keyUp'));
      console.log('event:', event);

      console.groupEnd();
    }
  }

  _pauseTimer() {
    if (this.state !== 'running') {
      throw new Error(stateError('pause', 'running', this.state));
    }
    this._setState('paused');
    clearInterval(this._intervalID);
    this._intervalID = null;
    this._decrementCB();
  }

  _resetData() {
    this._messages = [...this._ogMessages];
    this.remaining = this._total;
    this.percent = 100;
    this._setParts();
  }

  _resetTimer() {
    if (this.state !== 'paused' && this.state !== 'ended') {
      throw new Error(stateError('reset', 'paused" or "ended', this.state));
    }
    this._resetData();
    this._setState('ready');
  }

  _restartTimer() {
    if (this.state !== 'paused' && this.state !== 'ended') {
      throw new Error(stateError('restart', 'paused', this.state));
    }
    this._resetData();
    this._setState('running');
    this._lastTime = Date.now();
    this._initInterval();
  }

  _resumeTimer() {
    if (this.state !== 'paused') {
      throw new Error(stateError('resume', 'paused', this.state));
    }
    this._setState('running');
    this._lastTime = Date.now();

    this._initInterval();
  }

  _setParts() {
    const tmp = millisecondsToTimeObj(this.remaining);
    this._hours = tmp.hours;
    this._minutes = tmp.minutes;
    this._seconds = tmp.seconds;
    this._tenths = tmp.tenths;
  }

  _setState(newState) {
    if (this.state !== newState) {
      this.state = newState;
      this.dispatchEvent(
        new Event('statechange', { bubbles: true, composed: true })
      );
    }
  }

  async _startTimer() {
    if (this.state !== 'ready' && this.state !== 'ended') {
      throw new Error(stateError('start', 'ready" or "endend', this.state));
    }
    this._setState('running');

    if (this.saystart === true) {
      // say the start bit.
    }

    this._lastTime = Date.now();

    this._initInterval();
    this._getNextMsg();
  }

  _timerEnded() {
    if (this.state !== 'running') {
      throw new Error(stateError('ended', 'running', this.state));
    }
    this._setState('ended');
    this.remaining = 0;
    clearInterval(this._intervalID);
    this._intervalID = null;

    if (this.nosayend !== true) {
      // say end bit
    }
    if (this.noendchime !== true) {
      // play end chime
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this._parseAttributes();
    this.getRootNode().addEventListener('keyup', this._keyUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.getRootNode().removeEventListener('keyup', this._keyUp);

  }

  render() {
    return html`
      <div class="wrap" @keyup=${this._keyUp}>
        <header>
          <slot></slot>
        </header>
        <main>
          ${(this.state !== 'unset')
            ? renderHumanTime(
              this._hours,
              this._minutes,
              this._seconds,
              this._tenths,
              (100 - this.percent),
              this.label,
            )
            : ''
          }
        </main>
        <footer>
          ${(this.state === 'unset')
            ? html`<p>Not enough data</p>`
            : getMainBtn(this.state, this._btnClick, this.nopause)
          }
          ${(this.state === 'paused')
            ? getOtherBtn('Restart', this._btnClick)
            : ''
          }
          ${(this.state === 'paused' || this.state === 'ended')
            ? getOtherBtn('Reset', this._btnClick)
            : ''
          }
        </footer>
      </div>
    `
  }

  static get styles() {
    return css`
      div.wrap {
        box-sizing: border-box;
        border: var(--tt-border, 0.05rem solid #000);
        display: flex;
        flex-direction: column;
        font-family: arial, helvetica, sans-serif;
        justify-content: center;
        min-width: 12.5rem;
        width: 100%;

      }
      footer {
        border-top: var(--tt-border, 0.05rem solid #000);
        display: flex;
        gap: var(--tt-padding, 0.5rem);
        justify-content: center;
        padding: var(--tt-padding, 0.5rem);
      }
      .btn {
        border-radius: var(--tt-btn-radius, 0);
        border: var(--tt-border, 0.05rem solid #000);
        flex-grow: 1;
        font-family: verdana, arial, helvetica, sans-serif;
        font-weight: bold;
        padding: 0.5rem;
        text-transform: var(--tt-t-transform, uppercase);
      }
      .btn--start, .btn--resume {
        background-color: var(--tt-btn-bg-colour, #030);
      }
      .btn--pause, .btn--restart {
        background-color: var(--tt-btn-bg-colour, #004);
      }
      .btn--reset {
        background-color: var(--tt-btn-bg-colour, #600);
      }
      main {
        padding: var(--tt-padding, 0.5rem);
      }

      /* ------------------ */
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
      div.human .whole--w-progress {
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

window.customElements.define('talking-timer', TalkingTimer);
