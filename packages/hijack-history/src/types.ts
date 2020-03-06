import { Identity } from 'ramda-fantasy';

interface Monad<T> {
  get<U>(): U,
  map<U>(f: (t: T) => U): Monad<U>;
  of<U>(t: U): Monad<U>;
  chain<U>(f: (t: T) => Monad<U>): Monad<U>;
};

interface Chainable<S> {
  (t?: S): Monad<S>
};

interface TypedChainable<T, S> {
  (t: T): Chainable<S>
};

interface MonadFactory<T> {
  (t: T): Monad<T>;
};

type HistoryMethodName = 'push' | 'replace' | 'pop';
type HistoryUrl = string | null | undefined;

interface HistoryPushMethod {
  (data: any, title: string, url: string | null | undefined): void;
};

interface HistoryPopCallback {
  (e?: any): void;
};

export type HashType = false | 'slash' | 'noslash' | 'hashbang';

export interface HistoryAPI {
  rawPushState: HistoryPushMethod;
  rawReplaceState: HistoryPushMethod;
  popState: HistoryPopCallback;
  pushState: HistoryPushMethod;
  replaceState: HistoryPushMethod;
  hashType: HashType;
};

export interface HistoryListener {
  (url: HistoryUrl, state: any): void
};

export type HistoryMonad = Monad<HistoryAPI>;
export type HistoryCommonChain = Chainable<HistoryAPI>;
export type HistoryListenerChain = TypedChainable<HistoryListener, HistoryAPI>;
export type HistoryHashChain = TypedChainable<HashType, HistoryAPI>;
export type HistoryUrlChain = TypedChainable<string, HistoryAPI>;
export type HistoryNameChain = TypedChainable<HistoryMethodName, HistoryAPI>;

export const createMonad: MonadFactory<HistoryAPI> = (t: HistoryAPI) => Identity(t) as Monad<HistoryAPI>;