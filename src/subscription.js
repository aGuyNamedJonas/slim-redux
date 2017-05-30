
import { error, getType, isString } from './util';

export function subscription(subscription, changeCallback, store) {
  const error = msg => error('subscription()', msg);

  // Parameter validation (see tests)
  if(!isString(subscription))
    error(`"subscription" (first argument) needs to be a string, got ${getType(subscription)} instead: \n ${JSON.stringify(arguments, null, 2)}`);

  // Check store instance
  const srStore = window.store || store;

  if(!srStore)
    error(`No store instance provided in global and local scope! In case you set "disableGlobalStore" when creating slim-redux store, make sure to pass it in as the last argument!\n ${JSON.stringify(arguments, null, 2)}`);

  if(!srStore.slimReduxOptions)
    error(`Store instance provided is not a slim-redux store! \n ${JSON.stringify(arguments, null, 2)}`);
}
