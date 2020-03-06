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

interface TypedChainable2<T, K, S> {
  (t: T, k: K): Chainable<S>
};

interface MonadFactory<T> {
  (t: T): Monad<T>;
};

export interface ChildEventCallback {
  (child: ChildAppData): void;
}

export type Global = Window | null;

export interface FrameworkAPI {
  children: ChildAppData[];
  childNotFound: ChildAppData;
  childError: ChildAppData;
  currentChild: ChildAppData | null;
  global: Global;
  $root: HTMLElement | null;
  onChildEnter: ChildEventCallback;
  onChildLeave: ChildEventCallback;
};

export type FrameworkMonad = Monad<FrameworkAPI>;
export type FrameworkCommonChain = Chainable<FrameworkAPI>;
export type FrameworkChildChain = TypedChainable<ChildAppData, FrameworkAPI>;
export type FrameworkElementChain = TypedChainable<HTMLElement, FrameworkAPI>;
export type FrameworkStringChain = TypedChainable<string, FrameworkAPI>;
export type FrameworkEventChain = TypedChainable2<string, FrameworkChangeFunction, FrameworkAPI>;
export type FrameworkChildEventChain = TypedChainable<ChildEventCallback, FrameworkAPI>;
export type FrameworkWindowChain = TypedChainable<Global, FrameworkAPI>;

export type FrameworkChangeFunction = (t: FrameworkMonad) => void;

export const createMonad: MonadFactory<FrameworkAPI> = (t: FrameworkAPI) => Identity(t) as Monad<FrameworkAPI>;

export interface EventListener {
  (...data: any): void
};

export interface ChildAppData {
  title?: string;
  base?: string;
  assets: string | string[];
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  path: string | string[];
};
