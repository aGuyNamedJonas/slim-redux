import { immutable } from 'immutable';

var storeDispatch = null;
var changeHandlers = {}

export function registerStoreDispatch(dispatch) {
  storeDispatch = dispatch;
}

export function dispatchStoreAction(action) {
  storeDispatch(action);
}

export function getChangeHandlerModifier(actionType) {
  if(actionType in changeHandlers)
    return changeHandlers[actionType].modifier;
  else
    return null;
}

// Warning: This overwrites any existing change action handlers
export function registerChangeHandler(actionType, params, modifier, inputValidation) {
  const newChangeHandler = {
    params,
    modifier,
    inputValidation,
  }

  // Since functions can't be checked for equality, instead of calling connect() all the time, the returned function should be used instead
  changeHandlers[actionType] = newChangeHandler;
}
