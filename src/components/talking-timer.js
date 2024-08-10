import { LitElement, css, html } from 'lit';
import { getEpre, getPublicWarning, millisecondsToTimeObj, validateTimeDuration } from '../utils/talking-timer.utils';
import {
  filterOffsets,
  parseRawIntervals,
  sayDataIsValid,
  sortOffsets,
} from '../utils/interval-parser.utils';
import {
  getMainBtn,
  getOtherBtn,
  stateError,
} from './talking-timer.renderers';
import { getVoiceName, saySomething } from '../utils/speach.utils';
import { playEndChime } from '../utils/sound.utils';
// import playEndChime from '../utils/play-tone';
import './time-display';

/**
 * <talking-timer> is an
 *
 * @slot - Add your own heading content via the default slot
 * @csspart button - The button
 */
export class TalkingTimer extends LitElement {
  static properties = {
    always: { type: String },

    /**
     * Whether or not to auto reset the timer as soon
     *
     * If `autoreset` is not a number or is less than zero, auto
     * reset is off.
     *
     * [default: -1] (off)
     *
     * @property {string} autoreset
     */
    autoReset: { type: Number, attribute: 'auto-rest' },
    autoStartAfter: { type: Number, attribute: 'auto-start-after' },

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
     * @property {string} endMessage
     */
    endMessage: { type: String, attribute: 'end-message' },

    /**
     * The human readable time string for the amount of time
     * remaining before the timer ends
     *
     * @property {string} humanRemaining
     */
    humanRemaining: { type: String, reflect: true, attribute: 'human-remaining' },

    /**
     * Label for talking timer
     *
     * @property {string} label
     */
    label: { type: String },

    /**
     * Sometimes you just want to add a couple of custom messages in
     * between the normal interval messages. If that's the case add
     * your custom messages to `sayData` and set your normal
     * intervals in `say.
     *
     * [default: false]
     *
     * @property {boolean} mergeBoth
     */
    mergeBoth: { type: Boolean, attribute: 'merge-both' },

    /**
     * whether or not to play the end chime
     *
     * [default: false]
     *
     * @property {string} noEndChime
     */
    noEndChime: { type: Boolean, attribute: 'no-end-chime' },

    /**
     * Whether or not the user can pause the timer
     *
     * [default: false]
     *
     * @property {boolean} noPause
     */
    noPause: { type: Boolean, attribute: 'no-pause' },

    /**
     * Whether or not the user can restart the timer
     *
     * [default: false]
     *
     * @property {boolean} noRestart
     */
    noRestart: { type: Boolean, attribute: 'no-restart' },

    /**
     * Whether or not the user can reset the timer
     *
     * [default: false]
     *
     * @property {boolean} noReset
     */
    noReset: { type: Boolean, attribute: 'no-reset' },

    /**
     * Whether or not to say the end phrase
     *
     * [default: false]
     *
     * @property {boolean} noSayEnd
     */
    noSayEnd: { type: Boolean, attribute: 'merge' },

    /**
     * Whether or not to say the start phrase
     *
     * [default: false]
     *
     * @property {boolean} noSayStart
     */
    noSayStart: { type: Boolean, attribute: 'no-say-start' },

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
     * The text to render within the pause button
     *
     * @property {string} pauseBtnTxt
     */
    pauseBtnTxt: { type: String, attribute: 'pause-btn-txt' },

    /**
     * The value for the pause button
     *
     * @property {string} pauseBtnValue
     */
    pauseBtnValue: { type: String, attribute: 'pausebtnvalue' },

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
     * A string that will be parsed to determin which intervals are
     * to be spoken
     *
     * > __Note:__ If both `say` and `sayData` are present, the value
     * >           from `say` will be ignored and `sayData` will be
     * >           used.
     *
     * > __Note also:__ If both `say` and `sayData` are empty, an
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
     * > __Note:__ If both `sayData` and `say` are present, the value
     * >           from `sayData` will be used and `say` will be
     * >           ignored.
     *
     * > __Note also:__ If both `sayData` and `say` are empty, an
     * >           error will be thrown. (We can't have a talking
     * >           timer with nothing to say)
     *
     * [default: []]
     *
     * @property {Array<{offset: number, message: string}>} sayData
     */
    sayData: { type: Array, attribute: 'say-data' },

    /**
     * The text to render within the start button
     *
     * @property {string} startBtnTxt
     */
    startBtnTxt: { type: String, attribute: 'start-btn-txt' },

    /**
     * Message to say to indicate the timer is about to start
     *
     * [default: "Ready, set, go!"]
     *
     * @property {string} startmessage
     */
    startmessage: { type: String, attribute: 'start-message' },

    /**
     * The number of _seconds after which the talking timer will self
     * destruct (i.e. will be removed from the DOM)
     *
     * If `selfDestruct` is not a number or is less than zero, self
     * destruct is off.
     *
     * [default: -1]
     *
     * @property {number} selfDestruct
     */
    selfDestruct: { type: Number, attribute: 'self-destruct' },

    /**
     * Current state of the timer
     * * `unset`   - Not enough data to start
     * * `ready`   - Timer is set but has not yet started
     * * `running` - Timer is counting down
     * * `paused`  - Timer has started but is currently paused
     * * `ending`  - Timer has finished counting down but there are
     *               still a message to say and/or a chime to sound
     * * `ended`   - Timer has (completely) finished counting down
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
    timerID: { type: String, attribute: 'timer-id' },

    /**
     * Comma separated list of names of voices to be used when
     * speeking intervals
     *
     * > __Note:__ names are case insensitive and trimmed.
     *
     * Each name in the list can be a partial match for a voice name.
     * e.g. for the voice name "Microsoft James - English (Australia)"
     *      *ALL* of the following would match:
     *      * "james"
     *      * "australia"
     *      * "english (australia)"
     *      * "microsoft"
     *      * "james - english"
     *
     * Your first matching preference will be used. If no match can
     * be made, the system default will be used.
     *
     * @property {string} voice
     */
    voice: { type: String },

    //  END:  public attributes
    // ----------------------------------------------------
  }

  constructor() {
    super();
    this.always = 'mst';
    this.autoReset = -1;
    this.autoStartAfter = -1;
    this.endMessage = 'Your time is up!';
    this.label = '';
    this.noEndChime = false;
    this.noPause = false;
    this.noRestart = false;
    this.noReset = false;
    this.noSayEnd = false;
    this.remaining = 0;
    this.pauseBtnTxt = 'Pause';
    this.pauseBtnValue = 'pause';
    this.startBtnTxt = 'Start';
    this.priority = 'fraction'
    this.percent = 1;
    this.say = '1/2 30s last20 last15 allLast10';
    this.sayData = [];
    this.mergeBoth = false;
    this.noSayStart = false;
    this.startmessage = 'Ready, Set, Go';
    this.selfDestruct = -1;
    this.state = 'unset';
    this.timerID = '';
    this.voice = '';


    // ----------------------------------------------------
    // START: non-reactive properties

    this._autoStartID = null;
    // this._defaultVoice = 'English (Australia)';
    this._defaultVoice = 'Catherine, James, English (Australia), Zira';

    this._decrementCB = this._getDecrementTimer(this);

    /**
     * ID of set interval used for decrementing time
     *
     * @property {number} _intervalID
     */
    this._intervalID = null;

    /**
     * Timestamp for the last time we decremented the time.
     *
     * @property {number} _lastTime
     */
    this._lastTime = null,

    /**
     * List of messages to announce
     *
     * Messages are ordered from next to last
     *
     * > __Note:__ Each time the timer is reset this value is
     * >           populated from this._ogMessages
     *
     * @property {Array<{offset: number, message: string}>} _messages
     */
    this._messages = [];

    /**
     * The next message will be spoken
     *
     * @property {number} _nextMsg
     */
    this._nextMsg = null;

    /**
     * Number of milliseconds remaining when the next message will
     * be spoken
     *
     * @property {number} _nextTime
     */
    this._nextTime = null;

    /**
     * Number of milliseconds remaining when the next message will
     * be spoken
     *
     * @property {number} _nextTime
     */
    this._nextRate = null;

    /**
     * The (original) list of messages to announce.
     *
     * This is used to populate this._messages
     *
     * @property {Array<{offset: number, message: string}>} _messages
     */
    this._ogMessages = [];

    /**
     * The total number milliseconds the timer will run for.
     *
     * Once the timer has started, this number will not be updated.
     *
     * > __Note:__ `_total` is used to calculate the percentage of
     * >           time remaining and the spacing of intervals if
     * >           `sayData` is empty.
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
    this._voice = window.speechSynthesis;
    this._voiceName = null;
    this._utterance = new SpeechSynthesisUtterance('');
    this._utterance.volume = 1;
    this._utterance.rate = 1;


    //  END:  non-reactive properties
    // ----------------------------------------------------
  }

  // ======================================================
  // START: public methods

  /**
   * Pause the timer if it is already running
   *
   * > __Note:__ A console warning will be shown if pause cannot
   * >           be performed
   */
  pause() {
    if (this.state === 'running') {
      this._pauseTimer();
    } else {
      console.warn(getPublicWarning('pause', 'running', this.state));
    }
  }

  /**
   * Reset the timer if it is currently running
   *
   * > __Note:__ A console warning will be shown if reset cannot
   * >           be performed
   */

  reset(force = false) {
    if (force === true) {
      clearInterval(this._intervalID);
      this._intervalID = null;

      this._setState('ended');
      this._setState('ready');
    }

    if (this.state !== 'running') {
      this._parseAttributes();
      // this._resetTimer();
    } else {
      console.warn(getPublicWarning('reset', 'running', this.state, ''));
    }
  }

  /**
   * Resume paused the timer
   *
   * > __Note:__ A console warning will be shown if resume cannot
   * >           be performed
   */
  resume() {
    if (this.state === 'paused') {
      this._resumeTimer();
    } else {
      console.warn(getPublicWarning('resume', 'paused', this.state));
    }
  }

  /**
   * Start the timer if it is either "ready" or "ended"
   *
   * > __Note:__ A console warning will be shown if start cannot
   * >           be performed
   */
  start() {
    if (this.state === 'ready' || this.state === 'ended') {
      this._doStartup();
    } else {
      console.warn(getPublicWarning('start', 'ready" or "ended', this.state));
    }
  }

  /**
   * Stop the timer if it is currently running
   *
   * > __Note:__ A console warning will be shown if stop cannot
   * >           be performed
   */
  stop(silentEnd = false) {
    if (this.state === 'running') {
      this._doEnding(silentEnd);
    } else {
      console.warn(getPublicWarning('stop', 'running', this.state));
    }
  }

  //  END:  public methods
  // ======================================================
  // START: private methods

  _parseAttributes () {
    // ----------------------------------------------------
    // START: Process duration

    const tmp = validateTimeDuration(this.duration);

    if (tmp === false) {
      throw new Error(
        '<talking-timer> must have a duration to work with. '
        + `duration ("${this.duration}") was invalid`,
      );
    }
    this._total = tmp;
    this.state = 'ready';

    //  END:  Process duration
    // ----------------------------------------------------
    // START: Message list

    const validSay = sayDataIsValid(this.sayData);
    const sayIsNES = (typeof this.say === 'string' || this.say.trim() !== '')

    if ((this.mergeBoth === false || sayIsNES === false) && validSay !== false) {
      this._ogMessages = validSay;
    } else if (sayIsNES === true) {
      if (typeof this.say === 'string') {
        this._ogMessages = parseRawIntervals(this._total, this.say);
      }

      if (this.mergeBoth === true || this._ogMessages.length === 0) {
        this._ogMessages = this._ogMessages.concat(validSay);
      }
    }

    if (Array.isArray(this._ogMessages) && this._ogMessages.length > 0) {
      this._ogMessages = filterOffsets(
        sortOffsets(this._ogMessages),
        this._total,
      );
    }

    this._resetData();

    //  END:  Message list
    // ----------------------------------------------------

    this.state = 'ready';

    // ----------------------------------------------------
    // START: Get speech voice

    this._voiceName = null;

    if (this.voice !== '') {
      this._voiceName = getVoiceName(this.voice);
    }
    if (this._voiceName === null) {
      console.group('Avaliable voices');
      console.warn(`We were unable to find a voice that matched "${this.voice}"`);
      console.log('Here is the list of voices available on your system:');
      console.log(speechSynthesis.getVoices().map((voice) => voice.name));
      console.groupEnd();

      this._voiceName = getVoiceName(this._defaultVoice);
    }

    if (this._voiceName !== null) {
      this._utterance.voice = this._voiceName;
    }
    //  END:  Get speech voice
    // ----------------------------------------------------
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

      case this.pauseBtnTxt.toLowerCase():
        this.dispatchEvent(
          new CustomEvent(
            'custompause',
            { bubbles: true, composed: true, detail: this.pauseBtnValue },
          ),
        );

    }
  }

  _getFutureStart() {
    return () => {
      if (this.state === 'ready') {
        this._resetData();
        this._doStartup();
      }
    }
  }

  _doEnding(silentEnd = false) {
    if (this.state !== 'running') {
      throw new Error(stateError('ended', 'running', this.state));
    }
    const noExtra = (silentEnd === true || (this.noEndChime === true && this.noSayEnd === true));

    this._setState((noExtra === false) ? 'ending' : 'ended');

    this.remaining = 0;
    clearInterval(this._intervalID);
    this._intervalID = null;
    let voice = null;
    let extra = 0;

    if (noExtra === true) {
      this._setState('ended');
      return;
    }

    const emitEnded = (context) => () => {
      context._setState('ended');

      if (context.autoStartAfter > -1) {
        context._autoStartID = setTimeout(
          context._getFutureStart(),
          (context.autoStartAfter + extra),
        );
      }
    };

    const playChimeLater = (context) => () => {
      const delay = playEndChime();

      setTimeout(emitEnded(context), delay);
    };

    if (this.noSayEnd !== true && this.endMessage !== '') {
      voice = saySomething(this.endMessage, this._voice, this._voiceName);

      if (this.noEndChime === true) {
        voice.addEventListener('end', emitEnded(this));
        return;
      }
    }

    if (this.noEndChime !== true) {
      if (voice !== null) {
        voice.addEventListener('end', playChimeLater(this));
      } else {
        playChimeLater(this)();
      }
    }
  }

  _doStartup() {
    if (this._autoStartID !== null) {
      clearTimeout(this._autoStartID);
      this._autoStartID = null;
    }
    this._setState('starting');
    if (this.noSayStart !== true) {
      // const voice = this._saySomething(this.startmessage, 1.25);
      const voice = saySomething(this.startmessage, this._voice, this._voiceName, 1.25);

      const startTimer = (context) => () => {
        this._lastTime = Date.now();
        context._initInterval(true);
        this._setState('running');
      };
      voice.addEventListener('end', startTimer(this));
    } else {
      this._lastTime = Date.now();
      this._initInterval(true);
      this._setState('running');
    }
  }

  _getDecrementTimer(context) {
    return () => {
      const now = Date.now();
      const minus = now - context._lastTime;
      context._lastTime = now;
      context.remaining = (context.remaining - minus);

      if (context.remaining <= 0) {
        this._doEnding();
      }

      context.percent = (context.remaining > 0)
        ? (Math.round((context.remaining / context._total) * 100000) / 1000)
        : 0;

      context._tryToSayNext()
    };
  }

  _getKeyUp(context) {
    return (event) => {
      if (event.shiftKey === true) {
        switch (event.key) {
          case 'S':
            event.preventDefault();
            switch (context.state) {
              case 'ready':
                if (context.noPause !== true) {
                  context._startTimer();
                }
                break;
              case 'running':
                context._pauseTimer();
                break;
              case 'paused':
                context._resumeTimer();
                break;
              case 'ended':
                context._restartTimer();
                break;
            }
            break;
          case 'N':
            switch (context.state) {
              case 'paused':
              case 'ended':
                context._resetTimer();
                break;
            }

          case 'R':
            switch (context.state) {
              case 'paused':
              case 'ended':
                context._restartTimer();
                break;
            }
        }
      }
    }
  }

  _getMilliseconds() {
    if (this.state !== 'ready') {
      return this.remaining;
    }

    const tmp = validateTimeDuration(this.duration);
    if (tmp !== false) {
      this._total = tmp;
    }

    return this._total;
  }

  _getNextMsg() {
    const tmp = this._messages.shift();

    if (typeof tmp !== 'undefined') {
      // Make the announcement fire one second early to account for
      // the delay in initialising the speech synthesizer
      this._nextTime = (tmp.offset + 800);
      this._nextMsg = tmp.message;
      this._nextRate = (typeof tmp.rate === 'number')
        ? tmp.rate
        : 1;
    } else {
      this._nextTime = null;
      this._nextMsg = null;
      this._nextRate = null;
    }
  }

  _initInterval(force = false) {
    if (this._intervalID === null || force === true) {
      this._intervalID = setInterval(this._decrementCB, 50);
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
    this._tryToSayNext()
  }

  _resetData() {
    this._messages = [...this._ogMessages];
    this.remaining = this._total;
    this.percent = 100;
    this._tryToSayNext();
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
    this._doStartup();
  }

  _resumeTimer() {
    if (this.state !== 'paused') {
      throw new Error(stateError('resume', 'paused', this.state));
    }
    this._setState('running');
    this._lastTime = Date.now();

    this._initInterval();
  }

  _saySomething(text, rate = 1) {
    this._utterance.text = text;
    this._utterance.rate = rate;
    this._voice.speak(this._utterance);
    return this._utterance;
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
    this._doStartup();
  }

  _tryToSayNext() {
    if (this._nextTime === null || this._nextTime > this.remaining) {
      if (this._nextMsg !== null) {
        // this._saySomething(this._nextMsg);
        saySomething(this._nextMsg, this._voice, this._voiceName, this._nextRate);
      }
      this._getNextMsg();
    }
  }

  //  END:  private methods
  // ======================================================
  // START: lifecycle methods

  connectedCallback() {
    super.connectedCallback();
    this._parseAttributes();

    // this._parseAttributes();
    this.getRootNode().addEventListener('keyup', this._keyUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.getRootNode().removeEventListener('keyup', this._keyUp);
    this.state = 'unset';

  }

  //  END:  lifecycle methods
  // ======================================================
  // START: render

  render() {
    const no = {
      pause: this.noPause,
      reset: this.noReset,
      restart: this.noRestart,
    };
    const btnTxt = {
      start: this.startBtnTxt,
      pause: this.pauseBtnTxt,
    }
    return html`
      <div class="wrap" @keyup=${this._keyUp}>
        <header>
          <slot><h2>${this.label}</slot>
        </header>
        <main>
          ${(this.state !== 'unset')
            ? html`<time-display
                .always="${this.always}"
                .milliseconds="${this._getMilliseconds()}"
                .progress=${(100 - this.percent)}
                .label="${this.label}"></time-display>`
            : ''
          }
        </main>
        <footer>
          ${(this.state === 'unset')
            ? html`<p>Not enough data</p>`
            : getMainBtn(this.state, this._btnClick, no, btnTxt)
          }
          ${(this.state === 'paused' && no.restart !== true)
            ? getOtherBtn('Restart', this._btnClick)
            : ''
          }
          ${((this.state === 'paused' || this.state === 'ended')  && no.reset !== true)
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
        border: var(--tt-border, 0.05rem solid #000);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        font-family: var(--tt-font, arial, helvetica, sans-serif);
        justify-content: center;
        margin: 0 auto;
        max-width: 18rem;
        min-width: 12.5rem;
        width: 100%;

      }
      footer {
        border-top: var(--tt-border, 0.05rem solid #000);
        display: flex;
        gap: var(--tt-padding, 0.5rem);
        justify-content: center;
        min-height: 2.125rem;
        padding: var(--tt-padding, 0.5rem);
      }
      .btn {
        border-radius: var(--tt-btn-bdr-radius, 0);
        border: var(--tt-border, 0.05rem solid #000);
        flex-grow: 1;
        font-family: var(--st-btn-font, verdana, arial, helvetica, sans-serif);
        font-weight: bold;
        padding: 0.5rem;
        text-transform: var(--tt-t-transform, uppercase);
      }
      .btn--start, .btn--resume {
        background-color: var(--tt-btn-bg-colour-start, #030);
      }
      .btn--pause, .btn--restart {
        background-color: var(--tt-btn-bg-colour-pause, #004);
      }
      .btn--reset {
        background-color: var(--tt-btn-bg-colour-rest, #600);
      }
      main {
        padding: var(--tt-padding, 0.5rem);
      }
      h2 {
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

  //  END:  render
  // ======================================================
}

window.customElements.define('talking-timer', TalkingTimer);
