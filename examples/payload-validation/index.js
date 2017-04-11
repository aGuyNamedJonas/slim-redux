import { createSlimReduxStore } from 'slim-redux';

// Create a store with the initial state of 0
var store = createSlimReduxStore(0);

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
    if(!payload || !payload.value){
      console.log('Payload validation FAILED (will return previous state)....')
      return reject({
        msg: 'No parameters given or no "value" attribute in parameters provided!',
        params: payload
      });
    }else{
      console.log('Payload validation PASSED....')
      return accept();
    }
  }
});

// Call the change triggers - notice how you pass in an object as the action payload
increment({value: 10});
increment({value: 23});

// SUCCEEDS
decrement({value: 31});
decrement({value: 11});

// FAILS --> Just returns the previous state
decrement({thisIsAnInvalid: 'payload'})
