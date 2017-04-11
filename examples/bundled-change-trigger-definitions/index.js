import { createSlimReduxStore } from 'slim-redux';
import { increment, decrement } from './counterChangeTriggers';

var store = createSlimReduxStore(0);

// Make sure we see any store changes in the console
store.subscribe(() =>
  console.log(store.getState())
)

var doIncrement = store.createChangeTrigger(increment);
var doDecrement = store.createChangeTrigger(decrement);

doIncrement({value: 10});
doIncrement({value: 23});

doDecrement({value: 31});
doDecrement({value: 11});
