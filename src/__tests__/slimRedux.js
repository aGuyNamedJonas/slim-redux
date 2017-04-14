import { createSlimReduxStore } from '../slimRedux';
import { applyMiddleware } from 'redux';

const initialState     = 0,
      incrementedState = 1,
      INCREMENT        = 'INCREMENT';

test('CreateSlimReduxStore() creates a redux store', () => {
  let store = createSlimReduxStore(0);

  // Check for the redux Store API
  expect(store).toHaveProperty('getState');
  expect(store).toHaveProperty('dispatch');
  expect(store).toHaveProperty('subscribe');
  expect(store).toHaveProperty('replaceReducer');
});

test('First argument of createSlimReduxStore() is initial state', () => {
  let store = createSlimReduxStore(initialState);
  let state = store.getState();
  expect(state).toEqual(initialState);
});

test('Second argument of createSlimReduxStore() is existing root reducer', () => {
  const existingRootReducer = (state = initialState, action) => {
    switch(action.type){
      case INCREMENT:
        return state + 1;
      default:
        return state;
    }
  }

  let store = createSlimReduxStore(null, existingRootReducer);
  store.dispatch({type: INCREMENT});

  // No other reducer was registered, so if the increment worked, the existingRootReducer worked
  let state = store.getState();
  expect(state).toEqual(incrementedState);
});

test('Third argument of createSlimReduxStore() is existing middleware', () => {
  let actionType = null;
  // Dummy middleware, intercepting the action type
  const existingMiddleware = store => next => action => {
    actionType = action.type;
    let result = next(action)
    return result
  }

  let store = createSlimReduxStore(initialState, null, applyMiddleware(existingMiddleware));
  store.dispatch({type: INCREMENT});

  expect(actionType).toEqual(INCREMENT);
});

test('Store.createChangeTrigger() returns a function', () => {
  let store = createSlimReduxStore(initialState);
  let increment = store.createChangeTrigger({
    actionType: INCREMENT,
    reducer: state => state + 1,
  })

  const isFunction = functionToCheck => {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  expect(isFunction(increment)).toEqual(true);
});

test('Change trigger functions work', () => {
  let store = createSlimReduxStore(initialState);
  let increment = store.createChangeTrigger({
    actionType: INCREMENT,
    reducer: state => state + 1,
  })

  increment();

  let state = store.getState();
  expect(state).toEqual(incrementedState);
});

test('Payload validation works', () => {
  let store = createSlimReduxStore(initialState);
  let increment = store.createChangeTrigger({
    actionType: INCREMENT,
    reducer: state => state + 1,
    payloadValidation: (payload, accept, reject) => {
      // We DON'T want any payload in this one :)
      if(payload)
        return reject();
      else
        return accept();
    }
  })

  // Check failed case first
  let failedValidation = increment({forbidden: 'payload'})
  let state = store.getState();

  // We expect that the returned validation results are "rejected"
  expect(failedValidation).toHaveProperty('type', 'reject')
  // And that's why we also expect that the state did not change
  expect(state).toEqual(initialState);


  // Check successful case next
  let successfulValidation = increment()
  state = store.getState();

  expect(successfulValidation).toHaveProperty('type', 'accept')
  // Now we expect the store change to have been made
  expect(state).toEqual(incrementedState);
});
