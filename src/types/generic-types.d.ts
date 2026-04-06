export type TNumberOptionData = {
  label: string,
  value: number,
};
export type TStringOptionData = {
  label: string,
  value: string,
};

export type TDoingSayData = {
  message: string,
  offset: number,
  rate ? : number,
};

export interface IStrKeyObj {
  [index: string]: any,
}

export interface IStrKeyObjString extends IStrKeyObj {
  [index: string]: string,
}

export type TSuffixes = {
  first: string,
  half: string,
  last: string,
};

export interface ITimeObj extends IStrKeyObj {
  hours : number,
  minutes : number,
  seconds : number,
  tenths : number,
}

export type TWholePart = {
  whole: number,
  part: number,
};

export type TIntervalObj = {
  all: boolean
  denominator: number,
  every: boolean,
  isFraction: boolean,
  multiplier: number,
  raw: string,
  relative: string,
  suffix: string,
  time: number | null,
  unit: string | null,
};

export type TIntervalData = {
  [index: string]: TIntervalObj,
};

export type TIntervalDataObj = {
  intervals: TIntervalData,
  suffixes: any,
};

export type TIntervalMsgData = {
  msg: string,
  offset: number,
};

export type TIntervalMsgDataObj = {
  msgs: TIntervalMsgData[],
};

export type TIntervalMsgDataObjWithRate = TIntervalMsgDataObj & {
  rate: number,
};

export interface IParsedIntervalData extends IStrKeyObj {
  allEvery: string,
  denominator: number,
  hmsNum: number,
  hmsUnit: string,
  multiplier: number,
  numerator: number,
  relative: string,
  raw: string,
}

export type TParsedIntervalDataObj = {
  groups: IParsedIntervalData,
};

export type FEpre = (method: string, before: boolean | null | string) => string;

export type TTalkingTimerState = 'unset' | 'ready' | 'starting' | 'running' | 'paused' | 'ending' | 'ended';

export type TTTconfig = {
  duration: number,
  noEndChime: boolean,
  noSayEnd: boolean,
  noSayStart: boolean,
};
