import { createSlimReduxStore } from 'slim-redux';
import { applyMiddleware } from 'redux';

// Middleware that catches payload validation errors
const payloadValidationErrorCatcher = store => next => action => {
  if(action.error)
    console.error(`*** Error while trying to dispatch ${action.type}:\n${JSON.stringify(action.payload, null, 2)}`)

  let result = next(action)
  return result
}

// Create a store with the initial state of 0, no existing root reducer, and our error catcher middleware
var store = createSlimReduxStore(0, null, applyMiddleware(payloadValidationErrorCatcher));

// Make sure we see any store changes in the console
store.subscribe(() =>
  console.log(store.getState())
)

// Register change triggers - a bundle that contains an action type and a
// reducer, optionally payload validation
var increment = store.createChangeTrigger({
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
});

var decrement = store.createChangeTrigger({
  actionType: 'DECREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  },
  // Register payload validation. This will get called when calling a change
  // trigger function and when validation fails, the action will not be sent
  // to reducers and an error action is emitted instead.
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

// Call the change triggers - notice how you pass in an object as the action payload
increment({value: 10});
increment({value: 23});

// SUCCEEDS
decrement({value: 31});
decrement({value: 11});

// FAILS --> Just returns the previous state (and calls our middleware)
decrement({thisIsAnInvalid: 'payload'})
