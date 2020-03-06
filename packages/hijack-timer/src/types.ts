import { Identity } from 'ramda-fantasy';

interface Monad<T> {
  map<U>(f: (t: T) => U): Monad<U>;
  of<U>(t: U): Monad<U>;
  chain<U>(f: (t: T) => Monad<U>): Monad<U>;
};

interface Chainable<S> {
  (t?: S): Monad<S>
};

interface MonadFactory<T> {
  (t: T): Monad<T>;
};

interface TimerMethod {
  (...args: any[]): string | number;
};

export interface TimerAPI {
  rawSetTimeout: typeof setTimeout;
  rawSetInterval: TimerMethod;
  setTimeout: typeof setTimeout;
  setInterval: TimerMethod;
};

export type TimerMonad = Monad<TimerAPI>;
export type TimerCommonChain = Chainable<TimerAPI>;

export const createMonad: MonadFactory<TimerAPI> = (t: TimerAPI) => Identity(t) as TimerMonad;