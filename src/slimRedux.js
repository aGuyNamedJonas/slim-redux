import { createStore } from 'redux';
import reduceReducers from 'reduce-reducers';

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
  injected into the store instance on createSlimReduxStore(), so please use this
  by calling store.createChangeTrigger().

  Returns a change trigger function which takes an object (=action payload) and will
  run the payloadValidation function (if provided) before dispatching and action to
  reducers (if validation passed) or an error action (if validation failed).

  The action trigger function when called will return an object specifying the validation results:
  {type: 'accept'} if validation has passed or no payload validation was provided,
  {type: 'reject', payload: {...}} if validation failed (payload is additional error information).

  Parameters:
  - parameters.actionType: The type of action this change trigger function will dispatch (e.g. 'ADD_TODO')
  - parameters.reducer: The reducer to process action of this action type (can also be from external redux code). Signature: (state, payload, [action]) --> new state
  - parameters.payloadValidation (optional): A callback function with the signature ({payload}, accept, reject) --> return reject({error payload}) / return accept() (see examples!)

  Returns: A change trigger function with the signature ({actionPayload}) --> {type: 'accept'} / {type: 'reject', payload: {...}}
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
  functionality (the store.createChangeTrigger() function + some internal stuff) injected.

  Since all the slim-redux functionality is directly injected into the store instance,
  slim-redux is suitable for server side rendering:
  http://redux.js.org/docs/recipes/ServerRendering.html

  Parameters:
  - initialState: The initial state of the redux store.
  - existingRootReducer (optional): Root reducer of already existing redux setup
  - enhancer (optional): Your regular middleware magic that you would normally pass to createStore() (in redux)

  Returns: A fresh store with some slim-redux functionality injected (mainly: store.createChangeTrigger())
*/
export function createSlimReduxStore(initialState, existingRootReducer, enhancer) {
  const defaultExistingReducer = state => state,
        rootReducer            = existingRootReducer || defaultExistingReducer;

  var store = createStore(rootReducer, initialState, enhancer);

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
