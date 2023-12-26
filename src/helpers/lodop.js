import { loadJs } from './utils';

const JS_NAME = 'CLodopfuncs.js',
  URL_HTTP1 = 'http://localhost:8000/'+JS_NAME,
  URL_HTTP2 = 'http://localhost:18000/'+JS_NAME;

export function runLodopScripts() {
  return Promise.race([
    loadJs(URL_HTTP1),
    loadJs(URL_HTTP2)
  ]).catch(() => {
    window.LODOP = null;
  });
}

