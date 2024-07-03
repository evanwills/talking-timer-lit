import { LitElement, css, html } from 'lit';

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
    nopause: { type: Boolean, default: false },

    /**
     * Whether or not to say the end phrase
     *
     * [default: false]
     *
     * @property {string} nosayend
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
     * @property {object[]} heading
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
     * @property {number} timer
     */
    _total: { type: Number, state: true },

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
    duration: {  },
  }

  constructor() {
    super()
    this.autoreset = -1;
    this.endmessage = "Time's up!";
    this.noendchime = false;
    this.nopause = false;
    this.nosayend = false;
    this.percent = 1;
    this.say = '1/2 30s last20 last15 allLast10';
    this.saydata = [];
    this.saystart = false;
    this.startmessage = 'Ready. Set. Go!';
    this.selfdestruct = -1;
    this.state = 'unset';
  }

  pauseResume() {
    let txt = '';

    if (this.state === 'running') {
      txt = 'Pause';
    } else if (this.state === 'paused') {
      txt = 'Resume';
    }

    return (txt !== '')
      ? html`<button value=>${txt}</button>`
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
            ? html`<button>Start</button>`
            : ''
          }
          ${(this.nopause === false)
            ? this.pauseResume()
            : ''
          }
          ${(this.state === 'paused' || this.state === 'ended')
            ? html`<button>Restart</button>`
            : ''
          }
        </footer>
      </div>
    `
  }

  _onClick() {
    this.count++
  }

  static get styles() {
    return css`
    `
  }
}

window.customElements.define('talking-timer', TalkingTimer);
