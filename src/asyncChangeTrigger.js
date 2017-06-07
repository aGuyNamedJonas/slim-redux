import { error as _err, getType, isArray, isSet, isFunction, getFuncParamNames, isSlimReduxStore } from './util';

export function asyncChangeTrigger(changeTriggers, triggerFunction) {
  const error = msg => _err('asyncChangeTrigger()', msg);

  /*
    Parameter validation (see tests)
  */
  if(arguments.length > 2)
    error(`Only 2 arguments allowed, ${arguments.length} given: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check changeTriggers
  if(!isArray(changeTriggers))
    error(`"changeTriggers" (first argument) needs to be an array, got ${getType(changeTriggers)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSet(changeTriggers))
    error(`"changeTriggers" (first argument) cannot be null, empty, or undefined: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check triggerFunction
  if(!isFunction(triggerFunction))
    error(`"triggerFunction" (second argument) needs to be a function, got ${getType(triggerFunction)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSet(triggerFunction))
    error(`"triggerFunction" (second argument) cannot be null or undefined: \n ${JSON.stringify(arguments, null, 2)}`);

  const argNames    = getFuncParamNames(triggerFunction),
        numberArgs  = argNames.length,
        numberCTs   = changeTriggers.length,
        hasStateArg = argNames[numberArgs - 1] === 'state';

  if(!hasStateArg && numberArgs > numberCTs)
    error(`"triggerFunction" (second argument) cannot have more arguments (=${numberArgs} given) than amount of change triggers (=${numberCTs} allowed), unless the last argument is "state" (does NOT seem to be the case): \n ${JSON.stringify(arguments, null, 2)}`);

  if(hasStateArg && numberArgs > numberCTs + 1)
    error(`"triggerFunction" (second argument) cannot have more arguments (=${numberArgs} given) than amount of change triggers (=${numberCTs} + allowed), unless the last argument is "state" (DOES seem to be the case here): \n ${JSON.stringify(arguments, null, 2)}`);

  if(numberArgs < numberCTs)
    error(`"triggerFunction" (second argument) needs to have at least as many arguments as amount of change triggers passed in (given: ${numberArgs}, expected: ${numberCTs}):  \n ${JSON.stringify(arguments, null, 2)}`);

  // Check (optional) store instance
  if(storeArg && !isSlimReduxStore(storeArg))
    error(`"storeArg" (third argument) is optional, but has to be a slim-redux store instance if provided: \n${JSON.stringify(arguments, null, 2)}`);

  const store = storeArg || window.store;

  if(!store)
    error(`No store instance provided in global and local scope! In case you set "disableGlobalStore" when creating slim-redux store, make sure to pass it in as the last argument!\n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSlimReduxStore(store))
    error(`Store instance provided is not a slim-redux store! \n ${JSON.stringify(arguments, null, 2)}`);

  /*
    Implementation
  */

  // Setup variables needed inside of our asyncChangeTrigger closure
  const actFunction           = triggerFunction,
        actChangeTriggerCount = numberCTs,
        actError              = msg => _err(`Async change trigger function`, msg);

  var   ctsRegistered         = false,
        storeParam            = null;


  function asyncChangeTriggerFunction(...parameters){
    // Check for the 'slimReduxOptions' key in the last argument to assess whether it's a slim-redux store
    const lastArg = parameters[parameters.length - 1];

    if(parameters.length > 0)
      storeParam = (isObject(lastArg) && isSlimReduxStore(lastArg) ? lastArg : null);
    else
      storeParam = null;

    // Get store either from the parameters, the global scope (if setup) or throw an error
    const store = storeParam || window.store;

    if(!isSet(store))
      actError(`Cannot find slim-redux store instance in arguments (last parameter) of async change trigger or in window.store (global scope, set by createSlimReduxStore()). If set the (disableGlobalStore: true) option in createSlimReduxStore(), make sure to pass in the desired slim-redux store instance as the last argument in every change trigger call`);

    // If last argument is not a slim-redux store instance, max. amount of arguments can be the amount of changeTriggers setup
    if(storeParam === null && parameters.length > actChangeTriggerCount)
      actError(`Last argument doesn't seem to be slim-redux store instance, thus max. allowed arguments: ${ctReducerArgumentsCount - 1}, got ${parameters.length} instead: \n ${JSON.stringify(parameters, null, 2)}`);

    if(storeParam !== null && parameters.length > ctReducerArgumentsCount)
      actError(`Last argument seems to be slim-redux store instance, thus max. allowed arguments: ${ctReducerArgumentsCount}, got ${parameters.length} instead: \n ${JSON.stringify(parameters, null, 2)}`);

    // if(parameters.length < ctReducerArgumentsCount)
    //   actError(``)


    //
    //
    //    THIS IS SO BADLY FUCKED UP! GET YOUR SHIT RIGHT, THEN REWRITE THE TEST FOR THIS!
    //
    //

  }

  // const storeInjectedCTs = changeTriggers.map(changeTrigger => {
  //   (...args) => changeTrigger.apply([...args, store.getState()]);
  // });

}
