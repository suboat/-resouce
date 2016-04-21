let $utils = require('./$utils');

// let $http = require('./$http');

let $http = function () {

};

let $q = require('q');

// 是否带跨域请求头
let withCredentials = false;

// 全局的header
let headers = {
  Accept: 'application/json, text/plain, text/html, */*'
};

/**
 * 全局的拦截器
 * @param response
 * @returns {boolean | promise}
 */
let interceptor = (response)=> {
  if (!response) return $q.reject(response);
  if (response.data) {
    return $q.resolve(response);
  } else {
    return $q.resolve(response);
  }
};

/**
 * $resource请求
 */
class $resource {
  constructor(url, registerParams = {}, actions = {}, options = {}) {

    // default actions
    actions = $utils.extend(
      {
        'get': {method: 'GET'},
        'post': {method: 'POST'},
        'put': {method: 'PUT'},
        'delete': {method: 'DELETE'},
        'fetch': {method: 'GET'},
        'save': {method: 'POST'},
        'remove': {method: 'DELETE'},
        'update': {method: 'PUT'}
      }
      , actions);

    // default options
    options = $utils.extend({
      timeout: null,
      cache: false
    }, options);


    class http {
      constructor() {
        this.url = url;
        this.parmas = registerParams;
      };
    }

    $utils.forEach(actions, function (object, methodName) {

      // 设置header和拦截器和跨域请求
      object.headers = object.headers ? object.headers : headers;
      object.interceptor = object.interceptor ? object.interceptor : interceptor;
      object.withCredentials = object.withCredentials !== undefined ? object.withCredentials : withCredentials;

      // 函数调用时，真正传入的参数
      http.prototype[methodName] = function (params) {
        let _url = $resource.parseParams(url, params);
        return $http[object.method.toLowerCase()](_url, params, {
          headers: object.headers,
          withCredentials: object.withCredentials,
          interceptor: object.interceptor,
          timeout: options.timeout,
          cache: options.cache
        });
      };

    });

    return new http();

  };

  static set withCredentials(boolean) {
    withCredentials = !!boolean;
  }

  static set $http(func) {
    $http = func;
  }

  static get withCredentials() {
    return withCredentials;
  }

  // 获取header
  static get headers() {
    return headers;
  };

  // 设置header
  static set headers(json) {
    if (!$utils.isObject(json)) return false;
    return $utils.extend(headers, json);
  };

  // 获取拦截器
  static get interceptor() {
    return interceptor;
  };

  static set interceptor(func) {
    interceptor = func;
  };

  /**
   * 将url和参数解析，得到真正的url地址
   * @param url
   * @param params
   * @returns {*}
   */
  static parseParams(url, params) {
    if (!$utils.isObject(params)) return url;

    $utils.forEach(params, function (value, key) {
      url = url.replace(new RegExp(':' + key, 'g'), value);
    });

    return url;
  };

  /**
   * 注册api
   * @param id
   * @param url
   * @param params
   * @param actions
   * @param options
   * @returns {*}
   */
  static register(id = Math.random().toFixed(6), url, params, actions, options) {
    if ($resource.q[id]) {
      console.error(`API ${id} can't be register twice`);
    }
    $resource.q[id] = new $resource(url, params, actions, options);
    return $resource.q[id];
  };

}

$resource.q = {};

module.exports = $resource;