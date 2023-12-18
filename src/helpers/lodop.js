import { loadJs } from './utils';

const JS_NAME ='CLodopfuncs.js',
  URL_HTTP1 = 'http://localhost:8000/'+JS_NAME,              //http用8000/18000
  URL_HTTP2 = 'http://localhost:18000/'+JS_NAME,
  URL_HTTP3 = 'https://localhost.lodop.net:8443/'+JS_NAME;   //https用8000/8443

export function getLodop() {
  return Promise.race([
    loadJs(URL_HTTP1),
    loadJs(URL_HTTP2),
    loadJs(URL_HTTP3)
  ]);
}

