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
  }
});

const decrement = change({
  actionType: 'DECREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  }
});

const anonymousIncrement = change({
  reducer: (state, payload) => {
    const value = payload.value || 1;
    return state - value;
  }
});

const incrementWithValidation = change({
  actionType: 'INCREMENT_WITH_VALIDATION',
  reducer: (state, payload) => {
    return state + payload.value;
  },
  payloadValidation: (payload, accept, reject) => {
    if(!payload || !payload.value)
      return reject({
        msg: 'No parameters given or no "value" attribute in parameters provided!',
        params: payload
      });
    else
      return accept();
  }
})

increment({value: 10});
increment({value: 10});

decrement({value: 10});
decrement({value: 20});

anonymousIncrement({value: 5});

incrementWithValidation({value: 5})
// Should now be 0
incrementWithValidation({})
