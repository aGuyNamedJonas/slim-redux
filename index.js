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
  var actionType        = parameters.actionType || null,
      reducer           = parameters.reducer,
      payloadValidation = parameters.payloadValidation || null;

  if(actionType){
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
  } else {
    // Anonymous change (no ACTION_TYPE) - don't register, just dispatch the appropriate action!
    return (actionPayload) => {
      var validation = 'accept';

      if(payloadValidation)
        validation = performPayloadValidation(actionType, actionPayload, payloadValidation);

      if(validation === 'accept'){
        dispatchStoreAction({
          type: '__ANONYMOUS_CHANGE__',
          payload: {
            reducer: reducer,
            payload: actionPayload,
          }
        });
      }
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

  console.log(`Here's the children of the store: ${JSON.stringify(store, null, 2)}`);
}

function dispatchStoreAction(action) {
  storeDispatch(action);
}

function dispatchErrorAction(actionType, payload) {
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

function getReducer(actionType) {
  if(actionType in reducers)
    return reducers[actionType].reducer;
  else
    return null;
}

// Warning: This overwrites any existing change action handlers
function registerReducer(actionType, reducer, inputValidation) {
  const newReducer = {
    reducer,
    inputValidation,
  };

  // Since functions can't be checked for equality, instead of calling connect() all the time, the returned function should be used instead
  reducers[actionType] = newReducer;
}

function createSlimReduxReducer(initialState) {
  return function slimReduxReducer(state = initialState, action) {
    if(action.type === '__ANONYMOUS_CHANGE__'){
      // Action was created by slim-redux and is an "anonymous" change - a change to the store without a named action
      // Action contains everything that the reducer needs to make the changes to the store
      const payload = action.payload.payload,
            reducer = action.payload.reducer;

      return reducer(state, payload, '__ANONYMOUS_CHANGE__');
    } else {
      // Action was triggered by a named change or dispatched by regular redux code
      const reducer = getReducer(action.type);

      if(reducer){
        return reducer(state, action.payload, action);
      }else{
        return state;
      }
    }
  }
}

var store = redux.createStore(createSlimReduxReducer(0));
initSlimRedux(store);

store.subscribe(() =>
  console.log(store.getState())
);

const increment = store.change({
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
});

const decrement = store.change({
  actionType: 'DECREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  }
});

const anonymousIncrement = store.change({
  reducer: (state, payload) => {
    const value = payload.value || 1;
    return state - value;
  }
});

const incrementWithValidation = store.change({
  actionType: 'INCREMENT_WITH_VALIDATION',
  reducer: (state, payload) => {
    return state + payload.value;
  },
  payloadValidation: (payload, accept, reject) => {
    if(!payload || !payload.value)
      return reject({
        msg: 'No parameters given or no "value" attribute in parameters provided!',
        params: payload
      });
    else
      return accept();
  }
});

increment({value: 10});
increment({value: 10});

decrement({value: 10});
decrement({value: 20});

anonymousIncrement({value: 5});

incrementWithValidation({value: 5});
// Should now be 0
incrementWithValidation({});
