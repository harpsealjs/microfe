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

interface TypedChainable<T, S> {
  (t: T): Chainable<S>
};

interface MonadFactory<T> {
  (t: T): Monad<T>;
};

export type Global = Window | null;

export type AppendMethod = typeof HTMLHeadElement.prototype.appendChild;

export interface HeadAPI {
  rawAppendChild: AppendMethod;
  appendChild: AppendMethod;
  global: Global;
};

export type HeadMonad = Monad<HeadAPI>;
export type HeadCommonChain = Chainable<HeadAPI>;
export type HeadWindowChain = TypedChainable<Global, HeadAPI>;

export const createMonad: MonadFactory<HeadAPI> = (t: HeadAPI) => Identity(t) as HeadMonad;