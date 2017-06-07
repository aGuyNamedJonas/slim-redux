import { applyMiddleware } from 'redux';
import { changeTrigger, createSlimReduxStore } from '../'; // Make sure to test what the NPM module will export
import { getType, isFunction } from '../util';

const INITIAL_STATE     = 0,
      INCREMENTED_STATE = 1,
      INCREMENT         = 'INCREMENT';

describe('changeTrigger() (default behavior)', () => {
  test('returns a function', () => {
    const ctFuncSuccess = changeTrigger(INCREMENT, state => state + 1);
    expect(isFunction(ctFuncSuccess)).toBe(true);
  });

  test('first argument is action type', () => {
    let actionType = null;
    let actionObject = null;

    // Dummy middleware, intercepting the action type and the action itself
    const interceptionMiddleware = store => next => action => {
      actionType = action.type;
      actionObject = action;
      let result = next(action)
      return result
    }

    let store = createSlimReduxStore(INITIAL_STATE, {
      middleware: applyMiddleware(interceptionMiddleware),
    });

    // Create the change trigger
    const increment = changeTrigger(INCREMENT, state => state + 1);
    increment();

    // Make sure that what was our first argument is the type of the dispatched action
    expect(actionType).toEqual(INCREMENT);
  });

  test('second argument is reducer function', () => {
    const store = createSlimReduxStore(INITIAL_STATE);
    const increment = changeTrigger(INCREMENT, state => {
      console.log(`Calling increment CT reducer function`)
      return state + 1;
    });
    increment();

    // We'll know the second argument passed in is the reducer, if it worked to alter the state as expected
    expect(store.getState()).toEqual(INCREMENTED_STATE);
  });
});

describe('changeTrigger() (error / special cases)', () => {
  test('throws an exception when it receives more than two arguments', () => {
    expect(() => {
      const ctFuncFail = changeTrigger('ADD_TODO', state => state, 'This argument should not be here');
    }).toThrow();
  });

  test('throws an exception when actionType (first argument) is "" (whitespace trimmed), null, undefined, or not a string', () => {
    expect(() => {
      const ctFuncFail = changeTrigger('  ', state => state);
    }).toThrow();

    expect(() => {
      const ctFuncFail = changeTrigger(null, state => state);
    }).toThrow();

    expect(() => {
      const ctFuncFail = changeTrigger(undefined, state => state);
    }).toThrow();

    expect(() => {
      const NOT_A_STRING = 123;
      const ctFuncFail = changeTrigger(NOT_A_STRING, state => state);
    }).toThrow();
  });

  test('throws an exception when reducer (second argument) is undefined or null', () => {
    expect(() => {
      const ctFuncFail = changeTrigger('ADD_TODO', undefined);
    }).toThrow();

    expect(() => {
      const ctFuncFail = changeTrigger('ADD_TODO', null);
    }).toThrow();
  });

  test('throws an exception when the reducer (second argument) is not a function', () => {
    expect(() => {
      const ctFuncFail = changeTrigger('ADD_TODO', 'Clearly not a function');
    }).toThrow();
  });

  test('throws an exception when the reducer function has no arguments', () => {
    expect(() => {
      const ctFuncFail = changeTrigger('ADD_TODO', () => {});
    }).toThrow();
  });
});

describe('change trigger functions (default cases)', () => {
  test('dispatches action that has the setup action type and reducer func. arguments as payload', () => {
    let actionObject = null;

    // Dummy middleware, intercepting the action type and the action itself
    const interceptionMiddleware = store => next => action => {
      actionObject = action;
      let result = next(action)
      return result
    }

    let store = createSlimReduxStore(INITIAL_STATE, {
      middleware: applyMiddleware(interceptionMiddleware),
    });

    // Create the change trigger
    const increment = changeTrigger(INCREMENT, (a, b, c, state) => state);

    // And call it
    increment('aaa', 'bbb', 'ccc');

    // Make sure that what was our first argument is the type of the dispatched action
    expect(actionObject).toMatchObject({
      type: INCREMENT,
      payload: {
        a: 'aaa',
        b: 'bbb',
        c: 'ccc',
      }
    });
  });

  test('change trigger function receives global state instance as last argument (by default)', () => {
    let store = createSlimReduxStore(INITIAL_STATE);
    var receivedStateInstance = null;
    const increment = changeTrigger(INCREMENT, state => {
      receivedStateInstance = state;
      return state;
    });

    increment();
    expect(receivedStateInstance).toEqual(store.getState());
  });

  test('change trigger function will receive local state instance when store is provided as last argument (disableGlobalStore = false [default])', () => {
    const todoInitialState = { todos: [] };
    let globalStoreOn      = createSlimReduxStore(INITIAL_STATE);
    let secondStore        = createSlimReduxStore(INITIAL_STATE, { disableGlobalStore: true });

    const increment = changeTrigger(INCREMENT, state => state + 1);

    // increment() the second store
    increment(secondStore);

    // expect the globalStore to still be on the INITIAL_STATE
    expect(globalStoreOn.getState()).toEqual(INITIAL_STATE);
    expect(secondStore.getState()).toEqual(INCREMENTED_STATE);
  });

  test('change trigger function will return object with dispatched action and state', () => {
    const globalStoreOn = createSlimReduxStore(INITIAL_STATE),
          increment     = changeTrigger(INCREMENT, state => state + 1),
          returnValue   = increment();

    expect(returnValue).toEqual({
      action: {type: INCREMENT, payload: {}},
      state : globalStoreOn.getState(), 
    });
  });
});

describe('change trigger functions (special cases / error cases)', () => {
  test('throws exception when no global slim-redux store instance can be found and none is provided in the last argument', () => {
    expect(() => {
      let store = createSlimReduxStore(INITIAL_STATE, {
        disableGlobalStore: true
      });
      const increment = changeTrigger(INCREMENT, state => state + 1);

      // We're making sure there's no global instance of the slim-redux store available
      window.store = null;

      // This is expected to throw an exception since we turned off the global store instance and don't provide a local instance
      increment();
    }).toThrow();
  });

  test('throws exception when too many arguments are provided', () => {
    let store = createSlimReduxStore(INITIAL_STATE);
    const increment = changeTrigger(INCREMENT, state => state + 1);

    expect(() => {
      /*
        Here's the math on this: The reducer functions need at least one argument (state).
        So with the minimal dummy reducer we defined (doesn't change the state) two arguments
        are definitely too much.
      */
      increment('too many', 'arguments');
    }).toThrow();
  });

  test('throws exception when last argument is not a slim-redux store instance but should be (by the no. of args.)', () => {
    let store = createSlimReduxStore(INITIAL_STATE);
    const increment = changeTrigger(INCREMENT, state => state + 1);
    expect(() => {
      increment('definitely not an instance of a slim-redux store');
    }).toThrow();
  });

  test('change trigger function will receive local state instance when store is provided as last argument (disableGlobalStore = true)', () => {
    const todoInitialState = { todos: [] };
    let globalStoreOn      = createSlimReduxStore(INITIAL_STATE);
    let secondStore        = createSlimReduxStore(INITIAL_STATE, { disableGlobalStore: true });

    const increment = changeTrigger(INCREMENT, state => state + 1);

    // increment() the second store
    increment(secondStore);

    // expect the globalStore to still be on the INITIAL_STATE
    expect(globalStoreOn.getState()).toEqual(INITIAL_STATE);
    expect(secondStore.getState()).toEqual(INCREMENTED_STATE);
  });
});
