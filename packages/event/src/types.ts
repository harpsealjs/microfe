import { Identity } from 'ramda-fantasy';

interface Monad<T> {
  map<U>(f: (t: T) => U): Monad<U>;
  of<U>(t: U): Monad<U>;
  chain<U>(f: (t: T) => Monad<U>): Monad<U>;
};

interface Chainable<S> {
  (t?: S): Monad<S>
};

interface TypedChainable2<T, K, S> {
  (t: T, k: K): Chainable<S>
};

interface MonadFactory<T> {
  (t: T): Monad<T>;
};

export interface EventAPI {
  actionMap: Object
};

export type EventMonad = Monad<EventAPI>;
export type EventCommonChain = Chainable<EventAPI>;
export type EventBindChain = TypedChainable2<string, EventListener, EventAPI>;
export type EventEmitChain = TypedChainable2<string, any[], EventAPI>;

export const createMonad: MonadFactory<EventAPI> = (t: EventAPI) => Identity(t) as Monad<EventAPI>;

export interface EventListener {
  (...data: any): void
};
