import Url from 'url-parse';
import {
  HistoryListener,
  HistoryAPI,
  HistoryCommonChain,
  HistoryListenerChain,
  HistoryHashChain,
  HistoryUrlChain,
  HashType,
  createMonad
} from './types';

const HASH_PREFIX = {
  slash: '#/',
  noslash: '#',
  hashbang: '#!/'
};

const getPathname = (url: string | null | undefined, hashType: HashType) => {
  const {pathname, hash} = new Url(url);
  if (hashType) {
    const prefix = HASH_PREFIX[hashType];
    if (hash.startsWith(prefix)) {
      return `/${hash.replace(prefix, '')}`;
    } else {
      return '/';
    }
  }
  return pathname;
};

const setPathname = (pathname: string = '/', hashType: HashType) => {
  const parsed = new Url(window.location.href);
  if (hashType) {
    const prefix = HASH_PREFIX[hashType];
    parsed.set('hash', `${prefix}${pathname.slice(1)}`);
  } else {
    parsed.set('pathname', pathname);
  }
  return parsed.toString();
};

export * from './types';

export class HistoryImpl implements HistoryAPI {
  rawPushState = window.history.pushState;
  rawReplaceState = window.history.replaceState;
  popState = (e: any) => { };
  pushState = window.history.pushState;
  replaceState = window.history.replaceState;
  hashType = false as HashType;
};

export const create: HistoryCommonChain = (t?: HistoryImpl) => createMonad(t ? t : new HistoryImpl);

export const setPush: HistoryListenerChain = (callback: HistoryListener) => (ins: HistoryImpl) => {
  ins.pushState = (state, title, url, ...rest) => {
    ins.rawPushState.apply(window.history, [state, title, url, ...rest]);
    const pathname = getPathname(url, ins.hashType);
    callback(pathname, state);
  };
  return createMonad(ins);
};

export const setReplace: HistoryListenerChain = (callback: HistoryListener) => (ins: HistoryImpl) => {
  ins.replaceState = (state, title, url, ...rest) => {
    ins.rawReplaceState.apply(window.history, [state, title, url, ...rest]);
    const pathname = getPathname(url, ins.hashType);
    callback(pathname, state);
  };
  return createMonad(ins);
};

export const setPop: HistoryListenerChain = (callback: HistoryListener) => (ins: HistoryImpl) => {
  ins.popState = (e: any) => {
    const pathname = getPathname(window.location.href, ins.hashType);
    callback(pathname, e.state)
  };
  return createMonad(ins);
};

export const setHashType: HistoryHashChain = (hashType: HashType) => (ins: HistoryImpl) => {
  ins.hashType = hashType;
  return createMonad(ins);
};

export const hijack: HistoryCommonChain = (ins: HistoryImpl) => {
  window.history.pushState = ins.pushState;
  window.history.replaceState = ins.replaceState;
  window.addEventListener('popstate', ins.popState, false);
  return createMonad(ins);
};

export const unhijack: HistoryCommonChain = (ins: HistoryImpl) => {
  window.history.pushState = ins.rawPushState;
  window.history.replaceState = ins.rawReplaceState;
  window.removeEventListener('popstate', ins.popState, false);
  return createMonad(ins);
};

export const pushState: HistoryUrlChain = (pathname: string) => (ins: HistoryImpl) => {
  ins.pushState({}, '', setPathname(pathname, ins.hashType));
  return createMonad(ins);
};

export const replaceState: HistoryUrlChain = (pathname: string) => (ins: HistoryImpl) => {
  ins.replaceState({}, '', setPathname(pathname, ins.hashType));
  return createMonad(ins);
};
