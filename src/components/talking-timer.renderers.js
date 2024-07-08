import { html } from 'lit';

export const getMainBtn = (state, clicker, noPause) => {
  let txt = '';
  // console.group('getMainBtn()');
  // console.log('state:', state);
  // console.log('clicker:', clicker);
  // console.groupEnd();

  switch (state) {
    case 'ready':
      txt = 'Start';
      break;

    case 'running':
      if (noPause === true) {
        return '';
      }
      txt = 'Pause';
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
        ${options.map((option) => html`<option value="${option.value}" ?selected=${(option.value === value)}>${option.label}${s}</option>`)}
      </select>
    </div>
  </li>
`;

export const iWillBe = (time, intermission, repititions, cylinders) => {
  const _type = (cylinders !== false)
    ? 'cylendars'
    : 'bowls';
  return html`
    <h2>I will be throwing ${repititions} ${time} ${_type} with maximum of ${intermission} break between each ${_type}</h2>
    <ul>
      <li>
    </ul>
  `
}
