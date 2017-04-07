'use strict';

var redux = require('redux');

const performPayloadValidation = (actionType, payload, payloadValidation) => {
  const accept = () => ({type: 'accept'});
  const reject = (msg = '') => ({type: 'reject', payload: msg});

  const validation = payloadValidation(payload, accept, reject);

  if(validation.type === 'reject')
    dispatchErrorAction(actionType, validation.payload);

  return validation.type;
};

function change(parameters){
  console.log('CHANGE FUNCTION CALLED!');

  var actionType        = parameters.actionType || null,
      reducer           = parameters.reducer,
      payloadValidation = parameters.payloadValidation || null;

  // This change has an ACTION_TYPE, which means we can register it in the reducer
  registerReducer(actionType, reducer, payloadValidation);

  // Create and return change trigger function (has payload as the only parameter, will trigger validation)
  return (actionPayload) => {
    var validation = 'accept';

    if(payloadValidation)
      validation = performPayloadValidation(actionType, actionPayload, payloadValidation);

    if(validation === 'accept'){
      dispatchStoreAction({
        type: actionType,
        payload: actionPayload,
      });
    }
  }
}

var storeDispatch = null;
var reducers = {};

function registerStoreDispatch(dispatch) {
  storeDispatch = dispatch;
}

function initSlimRedux(store) {
  store['change'] = change;
  registerStoreDispatch(store.dispatch);
}

function dispatchStoreAction(action) {
  storeDispatch(action);
}

function dispatchErrorAction(actionType, payload) {
  storeDispatch({
    type: actionType,
    error: true,
    payload: payload,
  });

  console.error(`***Error action triggered: \n ${JSON.stringify({
    type: actionType,
    error: true,
    payload: payload,
  }, null, 2)}`);
}

function getReducer(actionType) {
  if(actionType in reducers)
    return reducers[actionType].reducer;
  else
    return null;
}

function registerReducer(actionType, reducer, inputValidation) {
  const newReducer = {
    reducer,
    inputValidation,
  };

  reducers[actionType] = newReducer;
}

function createSlimReduxReducer(initialState) {
  return function slimReduxReducer(state = initialState, action) {
    // Action was triggered by a named change or dispatched by regular redux code
    const reducer = getReducer(action.type);

    if(reducer){
      return reducer(state, action.payload, action);
    }else{
      return state;
    }
  }
}

/*
  The most basic example of using slim-redux - using change() statements to register
  an action and its corresponding action in one call.
*/

// createSlimReduxReducer([initialState]) returns the slim-redux reducer.
// If you have a rootReducer, make sure to add the slim-redux reducer there!
var store = redux.createStore(createSlimReduxReducer(0));

// Add the change() function to the store
initSlimRedux(store);

// Make sure we see any store changes in the console
store.subscribe(() =>
  console.log(store.getState())
);

// Register a change with the actionType 'INCREMENT' and the appropriate reducer.
// This returns a change-trigger function (see below)
const increment = store.change({
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
});

// Note that the hereby registered reducer would also process 'DECREMENT' actions
// from the rest of your redux code.
const decrement = store.change({
  actionType: 'DECREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  }
});

// Trigger a store-change - that is: Dispatch the action:
// {type: 'INCREMENT', payload: {value: 10}}
increment({value: 10});
increment({value: 23});

decrement({value: 31});
decrement({value: 11});
