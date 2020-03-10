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


/**
 * Get render context of child application
 *
 * @export
 * @param {string} globalSpace Global space of host application
 * @returns
 */
export function getChildContext(globalSpace: string = GLOBAL_PATH) {
  if (!window[globalSpace]) return null;
  return window[globalSpace].getChildContext();
}
/**
 * Redirect like history.pushState
 *
 * @export
 * @param {string} pathname Target path
 * @param {string} globalSpace Global space of host application
 * @returns
 */
export function pushState(pathname: string, globalSpace: string = GLOBAL_PATH) {
  if (!window[globalSpace]) return null;
  return window[globalSpace].pushState(pathname);
}
/**
 * Redirect like history.replaceState
 *
 * @export
 * @param {string} pathname Target path
 * @param {string} globalSpace Global space of host application
 * @returns
 */
export function replaceState(pathname: string, globalSpace: string = GLOBAL_PATH) {
  if (!window[globalSpace]) return null;
  return window[globalSpace].replaceState(pathname);
}
/**
 * Host application
 *
 * @export
 * @class Microfe
 * @implements {MicrofeAPI}
 */
export class Microfe implements MicrofeAPI {
  private ins = createFramework();
  private window = createWindow();
  private history = createHistory();
  private event = createEvent();

  private plugins: Plugin[] = [...PLUGINS];
  private pluginIns: any[] = [];


  /**
   * Create host application
   * @param {Plugin[]} [plugins=[]] Custom hijack plugins
   * @param {*} globalSpace Global space
   * @memberof Microfe
   */
  constructor(plugins: Plugin[] = [], globalSpace = GLOBAL_PATH) {
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

  /**
  * @hidden
  */
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
  
  /**
   * Hash mode type
   * - false：browser history mode
   * - 'slash'：`#/{path}`
   * - 'noslash'：`#{path}`
   * - 'hashbang'：`#!/{path}`
   * @param {HashType} mode Hash mode type
   * @returns
   * @memberof Microfe
   */
  setHashType(mode: HashType) {
    this.history = this.history.chain(setHashType(mode));
    return this;
  }
  /**
   * Add event listener
   *
   * @param {string} action Event name
   * @param {EventListener} callback Event callback
   * @returns
   * @memberof Microfe
   */
  on(action: string, callback: EventListener) {
    this.event = this.event.chain(on(action, callback));
    return this;
  }
  /**
   * Remove event listener
   *
   * @param {string} action Event name
   * @param {EventListener} callback Event callback
   * @returns
   * @memberof Microfe
   */
  off(action: string, callback: EventListener) {
    this.event = this.event.chain(off(action, callback));
    return this;
  }
  /**
   * Register child application
   *
   * @param {ChildAppData} childApp Child application data
   * @returns
   * @memberof Microfe
   */
  register(childApp: ChildAppData) {
    this.ins = this.ins.chain(register(childApp));
    this.event = this.event.chain(emit('APP_REGISTER', [childApp]));
    return this;
  }
  /**
   * Root element where child application mount
   *
   * @param {HTMLElement} dom Root element
   * @returns
   * @memberof Microfe
   */
  root(dom: HTMLElement) {
    this.ins = this.ins.chain(root(dom));
    return this;
  }
  /**
   * Redirect like history.pushState
   *
   * @param {string} pathname Target path
   * @returns
   * @memberof Microfe
   */
  pushState(pathname: string) {
    this.history = this.history.chain(historyPushState(pathname));
    return this;
  }
  /**
   * Redirect like history.replaceState
   *
   * @param {string} pathname Target path
   * @returns
   * @memberof Microfe
   */
  replaceState(pathname: string) {
    this.history = this.history.chain(historyReplaceState(pathname));
    return this;
  }
  /**
   * Clear child application assets manually
   *
   * @returns
   * @memberof Microfe
   */
  clear() {
    this.window = this.window.chain(clearWindow);
    this._pluginChain('clear');
    return this;
  }
  /**
   * Start host application and hijack the global runtime
   *
   * @returns
   * @memberof Microfe
   */
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
  /**
   * Exit host application and restore the global runtime
   *
   * @returns
   * @memberof Microfe
   */
  exit() {
    this.history = this.history.chain(unhijackHistory);
    this.window = this.window.chain(unhijackWindow);
    this._pluginChain('unhijack');

    this.ins = this.ins.chain(setGlobal(null)).chain(exit);
    this.event = this.event.chain(emit('APP_EXIT', []));
    return this;
  }

  /**
   * Get render context of child application
   *
   * @returns {ChildContext}
   * @memberof Microfe
   */
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
