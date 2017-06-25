import { error as _err, getType, isObject, isEmptyObject, isSet, isFunction, isDuplicateFree, isSlimReduxStore } from './util';

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

  if(triggerFunction.length === 0)
    error(`"triggerFunction" (second argument) needs to have at least one argument. The last argument is used to pass in the change triggers and the state: \n ${JSON.stringify(arguments, null, 2)}`);

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

      if((storeParam && parameters.length - 1 > actTriggerFunction.length - 1) || ((!storeParam && parameters.length > actTriggerFunction.length - 1)))
        actError(`This async change trigger function only takes ${actTriggerFunction.length - 1} arguments (not taking the last argument into account which is used to pass in change triggers + state). Not taking the optional last store argument into account, you passed in ${(storeParam ? arguments.length - 1 : arguments.length)} parameters.`);

      // Wrap change triggers in a way that they use the store instance we just got hold of
      const localStoreChangeTriggers = {...actChangeTriggers};
      
      // Wrap all change triggers in functions which use the store instance
      Object.keys(actChangeTriggers).map(key => {
        localStoreChangeTriggers[key] = function(...params){
          // Creating a new closure to preserve the store instance
          const ct = actChangeTriggers[key];

          // We only pass down the parameters to the change trigger if the change trigger accepts any
          if(ct.length === 1)
            ct(store);
          else
            ct(...params, store);
        }
      });

      // Call triggerFunction w/ parameters and object with state and change triggers as last argument
      if((storeParam && parameters.length === 1) || (!storeParam && parameters.length === 0))         // in this case the async change trigger doesn't have any function arguments of its own
        actTriggerFunction({ state: store.getState(), ...localStoreChangeTriggers });
      else
        actTriggerFunction(...parameters, { state: store.getState(), ...localStoreChangeTriggers });
  }

  return asyncChangeTriggerFunction;
}
