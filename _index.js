import { createStore } from 'redux';
import { createSlimReduxReducer } from './src/slimReduxReducer';
import { registerStoreDispatch } from './src/slimRedux';
import { change } from './src/change';

let store = createStore(createSlimReduxReducer(0));
registerStoreDispatch(store.dispatch);

store.subscribe(() =>
  console.log(store.getState())
)

const increment = change({
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  },
  registerOnly: true,
});

const decrement = change({
  actionType: 'DECREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  },
  registerOnly: true,
});

const anonymousIncrement = change({
  reducer: (state, payload) => {
    const value = payload.value || 1;
    return state - value;
  },
  registerOnly: true
});

increment({value: 20});
increment({value: 10});

decrement({value: 50});
decrement({value: 100});

anonymousIncrement({value: 100});
