import {
  create as createFramework,
  onChildLeave,
  onChildEnter,
  register,
  start,
  exit,
  root,
  redirect,
  setGlobal,
  ChildAppData,
  FrameworkAPI,
} from '@harpsealjs/framework';
import {
  create as createHistory,
  setPush,
  setPop,
  setReplace,
  hijack as hijackHistory,
  unhijack as unhijackHistory,
  setHashType,
  HashType,
  HistoryAPI,
  pushState as historyPushState,
  replaceState as historyReplaceState
} from '@harpsealjs/hijack-history';
import {
  create as createWindow,
  hijack as hijackWindow,
  unhijack as unhijackWindow,
  clear as clearWindow,
  get as getWindow
} from '@harpsealjs/hijack-window';
import { create as createEvent, on, once, off, emit } from '@harpsealjs/event';

import * as TimerPlugin from '@harpsealjs/hijack-timer';
import * as HeadPlugin from '@harpsealjs/hijack-head'
import * as ListenerPlugin from '@harpsealjs/hijack-listener';

import { MicrofeAPI, ChildContext, Plugin } from './types';

const GLOBAL_PATH: string = '__MICRO_FRONT_END_INSTANCE__';

const PLUGINS: Plugin[] = [TimerPlugin, ListenerPlugin, HeadPlugin];

export * from './types';

export function getChildContext(globalSpace: string = GLOBAL_PATH) {
  if (!window[globalSpace]) return null;
  return window[globalSpace].getChildContext();
}

export function pushState(pathname: string, globalSpace: string = GLOBAL_PATH) {
  if (!window[globalSpace]) return null;
  return window[globalSpace].pushState(pathname);
}

export function replaceState(pathname: string, globalSpace: string = GLOBAL_PATH) {
  if (!window[globalSpace]) return null;
  return window[globalSpace].replaceState(pathname);
}

export class Microfe implements MicrofeAPI {
  private ins = createFramework();
  private window = createWindow();
  private history = createHistory();
  private event = createEvent();

  private plugins: Plugin[] = [...PLUGINS];
  private pluginIns: any[] = [];

  constructor(plugins = [], globalSpace = GLOBAL_PATH) {
    this.history = this.history
      .chain(setPush((url: string, state: any) => {
        this.ins = this.ins.chain(redirect(url));
        this.event = this.event.chain(emit('APP_ROUTER_CHANGE', [url, state, 'push']));
      }))
      .chain(setPop((url: string, state: any) => {
        this.ins = this.ins.chain(redirect(url));
        this.event = this.event.chain(emit('APP_ROUTER_CHANGE', [url, state, 'replace']));
      }))
      .chain(setReplace((url: string, state: any) => {
        this.ins = this.ins.chain(redirect(url));
        this.event = this.event.chain(emit('APP_ROUTER_CHANGE', [url, state, 'pop']));
      }));

    this.ins = this.ins
      .chain(onChildEnter(child => {
        this.event = this.event.chain(emit('APP_CHILD_ENTER', [child]));
      }))
      .chain(onChildLeave(child => {
        this.clear();
        this.event = this.event.chain(emit('APP_CHILD_LEAVE', [child]));
      }));
    (window as any)[globalSpace] = this;

    this.plugins = [...this.plugins, ...plugins];

    this._pluginChain('create');
  }

  _pluginChain(method: string, ...args: any[]) {
    this.plugins.forEach((plugin, idx) => {
      let fn = plugin[method];
      if (typeof fn !== 'function') return;
      if (this.pluginIns[idx]) {
        fn = args.length > 0 && typeof fn === 'function' ? fn(...args) : fn;
        typeof fn === 'function' && (this.pluginIns[idx] = this.pluginIns[idx].chain(fn));
        return;
      }
      this.pluginIns[idx] = fn(...args);
    });
  }

  setHashType(mode: HashType) {
    this.history = this.history.chain(setHashType(mode));
    return this;
  }

  on(action: string, callback: EventListener) {
    this.event = this.event.chain(on(action, callback));
    return this;
  }

  off(action: string, callback: EventListener) {
    this.event = this.event.chain(off(action, callback));
    return this;
  }

  register(childApp: ChildAppData) {
    this.ins = this.ins.chain(register(childApp));
    this.event = this.event.chain(emit('APP_REGISTER', [childApp]));
    return this;
  }

  root(dom: HTMLElement) {
    this.ins = this.ins.chain(root(dom));
    return this;
  }

  pushState(pathname: string) {
    this.history = this.history.chain(historyPushState(pathname));
    return this;
  }

  replaceState(pathname: string) {
    this.history = this.history.chain(historyReplaceState(pathname));
    return this;
  }

  clear() {
    this.window = this.window.chain(clearWindow);
    this._pluginChain('clear');
    return this;
  }

  start() {
    this.history = this.history.chain(hijackHistory);
    this.window = this.window.chain(hijackWindow);
    const proxyWindow = this.window.chain(getWindow);

    this._pluginChain('hijack');
    this._pluginChain('setGlobal', proxyWindow);
    
    this.ins = this.ins.chain(setGlobal(proxyWindow)).chain(start);
    window.history.pushState({}, '', window.location.href);
    this.event = this.event.chain(emit('APP_START', []));
    return this;
  }

  exit() {
    this.history = this.history.chain(unhijackHistory);
    this.window = this.window.chain(unhijackWindow);
    this._pluginChain('unhijack');

    this.ins = this.ins.chain(setGlobal(null)).chain(exit);
    this.event = this.event.chain(emit('APP_EXIT', []));
    return this;
  }

  getChildContext(): ChildContext {
    const ins = this.ins.get() as FrameworkAPI;
    const history = this.history.get() as HistoryAPI
    return {
      root: ins.$root,
      base: ins.currentChild && ins.currentChild.base,
      hashType: history.hashType,
      onAppLeave: (callback: EventListener) => {
        this.event = this.event.chain(once('APP_CHILD_LEAVE', callback));
      }
    };
  }
}
