export const error = (location, msg) => {
  throw new Error(`*** Error in ${location}: ${msg}`)
}

/*
  Functions to determine the type of something
  Pattern stolen from here: http://tobyho.com/2011/01/28/checking-types-in-javascript/
*/
export const getType = whatever => (whatever).constructor;
export const isObject = obj => (obj).constructor === Object;
export const isArray = arr => (arr).constructor === Array;
export const isString = str => (str).constructor === String;
export const isFunction = func => typeof(func) == 'function'; // Taken from: https://jsperf.com/alternative-isfunction-implementations/4
export const isBoolean = binary => (binary).constructor === Boolean;
export const isSet = smthg => (smthg !== undefined && smthg !== null);
export const isEmptyString = str => (str.replace(/^\s\s*/, '').replace(/\s\s*$/, '') === ''); // Taken from: https://stackoverflow.com/questions/3000649/trim-spaces-from-start-and-end-of-string
export const isSlimReduxStore = obj => (obj.slimReduxOptions);

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

/*
  Validates a subscription string
*/

export const isSubscriptionStrValid = (str, state) => {
  const subStringParts = str.split('.');
  var statePointer = state;

  // Check whether or not first part is "store"
  if(subStringParts[0] !== 'state')
    return false;

  for(var i=1; i < subStringParts.length; i++){
    const nextPart = subStringParts[i];

    if(!(statePointer.hasOwnProperty(nextPart)))
      return false;

    statePointer = statePointer[nextPart];
  }

  return true;
}
