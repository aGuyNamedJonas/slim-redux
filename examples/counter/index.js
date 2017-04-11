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
  }
});

// Call the change triggers - notice how you pass in an object as the action payload
increment({value: 10});
increment({value: 23});

decrement({value: 31});
decrement({value: 11});
