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
     * The number of milliseconds remaining
     *
     * This is used to keep track of the number of milliseconds
     * remaining. It's value is used to update the `remaining` value
     *
     * @property {number} _milliseconds
     */
    _milliseconds: { type: Number, state: true },

    /**
     * whether or not to play the end chime
     *
     * @property {string} noendchime
     */
    noendchime: { type: Boolean },

    /**
     * Copy for the read the docs hint.
     *
     * @property {boolean} noPause
     */
    nopause: { type: Boolean, default: false },

    /**
     * Whether or not to say the end phrase
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
     * * `ready`   - Timer is set but has not yet started
     * * `running` - Timer is counting down
     * * `paused`  - Timer has started but is currently paused
     * * `ended`   - Timer has finished counting down
     *
     * @property {string} state
     */
    state: { type: String, reflect: true },

    /**
     * The number
     */
    timer: { type: Number, reflect: true },

    /**
     * The number of times the button has been clicked.
     *
     * @property {number|string} duration
     */
    duration: {  },
  }

  constructor() {
    super()
    this.docsHint = 'Click on the Vite and Lit logos to learn more'
    this.count = 0
  }

  render() {
    return html`
      <div>
        <input type="progress" value=
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
