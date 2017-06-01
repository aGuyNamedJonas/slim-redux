import { error, getType, isString, isFunction, isSet, isEmptyString, isSlimReduxStore, isSubscriptionStrValid } from './util';
import createNotifyingSelector from './notifyingSelector';

export function subscription(subscription, changeCallback, storeArg) {
  const error = msg => error('subscription()', msg);

  /*
    Parameter validation (see tests)
  */
  if(arguments.length > 3)
    error(`Only 3 arguments allowed, ${arguments.length} given: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check subscription
  if(!isString(subscription))
    error(`"subscription" (first argument) needs to be a string, got ${getType(subscription)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSet(subscription) || isEmptyString(subscription))
    error(`"subscription" (first argument) cannot be null, empty, or undefined: \n ${JSON.stringify(arguments, null, 2)}`);

  // Make sure the subscription string starts with "state"
  if(subscription.split('.')[0] !== 'state')
    error(`The "subscription" string does not start with "state". Remember: Subscription strings have to be of the form 'state.todos.filter': \n ${JSON.stringify(arguments, null, 2)}`);

  // Check changeCallback
  if(!isFunction(changeCallback))
    error(`"changeCallback" (second argument) needs to be a function, got ${getType(changeCallback)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSet(changeCallback))
    error(`"changeCallback" (second argument) cannot be null or undefined: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check (optional) store instance
  if(storeArg && !isSlimReduxStore(storeArg))
    error(`"storeArg" (third argument) is optional, but has to be a slim-redux store instance if provided: \n${JSON.stringify(arguments, null, 2)}`);

  const store = window.store || storeArg;

  if(!store)
    error(`No store instance provided in global and local scope! In case you set "disableGlobalStore" when creating slim-redux store, make sure to pass it in as the last argument!\n ${JSON.stringify(arguments, null, 2)}`);

  if(!isSlimReduxStore(store))
    error(`Store instance provided is not a slim-redux store! \n ${JSON.stringify(arguments, null, 2)}`);

  // check subscription string
  if(!isSubscriptionStrValid(subscription, store.getState()))
    error(`Cannot find subscription path '${subscription}'  in state: \n ${JSON.stringify(store.getState(), null, 2)}`);

  /*
    Implementation
  */

  // Step #1: Create a notifying selector out of a function we build using the subscription string
  const getStateFunctionString    = `state => ${subscription}`,   // Syntax for a function: state => subscription-string part of state
        getStateFunction          = eval(getStateFunctionString), // Turn the string from step one into an actual function
        checkSubscriptionSelector = createNotifyingSelector(      // Create subscrption selector using the function we just created
          getStateFunction,
          data => data,
        );

  // Initial firing - initially of course the state has changed!
  checkSubscriptionSelector(store.getState());

  // Step #2: Subscribe to state changes (native redux API function), but only trigger changeTrigger() when our subscription has changed
  store.subscribe(() => {
    const state             = store.getState(),
          subscriptionState = checkSubscriptionSelector(state);

    if(subscriptionState.hasChanged)
      changeCallback(subscriptionState.data, state);
  });

  // All done!
  return true;
}
