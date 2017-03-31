/*
  Anonymous changes in action - notice how small the definition is!
  This is probably the most radical suggestion of slim-redux, and I have
  no idea how comfortable anyone would even be with using this.
*/

import { createStore } from 'redux';
import { createSlimReduxReducer, initSlimRedux } from 'slim-redux';

var store = createStore(createSlimReduxReducer(0));
initSlimRedux(store);

store.subscribe(() =>
  console.log(store.getState())
)

// To make the interface of change() as concise as possible, it's even possible
// to create "nameless" changes - anonymous changes
const anonymousIncrement = store.change({
  reducer: (state, payload) => {
    return state + payload.value;
  }
});

// will dispatch an action of the type '__ANONYMOUS-CHANGE__'
anonymousIncrement({value: 5});
anonymousIncrement({value: 10});
