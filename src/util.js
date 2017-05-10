export const error = (location, msg) => {
  throw new Error(`*** Error in ${location}: ${message}`)
}

/*
  Pattern stolen from here: http://tobyho.com/2011/01/28/checking-types-in-javascript/
*/
export const getType = whatever => (whatever).constructor;
export const isObject = obj => (obj).constructor === Object;
export const isFunction = func => (func).constructor === Function;
export const isBoolean = binary => (binary).constructor === Boolean;
