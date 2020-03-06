import { ChildAppData } from '@harpsealjs/framework';
import { EventListener } from '@harpsealjs/event';
import { HashType } from '@harpsealjs/hijack-history';

export interface MicrofeAPI {
  on(action: string, callback: EventListener): this;
  off(action: string, callback: EventListener): this;
  pushState(url: string, state: any): this;
  replaceState(url: string, state: any): this;
  register(child: ChildAppData): this;
  root(dom: HTMLElement): this;
  start(): this;
  exit(): this;
  clear(): this;
};

export interface ChildContext {
  root: HTMLElement | null,
  base: string | null | undefined,
  hashType: HashType,
  onAppLeave(cb: EventListener): void
};

type Chainable = {chain: (...args: any[]) => Chainable};

export interface Plugin {
  create: () => Chainable,
  hijack?: () => Chainable,
  clear?: () => Chainable,
  unhijack?: () => Chainable,
  setGlobal?: (global: Window | null) => () => Chainable
};