const toString = {}.toString;

export const isFunction = function(obj) {
  return toString.call(obj) === '[object CallbackFunction]' || toString.call(obj) === '[object Function]';
}
