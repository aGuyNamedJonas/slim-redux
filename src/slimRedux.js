import { change } from './change';

var storeDispatch = null;
var reducers = {}

export function registerStoreDispatch(dispatch) {
  storeDispatch = dispatch;
}

export function initSlimRedux(store) {
  store['change'] = change;
  registerStoreDispatch(store.dispatch);
}

export function dispatchStoreAction(action) {
  storeDispatch(action);
}

export function dispatchErrorAction(actionType, payload) {
  storeDispatch({
    type: actionType,
    error: true,
    payload: payload,
  })

  console.error(`***Error action triggered: \n ${JSON.stringify({
    type: actionType,
    error: true,
    payload: payload,
  }, null, 2)}`);
}

export function getReducer(actionType) {
  if(actionType in reducers)
    return reducers[actionType].reducer;
  else
    return null;
}

export function registerReducer(actionType, reducer, inputValidation) {
  const newReducer = {
    reducer,
    inputValidation,
  }

  reducers[actionType] = newReducer;
}
