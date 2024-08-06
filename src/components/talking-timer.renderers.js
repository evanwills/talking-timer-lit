import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export const getMainBtn = (state, clicker, no, btnTxt) => {
  let txt = '';
  // console.group('getMainBtn()');
  // console.log('state:', state);
  // console.log('clicker:', clicker);
  // console.groupEnd();

  switch (state) {
    case 'ready':
      txt = btnTxt.start;
      break;

    case 'running':
      if (no.pause === true) {
        return '';
      }
      txt = btnTxt.pause;
      break;

    case 'paused':
      txt = 'Resume';
      break;

    case 'ended':
      txt = 'Restart';
      break;

    default:
      return '';
  }

  if (txt === '') {
    return '';
  }

  let val = txt.toLowerCase();

  const cls = `btn btn--${val}`;
  return html`<button accesskey="S" class="${cls}" .value="${val}" @click=${clicker}>${txt}</button>`;
};

export const getOtherBtn = (text, clicker) => {
  let txt = text.trim();

  if (txt === '') {
    return '';
  }

  const val = txt.toLowerCase();
  const key = (val === 'restart')
    ? 'R'
    : 'N'

  return html`<button accesskey="${key}" class="btn btn--${val}" .value="${val}" @click=${clicker}>${txt}</button>`;
}

export const stateError = (action, requireStates, state) => {
  return `Cannot ${action} timer because it is not in the `
   +`"${requireStates}" state. Current state: "${state}"`;
};


export const getSelect = (label, value, options, id, changer, s = 's') => html`
  <li>
    <div>
      <label .for="${id}">${label}</label>
      <select .id="${id}" @change=${changer}>
        ${options.map((option) => html`<option value="${option.value}" ?selected=${(option.value === value)}>${unsafeHTML(option.label)}${s}</option>`)}
      </select>
    </div>
  </li>
`;

export const getRadio = (type, checked, changer) => {
  const _type = type.toLowerCase();
  return html`
    <li>
      <label for="ss-type--${_type}">
        <input
          class="hidden"
          id="ss-type--${_type}"
          type="radio"
          name="ss-type-radio"
          value="${_type}"
          ?checked=${checked}
          @change=${changer} />
        ${type}
      </label>
    </li>`;
};

export const renderEndMsg = (heading, msg, changer) => html`
  <header><h2>${heading}</h2></header>
  <main><p>${msg}</p></main>
  <footer>
    <button type="button" id="st-reset" value="1" @click=${changer}>
      Reset session
    </button>
  </footer>
`;
