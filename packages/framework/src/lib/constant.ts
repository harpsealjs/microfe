const randStr = (length: number, current: string = '') => length ? randStr(--length, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 60)) + current) : current;

// export const DYNAMIC_ID: string = randStr(10);
export const DYNAMIC_ID: string = 'framework';

export const ASSETS_PRELOAD_LABEL: string = 'preload';
export const ASSETS_CHILDAPP_LABEL: string = 'childapp';
export const ASSETS_TAG_NAME: string[] = ['style', 'link', 'script'];

export const REG_CSS: RegExp = /\.css$/;
export const REG_JS: RegExp = /\.js$/;

export const GLOBAL_PATH = '__MICRO_ROOT_DATA__';
