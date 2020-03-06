import {
  EventAPI,
  EventBindChain,
  EventEmitChain,
  createMonad,
  EventCommonChain,
  EventListener
} from './types';

export * from './types';

export class EventImpl implements EventAPI {
  actionMap = {};
};

export const create: EventCommonChain = (t?: EventImpl) => createMonad(t ? t : new EventImpl);

export const once: EventBindChain = (action: string, cb: EventListener) => (ins: EventImpl) => {
  const realCb = (...args) => {
    off(action, realCb)(ins);
    cb.apply(null, args);
  };
  return on(action, realCb)(ins);
};

export const on: EventBindChain = (action: string, cb: EventListener) => (ins: EventImpl) => {
  if (action && cb) {
    const queue = ins.actionMap[action] = ins.actionMap[action] || [];
    if (!~queue.indexOf(cb)) {
      ins.actionMap[action].push(cb);
    }
  }
  return createMonad(ins);
};

export const off: EventBindChain = (action: string, cb: EventListener) => (ins: EventImpl) => {
  if (action && cb) {
    const queue = ins.actionMap[action] = ins.actionMap[action] || [];
    const index = queue.indexOf(cb);
    if (~index) {
      queue.splice(index, 1);
      if (!queue.length) delete ins.actionMap[action];
    }
  }
  return createMonad(ins);
};

export const emit: EventEmitChain = (action: string, data?: any[]) => (ins: EventImpl) => {
  if (action) {
    const queue = ins.actionMap[action] = ins.actionMap[action] || [];
    queue.forEach(cb => {
      cb.apply(null, data);
    });
  }
  return createMonad(ins);
};