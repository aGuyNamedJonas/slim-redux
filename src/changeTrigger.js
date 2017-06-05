import { error as _err, getType, isString, isFunction, isObject, isSet, getFuncParamNames } from './util';

export function changeTrigger(actionType, reducer){
  const error = msg => _err('createSlimReduxStore()', msg);

  /*
    Check input parameters, make it incredibly tight against faulty use
  */
  if(arguments.length > 2)
    error(`Only two arguments allowed, got ${arguments.length}: \n ${JSON.stringify(arguments, null, 2)}`);

    if(actionType === undefined || actionType === null || actionType.replace(/\s/g, '') === '')
      error(`"actionType" (first argument) cannot be empty, null, undefined or only contain whitespace: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isString(actionType))
    error(`"actionType" (first argument) needs to be of type String, got ${getType(actionType)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(reducer === undefined || reducer === null)
    error(`"reducer" (second argument) cannot be undefined or null: \n ${JSON.stringify(arguments, null, 2)}`)

  if(!isFunction(reducer))
    error(`"reducer" (second argument) needs to be of type Function, got ${getType(actionType)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(getFuncParamNames(reducer).length === 0)
    error(`"reducer" (second argument) needs to be a function with at least one argument (state) \n ${JSON.stringify(arguments, null, 2)}`);


  /*
    Setup all the things the change trigger function needs inside a closure (ct = change trigger)
  */
  const ctActionType            = actionType,
        ctReducerFunc           = reducer,
        ctReducerArgumentsCount = ctReducerFunc.length,   // Rename this to payload arguments count?
        ctReducerArgumentsNames = getFuncParamNames(ctReducerFunc),
        ctError                 = msg => _err(`${ctActionType} change trigger function`, msg);
  var   ctRegistered            = false,
        storeParam              = null;

  function changeTriggerFunction(...parameters){
    /*
      Check parameters
    */

    // Check for the 'slimReduxOptions' key in the last argument to assess whether it's a slim-redux store
    const lastArg = parameters[parameters.length - 1];

    if(parameters.length > 0)
      storeParam = (isObject(lastArg) && 'slimReduxOptions' in lastArg ? lastArg : null);
    else
      storeParam = null;

    // Get store either from the parameters, the global scope (if setup) or throw an error
    const store = storeParam || window.store;

    if(!isSet(store))
      ctError(`Cannot find slim-redux store instance in arguments (last parameter) of change trigger or in window.store (global scope, set by createSlimReduxStore()). If set the (disableGlobalStore: true) option in createSlimReduxStore(), make sure to pass in the desired slim-redux store instance as the last argument in every change trigger call`);

    // If last argument is not a slim-redux store instance, max. amount of arguments can be one less than the reducer func. had
    if(storeParam === null && parameters.length > ctReducerArgumentsCount - 1)
      ctError(`Last argument doesn't seem to be slim-redux store instance, thus max. allowed arguments: ${ctReducerArgumentsCount - 1}, got ${parameters.length} instead: \n ${JSON.stringify(parameters, null, 2)}`);

    if(storeParam !== null && parameters.length > ctReducerArgumentsCount)
      ctError(`Last argument seems to be slim-redux store instance, thus max. allowed arguments: ${ctReducerArgumentsCount}, got ${parameters.length} instead: \n ${JSON.stringify(parameters, null, 2)}`);

    /*
      Register change trigger in slim-redux reducer, if not done yet
    */
    if(!ctRegistered){
      store.slimReduxChangeTriggers[ctActionType] = ctReducerFunc;
      ctRegistered = true;
    }

    /*
      Prepare action and then dispatch it
    */
    var payload = {};

    for(var i=0; i<ctReducerArgumentsCount - 1; i++)
      payload[ctReducerArgumentsNames[i]] = parameters[i];

    const action = { type: ctActionType, payload };

    store.dispatch(action);
    return action;
  }

  return changeTriggerFunction;
};
