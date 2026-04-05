import { isNum } from './data.utils';

export const makeNullNum = (
  input : unknown,
  preceeding : string | null = null,
  max : number = 59,
) : string | null => {
  const t = typeof input;
  let output : number = 0;

  if (typeof input === 'string' && input.trim() !== '') {
    output = Number.parseInt(input, 10);
  }

  if (isNum(output)) {
    output = (!Number.isInteger(output))
      ? Math.round(output)
      : output;

    if (output < 1 && preceeding === null) {
      return null;
    }

    if (output > max) {
      return max.toString();
    }

    return (output < 10 && preceeding !== null)
      ? `0${output}`
      : output.toString();
  }

  return null;
};

export const getTimingMsg = (duration : number) : string => {
  const seconds = (duration / 1000);
  let thirdStr = 'minute';
  let sixthStr = '30 seconds';
  return 'Just a quick note about timing. '
      + 'If you make your pot in less than three minutes, you are '
      + 'probably missing things or not aiming for high enough '
      + 'quality. '
      + 'If you are not stopping when you run out of time, think '
      + 'about why. This is a three minute exercise. '
      + 'It\'s only an exercise. '
      + 'Stop at three minutes regardless of where you\'ve got to '
      + 'and think about which steps you can save a bit of time on, '
      + 'next time.'
      + 'For the purposes of this exercise:'
      + `The first ${thirdStr} of your time should be devoted to `
      + 'centering as perfectly as you can;'
      + `The next ${sixthStr} of your time should be for opening up.`
      + 'Most of the remaining time should be taken up by pulling '
      + 'up as high or as thin (or both) as you can.'
      + 'The final 10 to 15 seconds should be used for cleaning up '
      + 'the rim and the base and removing excess water. '
      + 'After the timer ends, cut your pot off the wheel and '
      + 'place it gently on your ware-board';
}

export const getSessionCompleteExtMsg = (type : 'bowls' | 'cylinders') : string => {
  const typeMsg = {
    cylinders: 'The base inside your pot should be flat; '
      + 'The walls should be straight and vertical; '
      + 'The base should be one and a half to two times the '
      + 'thickness of the walls; '
      + 'The walls should be the same thickness all the way up.',
    bowls: 'The steepest outside angle should be no less than 45 '
      + 'degrees; '
      + 'From about a third of the way up, the walls should be the '
      + 'same thickness; '
      + 'For this exercise, the curve of your bowl should not '
      + 'change direction.',
  };
  const pre = 'There are a few things you should look out for when '
      + 'critquing your';
  const post = 'There should be no water pooled in the bottom of your pot; '
      + 'The walls of your pot should be an even thickness; '
      + 'The walls of your pot should be an even thickness; '
      + 'The walls should be the same thickness on opposite sides.';

  return `${pre} ${type} ${post} ${typeMsg[type]}`;
}
