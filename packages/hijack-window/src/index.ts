import {
  WindowAPI,
  WindowCommonChain,
  createMonad
} from './types';

export * from './types';

export class WindowImpl implements WindowAPI {
  rawWindow = window as Window;
  window = window as Window;
  changed = new Map();
};

export const create: WindowCommonChain = (t?: WindowImpl) => createMonad(t ? t : new WindowImpl);

export const get: ((t: WindowImpl) => Window) = t => t.window;

export const hijack: WindowCommonChain = (ins: WindowImpl) => {
  const fake = {} as Window;
  ins.window = new Proxy(fake, {
    set(obj: Window, key: PropertyKey, value: any): boolean {
      if (!ins.changed.has(key)) {
        ins.changed.set(key, ins.rawWindow[key]);
      }
      (ins.rawWindow as any)[key] = value;
      return true;
    },
    get(obj: Window, key: PropertyKey) {
      const value = (ins.rawWindow as any)[key];
      if (typeof value === 'function') {
        return value.bind(ins.rawWindow);
      }
      return value;
    },
    has(obj: Window, key: PropertyKey) {
      return ins.rawWindow.hasOwnProperty(key);
    }
  });
  return createMonad(ins);
};

export const clear: WindowCommonChain = (ins: WindowImpl) => {
  ins.changed.forEach((value, key) => {
    if (value) {
      ins.rawWindow[key] = value;
    } else {
      delete ins.rawWindow[key];
    }
  });
  ins.changed.clear();
  return createMonad(ins);
};

export const unhijack: WindowCommonChain = (ins: WindowImpl) => {
  return clear(ins).chain((ins: WindowImpl) => {
    ins.window = window;
    return createMonad(ins);
  });
};