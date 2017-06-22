import { error as _err, getType, isObject, isArray, isSet, isString, isSubscriptionStrValid, isFunction, isSlimReduxStore } from './util';
import { CANCEL_SUBSCRIPTION } from './constants';
import createNotifyingSelector from './notifyingSelector';

export function calculation(subscriptions, calcFunction, changeCallback, storeArg){
const error = msg => _err('calculation()', msg);

  /*
    Parameter validation (see tests)
  */

  if(arguments.length > 4)
    error(`Only four arguments allowed, got ${arguments.length}: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check subscriptions
  if(!isArray(subscriptions))
    error(`"subscriptions" (first argument) needs to be of type Array, got \n ${getType(subscriptions)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSet(subscriptions) || subscriptions.length === 0)
    error(`"subscriptions" (first argument) cannot be undefined, null, or empty: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check calcFunction
  if(!isFunction(calcFunction))
    error(`"calcFunction" (second argument) needs to be a function, got ${getType(actionType)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSet(calcFunction))
    error(`"calcFunction" (second argument) cannot be undefined or null: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check changeCallback
  if(!isSet(changeCallback))
    error(`"changeCallback" (third argument) cannot be undefined or null:  \n ${JSON.stringify(arguments, null, 2)}`);

  // Check (optional) store instance
  if(storeArg && !isSlimReduxStore(storeArg))
    error(`"storeArg" (third argument) is optional, but has to be a slim-redux store instance if provided: \n${JSON.stringify(arguments, null, 2)}`);

  const store = storeArg || window.store;

  if(!isSet(store))
    error(`No store instance provided in global and local scope! In case you set "disableGlobalStore" when creating slim-redux store, make sure to pass it in as the last argument!\n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSlimReduxStore(store))
    error(`Store instance provided is not a slim-redux store! \n ${JSON.stringify(arguments, null, 2)}`);

  // check subscription strings
  subscriptions.map((subscription, i) => {
    if(!isString(subscription))
      error(`subscriptions need to be of value string, got ${getType(subscription)} for subscriptions[${i}] instead: \n ${JSON.stringify(arguments, null, 2)}`);

    if(!isSubscriptionStrValid(subscription, store.getState()))
      error(`Cannot find subscription path '${subscription}'  in state (subscriptions[${i}]). Remember: Subscription strings have to be of the form: "state.todos.filter". \n ${JSON.stringify(store.getState(), null, 2)}`);
  });


  /*
    Implementation
  */
  // Same approach as with subscriptions:
  // #1: Turn subscriptions into functions
  const subFunctions = subscriptions.map(subscription => {
    // Straight up copied from the implementation of subscription()...
    const getStateFunctionString    = `state => ${subscription}`,   // Syntax for a function: state => subscription-string part of state
          getStateFunction          = eval(getStateFunctionString); // Turn the string from step one into an actual function

    return getStateFunction;
  })

  // #2: Create notifying selector (using the subscription functions + calcFunction)
  const checkCalculationSelector = createNotifyingSelector(
    ...subFunctions,
    calcFunction,
  );

  // Initial firing - initially of course the state has changed!
  checkCalculationSelector(store.getState());

  // #3: Subscribe calculation using store.subscribe() and only call changeCallback if it actually changed
  const unsubscribe = store.subscribe(() => {
    const subscriptionState = checkCalculationSelector(store.getState());

    if(subscriptionState.hasChanged)
      changeCallback(subscriptionState.data, store.getState());
  });

  // #4: Create the function which will be returned
  const getCalculationOrUnsubscribe = (instruction) => {
    if(instruction === CANCEL_SUBSCRIPTION)
      unsubscribe();
    else
      return checkCalculationSelector(store.getState()).data;    // Returns the calculation value
  }

  // All done!
  return getCalculationOrUnsubscribe;
}
