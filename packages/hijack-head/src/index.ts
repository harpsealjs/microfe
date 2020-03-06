import { loadJsByEval, runJs } from './lib/assets';
import {
  HeadAPI,
  HeadCommonChain,
  HeadWindowChain,
  AppendMethod,
  Global,
  createMonad
} from './types';

export * from './types';

export class HeadImpl implements HeadAPI {
  rawAppendChild = HTMLHeadElement.prototype.appendChild;
  appendChild = HTMLHeadElement.prototype.appendChild;
  links: HTMLElement[] = [];
  styles: HTMLElement[] = [];
  scripts: HTMLElement[] = [];
  global: Global = null;
};

export const create: HeadCommonChain = (t?: HeadImpl) => createMonad(t ? t : new HeadImpl);

export const hijack: HeadCommonChain = (ins: HeadImpl) => {
  ins.appendChild = HTMLHeadElement.prototype.appendChild = (function appendChild<T extends HTMLElement>(this: any, child: T) {
    const tagName = child.tagName.toLowerCase();
    if (tagName === 'script') {
      const {src, text} = child as any;
      if (src) {
        loadJsByEval(src, ins.global);
      } else {
        runJs(text, ins.global, 'script');
      }
      return child as T;
    } else if (tagName === 'style') {
      ins.styles.push(child);
    } else if (tagName === 'link') {
      ins.links.push(child);
    }
    return ins.rawAppendChild.apply(this, [child]) as T;
  }) as AppendMethod;
  return createMonad(ins);
};

export const clear: HeadCommonChain = (ins: HeadImpl) => {
  ins.styles.forEach($asset => $asset.parentNode && $asset.parentNode.removeChild($asset));
  ins.links.forEach($asset => $asset.parentNode && $asset.parentNode.removeChild($asset));
  return createMonad(ins);
};

export const unhijack: HeadCommonChain = (ins: HeadImpl) => {
  return clear(ins).chain((ins: HeadImpl) => {
    ins.appendChild = HTMLHeadElement.prototype.appendChild = ins.rawAppendChild;
    return createMonad(ins);
  });
};

export const setGlobal: HeadWindowChain = (t: Window | null) => (ins: HeadImpl) => {
  ins.global = t;
  return createMonad(ins);
};