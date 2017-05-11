export const error = (location, msg) => {
  throw new Error(`*** Error in ${location}: ${msg}`)
}

/*
  Functions to determine the type of something
  Pattern stolen from here: http://tobyho.com/2011/01/28/checking-types-in-javascript/
*/
export const getType = whatever => (whatever).constructor;
export const isObject = obj => (obj).constructor === Object;
export const isString = str => (str).constructor === String;
export const isFunction = func => typeof(func) == 'function'; // Taken from: https://jsperf.com/alternative-isfunction-implementations/4
export const isBoolean = binary => (binary).constructor === Boolean;

/*
  Function which returns an array with the arguments of a function
  Stolen from: http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
*/
const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,\)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,\)]*))/mg,
      ARGUMENT_NAMES = /([^\s,]+)/g;

export const getFuncParamNames = (func) => {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}
