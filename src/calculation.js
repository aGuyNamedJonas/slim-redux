import { error, getType, isObject, isString, isFunction, getFuncParamNames } from './util';

export function calculation(calcFunction, subscriptionMap, changeCallback, store){
  const error = msg => error('calculation()', msg);

  /*
    Check input parameters, make it incredibly tight against faulty use
  */

  if(arguments.length > 4)
    error(`Only four arguments allowed, got ${arguments.length}: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isFunction(calcFunction))
    error(`"calcFunction" (first argument) needs to be a function, got ${getType(actionType)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isObject(subscriptionMap))
    error(`"subscriptionMap" (second argument) needs to be of type Object, got \n ${getType(subscriptionMap)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(subscriptionMap === undefined || subscriptionMap === null || Object.keys(subscriptionMap).length === 0)
    error(`"subscriptionMap" (second argument) cannot be undefined, null, or an empty object: \n ${JSON.stringify(arguments, null, 2)}`);

  var subscription



  // if(actionType === undefined || actionType === null || actionType.replace(/\s/g, '') === '')
  //   error(`"actionType" (first argument) cannot be empty, null, undefined or only contain whitespace: \n ${JSON.stringify(arguments, null, 2)}`);
  //
  // if(!isString(actionType))
  //   error(`"actionType" (first argument) needs to be of type String, got ${getType(actionType)} instead: \n ${JSON.stringify(arguments, null, 2)}`);
  //
  // if(reducer === undefined || reducer === null)
  //   error(`"reducer" (second argument) cannot be undefined or null: \n ${JSON.stringify(arguments, null, 2)}`)
  //
  // if(!isFunction(reducer))
  //   error(`"reducer" (second argument) needs to be of type Function, got ${getType(actionType)} instead: \n ${JSON.stringify(arguments, null, 2)}`);
  //
  // if(getFuncParamNames(reducer).length === 0)
  //   error(`"reducer" (second argument) needs to be a function with at least one argument (state) \n ${JSON.stringify(arguments, null, 2)}`);
}
