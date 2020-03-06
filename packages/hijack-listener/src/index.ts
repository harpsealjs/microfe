import {
  ListenerAPI,
  ListenerCommonChain,
  Listener,
  createMonad
} from './types';

export * from './types';

export class ListenerImpl implements ListenerAPI {
  rawAddListener = window.addEventListener;
  rawRemoveListener = window.removeEventListener;
  addListener = window.addEventListener;
  removeListener = window.removeEventListener;
  callbacks = {};
};

export const create: ListenerCommonChain = (t?: ListenerImpl) => createMonad(t ? t : new ListenerImpl);

export const hijack: ListenerCommonChain = (ins: ListenerImpl) => {
  ins.addListener = window.addEventListener = ((type: string, callback: Function, ...args) => {
    if (typeof type !== 'string' || typeof callback !== 'function') return;
    ins.callbacks[type] = ins.callbacks[type] || [];
    if (!ins.callbacks[type].find(o => o.callback === callback)) {
      ins.callbacks[type].push({ callback, args });
    }
    ins.rawAddListener.apply(window, [type, callback, ...args]);
  }) as Listener;
  ins.removeListener = window.removeEventListener = ((type: string, callback: Function, ...args) => {
    if (typeof type !== 'string' || typeof callback !== 'function') return;
    ins.callbacks[type] = ins.callbacks[type] || [];
    const idx = ins.callbacks[type].findIndex(o => o.callback === callback);
    if (idx !== -1) {
      ins.callbacks[type].splice(idx, 1);
    }
    ins.rawRemoveListener.apply(window, [type, callback, ...args]);
  }) as Listener;
  return createMonad(ins);
};

export const clear: ListenerCommonChain = (ins: ListenerImpl) => {
  Object.keys(ins.callbacks).forEach((type: string) => {
    (ins.callbacks[type] || []).forEach(({callback, args}) => {
      window.removeEventListener.apply(window, [type, callback, ...args]);
    });
  });
  return createMonad(ins);
};

export const unhijack: ListenerCommonChain = (ins: ListenerImpl) => {
  return clear(ins).chain((ins: ListenerImpl) => {
    ins.addListener = window.addEventListener = ins.rawAddListener;
    ins.removeListener = window.removeEventListener = ins.rawRemoveListener;
    return createMonad(ins);
  });
};