import { LitElement, css, html } from 'lit';
import { sayDataIsValid, validateTimeDuration } from '../utils/talking-timer.utils';
import { parseRawIntervals } from '../utils/interval-parser.utils';

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
     * List of messages to announce
     *
     * @property {Array<{time: number, msg: string}>} _messages
     */

    _remainingLabel: { type: String, state: true },

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
     * @property {number} percent
     */
    remaining: { type: Number, reflect: true },

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
     * @property {Array<{time: number, msg: string}>} saydata
     */
    saydata: { type: Array },

    /**
     * Whether or not to say the start phrase
     *
     * [default: false]
     *
     * @property {string} saystart
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
     * The number of seconds after which the talking timer will self
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
     *   to represent seconds
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
    super()
    this.autoreset = -1;
    this.endmessage = "Time's up!";
    this.noendchime = false;
    this.nopause = false;
    this.nosayend = false;
    this.priority = 'fraction'
    this.percent = 1;
    this.say = '1/2 30s last20 last15 allLast10';
    this.saydata = [];
    this.saystart = false;
    this.startmessage = 'Ready. Set. Go!';
    this.selfdestruct = -1;
    this.state = 'unset';

    // ----------------------------------------------------
    // START: non-reactive properties

    /**
     * List of messages to announce
     *
     * Messages are ordered from next to last
     *
     * @property {Array<{time: number, msg: string}>} _messages
     */
    this._messages = [];

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

    //  END:  non-reactive properties
    // ----------------------------------------------------
  }

  pauseResume() {
    let txt = '';

    if (this.state === 'running') {
      txt = 'Pause';
    } else if (this.state === 'paused') {
      txt = 'Resume';
    }

    return (txt !== '')
      ? html`<button .value="${txt}" @click=${this._btnClick}>${txt}</button>`
      : '';
  }

  render() {
    return html`
      <div>
        <header>
          <slot></slot>
        </header>
        <main>
          <span>${this.humanremaining}</span>
          <label for="remaining-progress">${this._remainingLabel}</label>
          <progress type="progress" id="remaining-progress" .value=${(1 - this.percent)} />
        </main>
        <footer>
          ${(this.state === 'unset')
            ? html`<p>Not enough data</p>`
            : ''
          }
          ${(this.state === 'ready')
            ? html`<button value="start" @click=${this._btnClick}>Start</button>`
            : ''
          }
          ${(this.nopause === false)
            ? this.pauseResume()
            : ''
          }
          ${(this.state === 'paused' || this.state === 'ended')
            ? html`<button value="restart" @click=${this._btnClick}>Restart</button>`
            : ''
          }
        </footer>
      </div>
    `
  }

  parseAttributes () {
    // ----------------------------------------------------
    // START: Process duration

    const tmp = validateTimeDuration(this.duration);

    if (tmp === false) {
      throw new Error('<talking-timer> must have a duration to work with. `duration` was invalid');
    }
    this._total = tmp;

    //  END:  Process duration
    // ----------------------------------------------------
    // START: Message list

    if (sayDataIsValid(this.saydata)) {
      this._messages = this.saydata.map(item => ({ time: item.time, message: item.msg }));
      this._messages.sort((a, b) => {
        if (a.time > b.time) {
          return -1;
        }
        if (a.time < b.time) {
          return 1;
        }
        return 0;
      });
    } else if (typeof this.say === 'string' || this.say.trim() === '') {
      this._messages = parseRawIntervals(this._total, this.say);
    }

    //  END:  Message list
    // ----------------------------------------------------

    this.state = 'ready' ;
  }

  connectedCallback() {
    super.connectedCallback();

    this.parseAttributes();
  }

  startTimer() {

  }

  pauseTimer() {

  }

  resumeTimer() {

  }

  resetTimer() {

  }

  _onClick() {
    this.count++
  }
  _btnClick(event) {
    const { value } = event.target;

    switch (value) {
      case 'start':
        if (this.state === 'ready') {
          this.state = 'running';
          this.startTimer();
        } else {
          throw new Error('cannot start timer because <talking-timer> is not ready');
        }
        break;

      case 'Pause':
        if (this.state === 'running') {
          this.state = 'paused';
          this.pauseTimer();
        } else {
          throw new Error('cannot pause timer because <talking-timer> is not running');
        }
        break;

      case 'Resume':
        if (this.state === 'paused') {
          this.state = 'running';
          this.resumeTimer();
        } else {
          throw new Error('cannot resume timer because <talking-timer> is not paused');
        }
        break;

      case 'restart':
          if (this.state === 'paused' || this.state === 'ended') {
            this.state = 'running';
            this.startTimer();
          } else {
            throw new Error('cannot resume timer because <talking-timer> is not paused and not ended');
          }

    }
  }

  static get styles() {
    return css`
    `
  }
}

window.customElements.define('talking-timer', TalkingTimer);
