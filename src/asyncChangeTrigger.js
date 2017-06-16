import { error as _err, getType, isObject, isEmptyObject, isSet, isFunction, getFuncParamNames, isDuplicateFree, isSlimReduxStore } from './util';

export function asyncChangeTrigger(changeTriggers, triggerFunction) {
  const error = msg => _err('asyncChangeTrigger()', msg);

  /*
    Parameter validation (see tests)
  */
  if(arguments.length > 2)
    error(`Only 2 arguments allowed, ${arguments.length} given: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check changeTriggers
  if(!isObject(changeTriggers))
    error(`"changeTriggers" (first argument) needs to be an object, got ${getType(changeTriggers)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSet(changeTriggers) || isEmptyObject(changeTriggers))
    error(`"changeTriggers" (first argument) cannot be null, empty, or undefined: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check triggerFunction
  if(!isFunction(triggerFunction))
    error(`"triggerFunction" (second argument) needs to be a function, got ${getType(triggerFunction)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSet(triggerFunction))
    error(`"triggerFunction" (second argument) cannot be null or undefined: \n ${JSON.stringify(arguments, null, 2)}`);

  const argNames = getFuncParamNames(triggerFunction),
        ctNames  = Object.keys(changeTriggers);

  if(!isDuplicateFree(argNames, ctNames))
    error(`It looks like you included the names of one or more change triggers in the arguments of your "triggerFunction" (second argument). Change triggers can be called from inside the trigger function using this: this.changeTrigger(arguments) \n ${JSON.stringify(arguments, null, 2)}`);


  /*
    Implementation
  */
  const actError           = msg => _err(`Async change trigger function`, msg),
        actChangeTriggers  = changeTriggers,
        actTriggerFunction = triggerFunction;

  var storeParam = null;


  function asyncChangeTriggerFunction(...parameters){
      if(parameters.length > 0){
        const lastArg = parameters[parameters.length - 1];
        storeParam = (isObject(lastArg) && isSlimReduxStore(lastArg) ? lastArg : null);
      }

      // Get store either from the parameters, the global scope (if setup) or throw an error
      const store = storeParam || window.store;

      if(!isSet(store))
        actError(`Cannot find slim-redux store instance in arguments (last parameter) of async change trigger or in window.store (global scope, set by createSlimReduxStore()). If set the (disableGlobalStore: true) option in createSlimReduxStore(), make sure to pass in the desired slim-redux store instance as the last argument in every change trigger call`);

      // Call triggerFunction w/ store instance, change triggers and the params!
      actTriggerFunction.apply({ store, ...actChangeTriggers }, ...parameters);

      // TODO: Adapt tests to use this.changeTrigger! Also make sure this even works :) (quick'n'dirty example)
  }

  return asyncChangeTriggerFunction;
}
