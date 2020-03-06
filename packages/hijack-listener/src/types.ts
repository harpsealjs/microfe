import { Identity } from 'ramda-fantasy';

interface Monad<T> {
  map<U>(f: (t: T) => U): Monad<U>;
  of<U>(t: U): Monad<U>;
  chain<U>(f: (t: T) => Monad<U>): Monad<U>;
  chain<U>(f: (t: T) => U): U;
};

interface Chainable<S> {
  (t?: S): Monad<S>
};

interface MonadFactory<T> {
  (t: T): Monad<T>;
};

export type Listener = typeof window.addEventListener | typeof window.removeEventListener;

export interface ListenerAPI {
  rawAddListener: Listener;
  rawRemoveListener: Listener;
  addListener: Listener;
  removeListener: Listener;
};

export type ListenerMonad = Monad<ListenerAPI>;
export type ListenerCommonChain = Chainable<ListenerAPI>;

export const createMonad: MonadFactory<ListenerAPI> = (t: ListenerAPI) => Identity(t) as ListenerMonad;