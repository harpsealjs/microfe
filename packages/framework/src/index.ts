import { loadAssets, clearAssets, tagAssets, untagAssets } from './lib/assets';
import { GLOBAL_PATH } from './lib/constant';
import matchPath from './lib/matchPath';
import { ChildEventCallback } from './types';
import equal from 'deep-equal';
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
  children: ChildAppData[] = [];
  childNotFound: ChildAppData;
  childError: ChildAppData;
  currentChild: ChildAppData | null;
  global: Global = null;
  onChildEnter: ChildEventCallback = () => {};
  onChildLeave: ChildEventCallback = () => {};
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
  if (equal(ins.currentChild, child)) return ins;
  leaveCurrentChild(ins);
  clearAssets();
  ins.currentChild = child;
  loadChildAssets(ins);
  return ins;
};

const clearGlobalData = (): void => {
  delete window[GLOBAL_PATH];
};

export const register: FrameworkChildChain = (t: ChildAppData) => (ins: FrameworkImpl) => {
  ins.children.push(t);
  return createMonad(ins);
};
export const registerNotFound: FrameworkChildChain = (t: ChildAppData) => (ins: FrameworkImpl) => {
  ins.childNotFound = t;
  return createMonad(ins);
};
export const registerError: FrameworkChildChain = (t: ChildAppData) => (ins: FrameworkImpl) => {
  ins.childError = t;
  return createMonad(ins);
};
export const root: FrameworkElementChain = (t: HTMLElement) => (ins: FrameworkImpl) => {
  ins.$root = t;
  return createMonad(ins);
};

export const setGlobal: FrameworkWindowChain = (t: Window | null) => (ins: FrameworkImpl) => {
  ins.global = t;
  return createMonad(ins);
};

export const onChildEnter: FrameworkChildEventChain = (t: ChildEventCallback) => (ins: FrameworkImpl) => {
  ins.onChildEnter = t;
  return createMonad(ins);
};
export const onChildLeave: FrameworkChildEventChain = (t: ChildEventCallback) => (ins: FrameworkImpl) => {
  ins.onChildLeave = t;
  return createMonad(ins);
};

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
  const child = ins.children.find(i => matchPath(pathname, i));
  child && renderChild(child, ins);
  return createMonad(ins);
};