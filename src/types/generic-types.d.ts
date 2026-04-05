export type TNumberOptionData = {
  label: string,
  value: number
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
  hours: number,
  minutes: number,
  seconds: number,
  tenths ? : number,
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
  time: number,
  unit: string,
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

export interface IParsedIntervalData extends IStrKeyObjString {
  allEvery: string,
  denominator: string,
  hmsNum: string,
  hmsUnit: string,
  multiplier: string,
  numerator: string,
  relative: string,
}

export type TParsedIntervalDataObj = {
  groups: IParsedIntervalData,
};
