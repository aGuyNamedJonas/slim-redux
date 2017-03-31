var storeDispatch = null;
var reducers = {}

export function registerStoreDispatch(dispatch) {
  storeDispatch = dispatch;
}

export function dispatchStoreAction(action) {
  storeDispatch(action);
}

export function dispatchErrorAction(actionType, payload) {
  // storeDispatch({
  //   type: actionType,
  //   error: true,
  //   payload: payload,
  // })

  console.log(`***Error action triggered: \n ${JSON.stringify({
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

// Warning: This overwrites any existing change action handlers
export function registerReducer(actionType, reducer, inputValidation) {
  const newReducer = {
    reducer,
    inputValidation,
  }

  // Since functions can't be checked for equality, instead of calling connect() all the time, the returned function should be used instead
  reducers[actionType] = newReducer;
}
