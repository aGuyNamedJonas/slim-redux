/*
  The most basic example of using slim-redux - using change() statements to register
  an action and its corresponding action in one call.
*/

import { createSlimReduxStore } from './src/index';

// Create a store with initial state
var store = createSlimReduxStore(0);

// Make sure we see any store changes in the console
store.subscribe(() =>
  console.log(store.getState())
)

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
