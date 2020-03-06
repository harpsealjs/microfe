import * as _ from 'ramda';
import { loadAssets, clearAssets, tagAssets, untagAssets } from './lib/assets';
import { GLOBAL_PATH } from './lib/constant';
import matchPath from './lib/matchPath';
import { ChildEventCallback } from './types';
import {
  Global,
  ChildAppData,
  FrameworkAPI,
  FrameworkCommonChain,
  FrameworkChildChain,
  FrameworkChildEventChain,
  FrameworkElementChain,
  FrameworkStringChain,
  FrameworkWindowChain,
  createMonad
} from './types';

export * from './types';

export class FrameworkImpl implements FrameworkAPI {
  children = [];
  childNotFound: ChildAppData;
  childError: ChildAppData;
  currentChild: ChildAppData | null;
  global: Global = null;
  onChildEnter: (child: ChildAppData) => {};
  onChildLeave: (child: ChildAppData) => {};
  $root = document.body;
};

export const create: FrameworkCommonChain = (t?: FrameworkImpl) => createMonad(t ? t : new FrameworkImpl);

const loadChildAssets = (ins: FrameworkImpl): void => {
  if (ins.currentChild && ins.currentChild.assets) {
    const currentChild = ins.currentChild as ChildAppData;
    loadAssets(currentChild.assets, ins.global, () => {
      currentChild.title && (document.title = currentChild.title);
    }, () => {
      ins.onChildEnter && ins.onChildEnter(currentChild);
    }, () => {
      ins.childError && renderChild(ins.childError, ins);
    });
  }
};

const leaveCurrentChild = (ins: FrameworkImpl): void => {
  ins.onChildLeave && ins.onChildLeave(ins.currentChild as ChildAppData);
};

const renderChild = (child: ChildAppData, ins: FrameworkImpl): FrameworkImpl => {
  if (_.equals(ins.currentChild, child)) return ins;
  leaveCurrentChild(ins);
  clearAssets();
  ins.currentChild = child;
  loadChildAssets(ins);
  return ins;
};

const clearGlobalData = (): void => {
  delete window[GLOBAL_PATH];
};

export const register: FrameworkChildChain = (t: ChildAppData) => (ins: FrameworkImpl) => createMonad(_.evolve({ children: _.append(t) }, ins));
export const registerNotFound: FrameworkChildChain = (t: ChildAppData) => (ins: FrameworkImpl) => createMonad(_.assoc('childNotFound', t, ins));
export const registerError: FrameworkChildChain = (t: ChildAppData) => (ins: FrameworkImpl) => createMonad(_.assoc('childError', t, ins));
export const root: FrameworkElementChain = (t: HTMLElement) => (ins: FrameworkImpl) => {
  ins.$root = t;
  return createMonad(ins);
};

export const setGlobal: FrameworkWindowChain = (t: Window | null) => (ins: FrameworkImpl) => {
  ins.global = t;
  return createMonad(ins);
};

export const onChildEnter: FrameworkChildEventChain = (t: ChildEventCallback) => (ins: FrameworkImpl) => createMonad(_.assoc('onChildEnter', t, ins));
export const onChildLeave: FrameworkChildEventChain = (t: ChildEventCallback) => (ins: FrameworkImpl) => createMonad(_.assoc('onChildLeave', t, ins));

export const exit: FrameworkCommonChain = (ins: FrameworkImpl) => {
  ins.currentChild = null;
  leaveCurrentChild(ins);
  clearGlobalData();
  clearAssets();
  untagAssets();
  return createMonad(ins);
};

export const start: FrameworkCommonChain = (ins: FrameworkImpl) => {
  tagAssets();
  return createMonad(ins);;
};

export const redirect: FrameworkStringChain = (pathname: string) => (ins: FrameworkImpl) => {
  const child = _.find(i => matchPath(pathname, i), ins.children);
  renderChild(child, ins);
  return createMonad(ins);
};