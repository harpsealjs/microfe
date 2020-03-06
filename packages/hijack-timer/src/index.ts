import {
  TimerAPI,
  TimerCommonChain,
  createMonad
} from './types';

export * from './types';

export class TimerImpl implements TimerAPI {
  rawSetTimeout = window.setTimeout;
  rawSetInterval = window.setInterval;
  setTimeout = window.setTimeout;
  setInterval = window.setInterval;
  timeoutIds = new Set();
  intervalIds = new Set();
};

export const create: TimerCommonChain = (t?: TimerImpl) => createMonad(t ? t : new TimerImpl);

export const hijack: TimerCommonChain = (ins: TimerImpl) => {
  ins.setTimeout = window.setTimeout = ((...args: any[]) => {
    const id = ins.rawSetTimeout.apply(null, args);
    ins.timeoutIds.add(id);
    return id;
  }) as typeof setTimeout;
  ins.setInterval = window.setInterval = ((...args: any[]) => {
    const id = ins.rawSetInterval.apply(null, args);
    ins.intervalIds.add(id);
    return id;
  }) as typeof setTimeout;
  return createMonad(ins);
};

export const clear: TimerCommonChain = (ins: TimerImpl) => {
  ins.timeoutIds.forEach((id: number) => {
    window.clearTimeout(id);
  });

  ins.timeoutIds.clear();

  ins.intervalIds.forEach((id: number) => {
    window.clearInterval(id);
  });

  ins.intervalIds.clear();

  return createMonad(ins);
};

export const unhijack: TimerCommonChain = (ins: TimerImpl) => {
  return clear(ins).chain((ins: TimerImpl) => {
    ins.setTimeout = window.setTimeout = ins.rawSetTimeout;
    ins.setInterval = window.setInterval = ins.rawSetInterval;
    return createMonad(ins);
  });
};