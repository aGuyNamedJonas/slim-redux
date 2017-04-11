'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var redux = require('redux');
var reduceReducers = _interopDefault(require('reduce-reducers'));

/*
  (INTERNAL) The slim redux reducer which automatically gets injected into the store instance
  in createSlimReduxStore().
*/
function slimReduxReducer(state, action){
  const actionType = action.type,
        payload    = action.payload,
        store      = this,
        reducer    = (store.slimRedux.changeTriggers[actionType] ? store.slimRedux.changeTriggers[actionType].reducer : null);

  if(reducer)
    return reducer(state, payload, action);
  else
    return state;
}

/*
  (INTERNAL) Performs the payload validation when a change trigger function is called
  for which a payload validation function was provided.
*/
function performPayloadValidation(actionType, actionPayload) {
  const accept    = function() { return {type: 'accept'} },
        reject    = function(msg = '') { return {type: 'reject', payload: msg} },
        store     = this,
        validator = store.slimRedux.changeTriggers[actionType].payloadValidation;

  // If payloadValidation() function was registered for this change trigger: Perform validation, otherwise just return 'accept'
  if(validator)
    return validator(actionPayload, accept, reject);
  else
    return {type: 'accept'}
}

/*
  Creates a change trigger for the given parameters object. This function is
  injected into the store instance through `createSlimReduxStore()`, so please use this
  by calling `store.createChangeTrigger()`.

  Returns a change trigger function which takes an object (= action payload) and will
  run the `payloadValidation` function (if provided) before dispatching and action to
  reducers (if validation passed) or an error action (if validation failed).

  The action trigger function when called will return an object specifying the validation results:
  `{type: 'accept'}` if validation has passed or no payload validation was provided,
  `{type: 'reject', payload: {...}}` if validation failed (payload is additional error information).

  **Parameters:**
  - *parameters.actionType*: The type of action this change trigger function will dispatch (e.g. 'ADD_TODO')
  - *parameters.reducer*: The reducer to process action of this action type (can also be from external redux code). Signature: (state, payload, [action]) --> new state
  - *parameters.payloadValidation (optional)*: A callback function with the signature ({payload}, accept, reject) --> return reject({error payload}) / return accept() (see examples!)

  **Returns:** A change trigger function with the signature ({actionPayload}) --> {type: 'accept'} / {type: 'reject', payload: {...}}

  **Example:**
  ```javascript
  import { createSlimReduxStore } from 'slim-redux';

  // Create a store with initial state
  var store = createSlimReduxStore(0);

  // Make sure we see any store changes in the console
  store.subscribe(() =>
    console.log(store.getState())
  )

  // create the change trigger for the action type 'INCREMENT'
  const increment = store.createChangeTrigger({
    actionType: 'INCREMENT',
    reducer: (state, payload, action) => {
      const value = payload.value || 1;
      return state + value;
    }
  });

  // Trigger a store-change - that is: Dispatch the action:
  // {type: 'INCREMENT', payload: {value: 10}}
  increment({value: 10});
  increment({value: 23});
  ```
*/
function createChangeTrigger(parameters) {
  const actionType        = parameters.actionType,
        reducer           = parameters.reducer,
        payloadValidation = parameters.payloadValidation || null,
        store             = this;

  // TODO: Insert parameters validation here! (to ensure correct usage of createChangeTrigger())
  store.slimRedux.changeTriggers[actionType] = {reducer, payloadValidation};

  // Return the change trigger function which is bound to the store instance as well
  return (actionPayload) => {
    const store      = this,
          validation = store.performPayloadValidation(actionType, actionPayload);

    if(validation.type === 'accept'){
      // If payload validation was successful, dispatch the action to the reducers
      store.dispatch({
        type: actionType,
        payload: actionPayload,
      });

      return validation;
    } else {
      // If payload validation was not successful: Trigger error action!
      store.dispatch({
        type: actionType,
        error: true,
        payload: validation.payload,
      });

      return validation;
    }
  }
}

/*
  Creates and returns a redux store which is a regular redux store with the slim-redux
  functionality (the `store.createChangeTrigger()` function + some internal stuff) injected.

  Since all the slim-redux functionality is directly injected into the store instance,
  slim-redux is suitable for server side rendering:
  http://redux.js.org/docs/recipes/ServerRendering.html

  **Parameters:**
  - *initialState*: The initial state of the redux store.
  - *existingRootReducer (optional)*: Root reducer of already existing redux setup
  - *enhancer (optional)*: Your regular middleware magic that you would normally pass to createStore() (in redux)

  **Returns:** A fresh store with some slim-redux functionality injected (mainly: `store.createChangeTrigger()`)

  **Example:**
  ```javascript
  import { createSlimReduxStore } from 'slim-redux';

  // Create a store with initial counter state = 0
  // This automatically injects the create slim-redux reducer and exposes store.createChangeTrigger()
  var store = createSlimReduxStore(0);

  // store is a regular redux store with slim-redux, you can subscribe to it like to a regular redux store:
  store.subscribe(() =>
    console.log(store.getState())
  )

  // With slim-redux initialized you can then go ahead and register change triggers...
  const increment = store.createChangeTrigger({ ... });

  // And use them to make state modifications
  increment({value: 10});
  ```
*/
function createSlimReduxStore(initialState, existingRootReducer, enhancer) {
  const defaultExistingReducer = state => state,
        rootReducer            = existingRootReducer || defaultExistingReducer;

  // var store = createStore(rootReducer, initialState, enhancer);
  var store = redux.createStore(rootReducer, initialState, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());  

  // Inject slimRedux related stuff into the store
  store.createChangeTrigger      = createChangeTrigger;
  store.performPayloadValidation = performPayloadValidation;
  store.slimReduxReducer         = slimReduxReducer;
  store.slimRedux                = {changeTriggers: {}};

  // Inject the slimReduxReducer into the store
  const enhancedRootReducer = reduceReducers(rootReducer, (state, action) => store.slimReduxReducer(state, action));
  store.replaceReducer(enhancedRootReducer);

  return store;
}

/*
  The most basic example of using slim-redux - using change() statements to register
  an action and its corresponding action in one call.
*/

// Create a store with initial state
var store = createSlimReduxStore(0);

// Make sure we see any store changes in the console
store.subscribe(() =>
  console.log(store.getState())
);

// Register a change with the actionType 'INCREMENT' and the appropriate reducer.
// This returns a change-trigger function (see below)
const increment = store.createChangeTrigger({
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
});

// Note that the hereby registered reducer would also process 'DECREMENT' actions
// from the rest of your redux code.
const decrement = store.createChangeTrigger({
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
