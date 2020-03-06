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

export interface WindowAPI {
  rawWindow: Window;
  window: any;
};

export type WindowMonad = Monad<WindowAPI>;
export type WindowCommonChain = Chainable<WindowAPI>;

export const createMonad: MonadFactory<WindowAPI> = (t: WindowAPI) => Identity(t) as WindowMonad;