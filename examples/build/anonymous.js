'use strict';

var redux = require('redux');
var slimRedux = require('slim-redux');

/*
  Anonymous changes in action - notice how small the definition is!
  This is probably the most radical suggestion of slim-redux, and I have
  no idea how comfortable anyone would even be with using this.
*/

var store = redux.createStore(slimRedux.createSlimReduxReducer(0));
slimRedux.initSlimRedux(store);

store.subscribe(() =>
  console.log(store.getState())
);

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
