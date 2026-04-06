import { LitElement, css, html, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  getEpre,
  getPublicWarning,
  // millisecondsToTimeObj,
  validateTimeDuration,
} from '../utils/talking-timer.utils';
import {
  filterOffsets,
  parseRawIntervals,
  sayDataIsValid,
  sortOffsets,
} from '../utils/interval-parser.utils';
import {
  // getMainBtn,
  getOtherBtn,
  stateError,
} from './talking-timer.renderers';
import { getVoiceName, saySomething } from '../utils/speach.utils';
import { playEndChime } from '../utils/sound.utils';
// import playEndChime from '../utils/play-tone';
import './time-display';
import ComponentComms from '../utils/component-comms/ComponentComms.class';
import type { TDoingSayData, TTalkingTimerState, TTTconfig } from '../types/generic-types';
import { getEventIdVal } from '../utils/general.utils';

/**
 * <talking-timer> is an accessible, customisable, web component that
 * counts down from a specified time and announces intervals as it
 * counts down. It is designed to be used in situations where you
 * want to be able to focus on a task without having to worry about
 * keeping track of the time or when you want to be able to hear how
 * much time is left without having to look at a timer.
 */
@customElement('talking-timer')
export class TalkingTimer extends LitElement {
  /**
   * Whether or not to auto reset the timer as soon as it ends
   *
   * If `autoreset` is not a number or is less than zero, auto
   * reset is off.
   *
   * @default -1 (off)
   */
  @property({ type: String, attribute: 'always' })
  always : string = 'mst';

  @property({ type: Number, attribute: 'auto-rest' })
  autoReset : number = -1;

  @property({ type: Number, attribute: 'auto-start-after' })
  autoStartAfter : number = -1;

  /**
   * `comms` is used to pass (via comms events) between components
   * that are directly connected through the DOM tree.
   */
  @property({ type: ComponentComms })
  comms : ComponentComms | null = null;

  /**
   * The number of milliseconds that must pass between button clicks
   */
  @property({ type: Number, attribute: 'debounce-time' })
  debounceTime : number = 200;


  /**
   * The amount of time the timer is set to count down from. This can be in one of the following formats:
   *
   * * If `duration` is a number less than 10000 it will be assumed
   *   to represent total seconds
   * * If `duration` is a number greater than or equal to 10000 it
   *   will be assumed to represent milliseconds
   * * If `duration` is a string that can be matched by the pattern:
   *   HH:MM:SS or MM:SS it will be converted to milliseconds
   *   /^[0-9]{1,2}(?::[0-9]{2}(?::[0-9]{2})?)?$/
   */
  @property({ attribute: 'duration'})
  duration : string | number = '';

  /**
   * Heading to show at the top of the timer.
   *
   * @default "Time's up"
   */
  @property({ type: String, attribute: 'end-message' })
  endMessage : string = 'Your time is up!';

  /**
   * The human readable time string for the amount of time
   * remaining before the timer ends
   */
  @property({ type: String, reflect: true, attribute: 'human-remaining' })
  humanRemaining : string = '';

  /**
   * Label for talking timer
   */
  @property({ type: String, attribute: 'label' })
  label : string = '';

  /**
   * Sometimes you just want to add a couple of custom messages in
   * between the normal interval messages. If that's the case add
   * your custom messages to `sayData` and set your normal
   * intervals in `say.
   *
   * @default false
   */
  @property({ type: Boolean, attribute: 'merge-both' })
  mergeBoth: boolean = false;

  /**
   * whether or not to play the end chime
   *
   * @default false
   */
  @property({ type: Boolean, attribute: 'no-end-chime' })
  noEndChime: boolean = false;

  /**
   * Whether or not the user can pause the timer
   *
   * @default false
   */
  @property({ type: Boolean, attribute: 'no-pause' })
  noPause: boolean = false;

  /**
   * Whether or not the user can restart the timer
   *
   * @default false
   */
  @property({ type: Boolean, attribute: 'no-restart' })
  noRestart: boolean = false;

  /**
   * Whether or not the user can reset the timer
   *
   * @default false
   */
  @property({ type: Boolean, attribute: 'no-reset' })
  noReset: boolean = false;

  /**
   * Whether or not to say the end phrase
   *
   * @default false
   */
  @property({ type: Boolean, attribute: 'no-say-end' })
  noSayEnd: boolean = false;

  /**
   * Whether or not to say the start phrase
   *
   * @default false
   */
  @property({ type: Boolean, attribute: 'no-say-start' })
  noSayStart: boolean = false;

  /**
   * The percentage of time remaining until timer ends
   *
   * `percent` is represented as a number between 1 & 0
   *
   * > __Note:__ `percent` will be updated every time
   * >           `_milliseconds` is updated
   *
   * @default 1
   */
  @property({ type: Number, reflect: true })
  percent: number = 1;

  /**
   * The text to render within the pause button
   */
  @property({ type: String, attribute: 'pause-btn-txt' })
  pauseBtnTxt: string = '';

  /**
   * The value for the pause button that will be passed in the
   * `detail` property of the `custompause` event when the pause
   * button is clicked
   */
  @property({ type: String, attribute: 'pause-btn-value' })
  pauseBtnValue: string = '';

  /**
   * `priority` sets which announcements are discarded and which
   * are spoken if multiple announcements are due around the same
   * time.
   *
   * To reduce the amount of talking, announcements can only be
   * made if they are seven seconds later or earlier than another
   * anouncement. By default fraction anouncements have priority
   * e.g. when the timer is set to 3 minutes, the "Half way"
   * announcement is also the same as the "One minute, thirty
   * seconds to go" anouncement so the "Half way" announcement
   * is spoken but the "One minute, thirty seconds to go." is
   * skipped.
   *
   * `priority` options:
   * It's possible (even probable) that, when using fraction
   * intervals (like `1/2`) and time intervals (like `30s`) you
   * will get two announcements for the same interval. In this
   * case, the priority decides which is spoken.
   *
   * * `fraction` Fraction intervals are spoken if there's a
   *              conflict between a time and a fraction
   *              announcement.
   * * `time`     time intervals are spoken if there's a confilict
   *              between a time and a fraction announcement.
   * * `order`    order they're defined in `speak` - the one defined
   *              first over-rides one spoken at a similar time but
   *              defined later.
   *
   * @default "fraction"
   */
  @property({ type: String })
  priority: string = 'fraction';

  /**
   * The number of milliseconds remaining
   *
   * > __Note:__ `remaining` is never read internally.
   * >           Every time `_milliseconds` is updated, `remaining`
   * >           will be overwritten with the value from `_milliseconds`
   */
  @property({ type: Number, reflect: true })
  remaining: number = 0;

  /**
   * A string that will be parsed to determin which intervals are
   * to be spoken
   *
   * > __Note:__ If both `say` and `sayData` are present and
   * >           `merge-both` is absent, the value from `sayData`
   * >           will be used and `say` will be ignored.
   * >           If `say` and `sayData` *AND* `merge-both` are
   * >           present, `sayData` will be merged into the normal
   * >           `say` messages.
   *
   * > __Note also:__ If both `say` and `sayData` are empty, an
   * >           error will be thrown. (We can't have a talking
   * >           timer with nothing to say)
   *
   * @default "1/2 30s last20 last15 allLast10"
   */
  @property({ type: String })
  say: string = '1/2 30s last20 last15 allLast10';

  /**
   * A list of time/message pairs, where the time represents the
   * time from end the message is to be announced and the message
   * is the text that will be converted to speach and announced.
   *
   * > __Note:__ If both `sayData` and `say` are present and
   * >           `merge-both` is absent, the value from `sayData`
   * >           will be used and `say` will be ignored.
   * >           If `sayData` and `say` *AND* `merge-both` are
   * >           present, `sayData` will be merged into the normal
   * >           `say` messages.
   *
   * > __Note also:__ If both `sayData` and `say` are empty, an
   * >           error will be thrown. (We can't have a talking
   * >           timer with nothing to say)
   *
   * @default []
   */
  @property({ type: Array, attribute: 'say-data' })
  sayData: TDoingSayData[] = [];

  /**
   * The text to render within the start button
   */
  @property({ type: String, attribute: 'start-btn-txt' })
  startBtnTxt: string = '';

  /**
   * Message to say to indicate the timer is about to start
   *
   * @default "Ready, set, go!"
   */
  @property({ type: String, attribute: 'start-message' })
  startmessage: string = 'Ready, Set, Go';

  /**
   * The number of _seconds after which the talking timer will self
   * destruct (i.e. will be removed from the DOM)
   *
   * If `selfDestruct` is not a number or is less than zero, self
   * destruct is off.
   *
   * @default -1 (off)
   */
  @property({ type: Number, attribute: 'self-destruct' })
  selfDestruct: number = -1;

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
   * @default "unset"
   */
  @property({ type: String, reflect: true })
  state : TTalkingTimerState = 'unset';

  /**
   * The total number milliseconds the timer will run for
   *
   * > __Note:__ This number will never be read internally.
   * >           It is instead a public representation of `_total`
   */
  @property({ type: Number, reflect: true })
  timer : number = 0;

  @property({ type: String, attribute: 'timer-id' })
  timerID : string = '';

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
   */
  @property({ type: String })
  voice: string = '';

  //  END:  public attributes
  // ----------------------------------------------------

  @state()
  _autoStartID : number | null = null;

  @state()
  _defaultVoice : string = 'Catherine, James, English (Australia), Zira';

  @state()
  _debounce : number = 200;

  /**
   * ID of set interval used for decrementing time
   */
  @state()
  _intervalID : number | null = null;

  /**
   * Timestamp for the last time we decremented the time.
   */
  @state()
  _lastTime : number = -1;

  /**
   * List of messages to announce
   *
   * Messages are ordered from next to last
   *
   * > __Note:__ Each time the timer is reset this value is
   * >           populated from this._ogMessages
   */
  @state()
  _messages : TDoingSayData[] = [];

  /**
   * The next message will be spoken
   */
  @state()
  _nextMsg : string = '';

  /**
   * @property {number} _nextRate rate at which the next message
   * will be spoken
   */
  @state()
  _nextRate : number = 1;

  /**
   * Number of milliseconds remaining
   * when the next message will be spoken
   */
  @state()
  _nextTime : number = -1;

  /**
   * @property {} _ogMessages The (original) list of
   * messages to announce.
   *
   * This is used to populate this._messages
   */
  @state()
  _ogMessages : TDoingSayData[] = [];

  /**
   * @property {} _total The total number milliseconds the
   * timer will run for.
   *
   * Once the timer has started, this number will not be updated.
   *
   * > __Note:__ `_total` is used to calculate the percentage of
   * >           time remaining and the spacing of intervals if
   * >           `sayData` is empty.
   *
   *
   */
  @state()
  _total : number = 0;

  @state()
  _suffixes = {
    first: ' gone',
    last: ' to go',
    half: 'Half way',
  };
  @state()
  _ePre = getEpre('talking-timer');

  @state()
  _voice = window.speechSynthesis;

  @state()
  _voiceName : SpeechSynthesisVoice | null = null;

  @state()
  _utterance = new SpeechSynthesisUtterance('');

  @state()
  _extra : number = 0;

  // ======================================================
  // START: public methods

  /**
   * Pause the timer if it is already running
   *
   * > __Note:__ A console warning will be shown if pause cannot
   * >           be performed
   */
  pause() : void {
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

  reset(force = false) : void {
    if (force === true) {
      if (this._intervalID !== null) {
        clearInterval(this._intervalID);
        this._intervalID = null;
      }

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
  resume() : void {
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
  start() : void {
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
  stop(silentEnd = false) : void {
    if (this.state === 'running') {
      this._doEnding(silentEnd);
    } else {
      console.warn(getPublicWarning('stop', 'running', this.state));
    }
  }

  //  END:  public methods
  // ======================================================
  // START: private methods

  _parseAttributes() : void {
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

    const validSay : false | TDoingSayData[] = sayDataIsValid(this.sayData);
    const sayIsNES : boolean = (typeof this.say === 'string'
      && this.say.trim() !== '');

    if ((this.mergeBoth === false || sayIsNES === false)
      && validSay !== false
    ) {
      this._ogMessages = validSay;
    } else if (sayIsNES === true) {
      if (typeof this.say === 'string') {
        this._ogMessages = parseRawIntervals(this._total, this.say);
      }

      if ((this.mergeBoth === true || this._ogMessages.length === 0) && validSay !== false) {
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
      this._voiceName = getVoiceName(this._defaultVoice);
    }

    if (this._voiceName !== null) {
      this._utterance.voice = this._voiceName;
    }
    //  END:  Get speech voice
    // ----------------------------------------------------
  }

  _btnClick(event : Event) : void {
    const now = Date.now();

    if (this._debounce === null || now > this._debounce) {
      this._debounce = now + this.debounceTime;
      const { value } = getEventIdVal(event);

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
  }

  _futureStart() : void {
    if (this.state === 'ready') {
      this._resetData();
      this._doStartup();
    }
  }

  _emitEnded() : void {
    this._setState('ended');

    if (this.autoStartAfter > -1) {
      this._autoStartID = setTimeout(
        this._futureStart.bind(this),
        (this.autoStartAfter + this._extra),
      );
    }
  }

  _playChimeLater() : void {
    const delay = playEndChime();

    setTimeout(this._emitEnded.bind(this), delay);
  }

  _doEnding(silentEnd : boolean = false) : void {
    if (this.state !== 'running') {
      throw new Error(stateError('ended', 'running', this.state));
    }

    const noExtra = (silentEnd === true || (this.noEndChime === true && (this.noSayEnd === true || this.endMessage === '')));

    this._setState((noExtra === false) ? 'ending' : 'ended');

    this.remaining = 0;
    if (this._intervalID !== null) {
      clearInterval(this._intervalID);
      this._intervalID = null;
    }
    let voice = null;
    this._extra = 0;

    if (noExtra === true) {
      this._setState('ended');
      return;
    }

    if (this.noSayEnd !== true
      && this.endMessage !== ''
      && this._voiceName !== null
    ) {
      voice = saySomething(this.endMessage, this._voice, this._voiceName);

      if (this.noEndChime === true) {
        voice.addEventListener('end', this._emitEnded.bind(this));
        return;
      }
    }

    if (this.noEndChime !== true) {
      if (voice !== null) {
        voice.addEventListener('end', this._playChimeLater.bind(this));
      } else {
        this._playChimeLater();
      }
    }
  }

  _startupTimer() : void {
    this._lastTime = Date.now();
    this._initInterval(true);
    this._setState('running');
  }

  _doStartup() : void {
    if (this._autoStartID !== null) {
      clearTimeout(this._autoStartID);
      this._autoStartID = null;
    }
    this._setState('starting');

    if (this.noSayStart !== true && this._voiceName !== null) {
      const voice = saySomething(
        this.startmessage,
        this._voice,
        this._voiceName, 1.25,
      );
      voice.addEventListener('end', this._startupTimer.bind(this));
    } else {
      this._lastTime = Date.now();
      this._initInterval(true);
      this._setState('running');
    }
  }

  _handleKeyup(event : Event) : void {
    if (event instanceof KeyboardEvent && event.shiftKey === true) {
      switch (event.key) {
        case 'S':
          event.preventDefault();
          switch (this.state) {
            case 'ready':
              if (this.noPause !== true) {
                this._startTimer();
              }
              break;
            case 'running':
              this._pauseTimer();
              break;
            case 'paused':
              this._resumeTimer();
              break;
            case 'ended':
              this._restartTimer();
              break;
          }
          break;

        case 'N':
          switch (this.state) {
            case 'paused':
            case 'ended':
              this._resetTimer();
              break;
          }
          break;

        case 'R':
          switch (this.state) {
            case 'paused':
            case 'ended':
              this._restartTimer();
              break;
          }
      }
    }
  }

  _getMilliseconds() : number {
    if (this.state !== 'ready') {
      return this.remaining;
    }

    const tmp = validateTimeDuration(this.duration);
    if (tmp !== false) {
      this._total = tmp;
    }

    return this._total;
  }

  _setNextMsg() : void {
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
      this._nextTime = -1;
      this._nextMsg = '';
      this._nextRate = 1;
    }
  }

  _decrementTimer() : void {
    // console.group('_decrementCB()');
    // console.log('this.remaining', this.remaining);
    // console.log('this._lastTime', this._lastTime);
    // console.log('this._total', this._total);
    const now = Date.now();
    const minus = now - this._lastTime;
    this._lastTime = now;
    this.remaining = (this.remaining - minus);

    if (this.remaining <= 0) {
      this._doEnding();
    }

    this.percent = (this.remaining > 0)
      ? (Math.round((this.remaining / this._total) * 100000) / 1000)
      : 0;

    this._tryToSayNext()
    // console.log('this.percent', this.percent);
    // console.log('this._total', this._total);
    // console.log('this.remaining', this.remaining);
    // console.log('this._lastTime', this._lastTime);
    // console.groupEnd();
  }

  _initInterval(force = false) : void {
    if (this._intervalID === null || force === true) {
      this._intervalID = setInterval(this._decrementTimer.bind(this), 50);
    }
  }

  _pauseTimer() : void {
    if (this.state !== 'running') {
      throw new Error(stateError('pause', 'running', this.state));
    }
    this._setState('paused');

    if (this._intervalID !== null) {
      clearInterval(this._intervalID);
      this._intervalID = null;
    }
    // this._decrementCB();
    // this._tryToSayNext()
  }

  _resetData() : void {
    this._messages = [...this._ogMessages];
    this.remaining = this._total;
    this.percent = 100;
    this._tryToSayNext();
  }

  _resetTimer() : void {
    if (this.state !== 'paused' && this.state !== 'ended') {
      throw new Error(stateError('reset', 'paused" or "ended', this.state));
    }
    this._resetData();
    this._setState('ready');
  }

  _restartTimer() : void {
    if (this.state !== 'paused' && this.state !== 'ended') {
      throw new Error(stateError('restart', 'paused', this.state));
    }
    this._resetData();
    this._doStartup();
  }

  _resumeTimer() : void {
    if (this.state !== 'paused') {
      throw new Error(stateError('resume', 'paused', this.state));
    }
    this._setState('running');
    this._lastTime = Date.now();

    this._initInterval();
  }

  _saySomething(
    text : string,
    rate : number = 1,
  ) : SpeechSynthesisUtterance | null {
    this._utterance.text = text;
    this._utterance.rate = rate;
    this._voice.speak(this._utterance);
    return this._utterance;
  }

  _setState(newState : TTalkingTimerState) {
    if (this.state !== newState) {
      this.state = newState;
      this.dispatchEvent(
        new Event('statechange', { bubbles: true, composed: true })
      );
    }
  }

  async _startTimer() : Promise<void> {
    if (['ready', 'ended', 'starting'].includes(this.state) === false) {
      throw new Error(stateError('start', 'ready" or "endend', this.state));
    }
    if (this.state !== 'starting') {
      this._doStartup();
    }
  }

  _tryToSayNext() : void {
    if ((this._nextTime === null || this._nextTime > this.remaining)
      && this._voiceName !== null
    ) {
      if (this._nextMsg !== null) {
        saySomething(
          this._nextMsg,
          this._voice,
          this._voiceName,
          this._nextRate,
        );
      }
      this._setNextMsg();
    }
  }

  _getMainBtnData() : { txt: string, val: string } | null {
    let txt = '';
    let val = '';

    switch (this.state) {
      case 'ready':
        txt = this.startBtnTxt;
        // val = this.startBtnValue;
        break;

      case 'running':
        if (this.noPause === false) {
          txt = this.pauseBtnTxt;
          val = this.pauseBtnValue;
        }
        break;

      case 'paused':
        txt = 'Resume';
        break;

      case 'ended':
        txt = 'Restart';
        break;

      default:
        return null;
    }

    if (txt === '') {
      return null;
    }

    if (val === '') {
      val = txt.toLocaleLowerCase();
    }

    return { txt, val };
  }

  _handleConfigUpdate(config : TTTconfig) : void {
    this.duration = config.duration;
    this.noEndChime = config.noEndChime;
    this.noSayEnd = config.noSayEnd;
    this.noSayStart = config.noSayStart;
    this._parseAttributes();
  }

  _handleSayDataUpdate(data : unknown) : void {
    console.group('_handleSayDataUpdate()');
    console.log('data:', data);
    console.groupEnd();
  }

  _handleSayListUpdate(data : unknown) : void {
    console.group('_handleSayListUpdate()');
    console.log('data:', data);
    console.groupEnd();
  }

  _handleEndMsgUpdate(data : unknown) : void {
    console.group('_handleEndMsgUpdate()');
    console.log('data:', data);
    console.groupEnd();
  }

  _handleDurationUpdate(data : unknown) : void {
    console.group('_handleDurationUpdate()');
    console.log('data:', data);
    console.groupEnd();
  }

  //  END:  private methods
  // ======================================================
  // START: lifecycle methods

  connectedCallback() : void {
    super.connectedCallback();
    this._parseAttributes();

    // this._parseAttributes();
    this.getRootNode().addEventListener(
      'keyup',
      this._handleKeyup.bind(this),
    );

    if (this.comms !== null) {
      this.comms.addListener(
        'confirmconfig',
        this.timerID,
        this._handleConfigUpdate.bind(this),
      );
      this.comms.addListener(
        'saydata',
        this.timerID,
        this._handleSayDataUpdate.bind(this)
      );
      this.comms.addListener(
        'endmsg',
        this.timerID,
        this._handleEndMsgUpdate.bind(this)
      );
      this.comms.addListener(
        'saylist',
        this.timerID,
        this._handleSayListUpdate.bind(this)
      );
      this.comms.addListener(
        'duration',
        this.timerID,
        this._handleDurationUpdate.bind(this)
      );
    }
  }

  disconnectedCallback() : void {
    super.disconnectedCallback();
    this.getRootNode().removeEventListener(
      'keyup',
      this._handleKeyup.bind(this),
    );
    this.state = 'unset';

    if (this.comms !== null) {
      this.comms.removeListenersById(this.timerID);
    }
  }

  //  END:  lifecycle methods
  // ======================================================
  // START: render

  render() : TemplateResult {
    const no = {
      pause: this.noPause,
      reset: this.noReset,
      restart: this.noRestart,
    };
    const mainBtn = this._getMainBtnData();

    return html`
      <div class="wrap" @keyup=${this._handleKeyup.bind(this)}>
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
        <footer @click=${this._btnClick}>
          ${(this.state === 'unset')
            ? html`<p>Not enough data</p>`
            : (mainBtn !== null)
              ? html`<button accesskey="s" class="btn btn--${mainBtn.val}" .value="${mainBtn.val}" @click=${this._btnClick}>${mainBtn.txt}</button>`
              : ''
            // : getMainBtn(this.state, this._btnClick, no, btnTxt)
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

  static styles = css`
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
      cursor: pointer;
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

  //  END:  render
  // ======================================================
}

declare global {
  interface HTMLElementTagNameMap { 'talking-timer': TalkingTimer }
};
