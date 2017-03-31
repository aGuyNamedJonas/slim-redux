import { createStore } from 'redux';
import { createSlimReduxReducer } from './src/slimReduxReducer';
import { initSlimRedux } from './src/slimRedux';

var store = createStore(createSlimReduxReducer(0));
initSlimRedux(store);

store.subscribe(() =>
  console.log(store.getState())
)

const increment = store.change({
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
});

const decrement = store.change({
  actionType: 'DECREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  }
});

const anonymousIncrement = store.change({
  reducer: (state, payload) => {
    const value = payload.value || 1;
    return state - value;
  }
});

const incrementWithValidation = store.change({
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
