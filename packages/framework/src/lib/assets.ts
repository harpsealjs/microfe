import { DYNAMIC_ID, ASSETS_TAG_NAME, REG_CSS, REG_JS, ASSETS_PRELOAD_LABEL, ASSETS_CHILDAPP_LABEL } from './constant';
const getAssetAttrName = (type): string => `${DYNAMIC_ID}-${type}`;
const $head = document.head || document.getElementsByTagName('head')[0];

const loadJsByScript = function loadJsByScript(url: string) {
  return new Promise((resolve, reject) => {
    const $script: HTMLScriptElement = document.createElement('script');
    $script.type = 'text/javascript';
    $script.setAttribute(getAssetAttrName('script'), ASSETS_CHILDAPP_LABEL);
    $script.src = url;
    $script.async = false;
    $script.onload = () => resolve(url);
    $script.onerror = error => reject({ url, error });
    $head.appendChild($script);
  });
}

const loadJsByEval = (function() {
  const cache = {};
  const rawEval = eval;
  return function loadJsByEval(url: string, global: Object) {
    let chain = cache[url] ? Promise.resolve(cache[url]) : fetch(url).then(res => res.text());
    return chain.then(text => {
      cache[url] = text;
      (window as any).proxy = global;
      try {
        rawEval(`;(function(window){;\n${text}\n}).bind(window.proxy)(window.proxy);`);
      } catch (e) {
        console.error(`error occurs when eval ${url}`);
        throw e;
      }
    });
  };
})();

export const loadJs = (url: string, global?: Object) => {
  if (!global) return loadJsByScript(url);
  return loadJsByEval(url, global);
};

export const loadCss = url => new Promise((resolve, reject) => {
  const $link: HTMLLinkElement = document.createElement('link');
  $link.type = 'text/css';
  $link.rel = 'stylesheet';
  $link.setAttribute(getAssetAttrName('link'), ASSETS_CHILDAPP_LABEL);
  $link.href = url;
  $link.onload = () => resolve(url);
  $link.onerror = error => reject({ url, error });
  $head.appendChild($link);
});

export const tagAssets = function(): void {
  ASSETS_TAG_NAME.forEach(type => {
    const assets = [...document.getElementsByTagName(type)];
    assets.forEach($asset => $asset.setAttribute(getAssetAttrName(type), ASSETS_PRELOAD_LABEL));
  });
};

export const untagAssets = function (): void {
  ASSETS_TAG_NAME.forEach(type => {
    const assets = [...document.getElementsByTagName(type)];
    assets.forEach($asset => $asset.removeAttribute(getAssetAttrName(type)));
  });
};


export const clearAssets = function(): void {
  ASSETS_TAG_NAME.forEach(type => {
    const assets = [...document.querySelectorAll(`${type}:not([${getAssetAttrName(type)}='${ASSETS_PRELOAD_LABEL}'])`)];
    assets.forEach($asset => $asset.parentNode && $asset.parentNode.removeChild($asset));
  });
};

export const loadAssets = function(assets: string | string[], global, onJs, onCss, onError): void {
  const cssList: string[] = [];
  const jsList: string[] = [];
  
  (typeof assets === 'string' ? [assets] : assets)
    .filter(v => !!v)
    .forEach(url => {
      if (REG_CSS.test(url)) cssList.push(url);
      else if (REG_JS.test(url)) jsList.push(url);
    });
  
  cssList.length && Promise.all(cssList.map(loadCss)).then(onCss).catch(onError);
  jsList.length && Promise.all(jsList.map(url => loadJs(url, global))).then(onJs).catch(onError);
}