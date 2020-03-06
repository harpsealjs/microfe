import { Global } from '../types';

export const loadJsByEval = (function () {
  const cache = {};
  return function loadJsByEval(url: string, global: Global) {
    let chain = cache[url] ? Promise.resolve(cache[url]) : fetch(url).then(res => res.text());
    return chain.then(text => {
      cache[url] = text;
      runJs(text, global, url);
    });
  };
})();

export const runJs = (function () {
  const rawEval = eval;
  return function runJs(text: string, global: Global, label: string) {
    (window as any).proxy = global || window;
    try {
      rawEval(`;(function(window){;\n${text}\n}).bind(window.proxy)(window.proxy);`);
    } catch (e) {
      console.error(`error occurs when eval ${label}`);
      throw e;
    }
  };
})();