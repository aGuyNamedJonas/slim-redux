import { createSlimReduxStore } from '../createSlimReduxStore';
import { applyMiddleware } from 'redux';

const INITIAL_STATE     = 0,
      INCREMENTED_STATE = 1,
      INCREMENT         = 'INCREMENT';

var store = null;

describe('createSlimReduxStore() (default behavior)', () => {
  beforeEach(() => {
    store = createSlimReduxStore(INITIAL_STATE);
  });

  test('creates a redux store', () => {
    // Check for the redux Store API
    expect(store).toHaveProperty('getState');
    expect(store).toHaveProperty('dispatch');
    expect(store).toHaveProperty('subscribe');
    expect(store).toHaveProperty('replaceReducer');
  });

  test('accepts initial state as first argument', () => {
    let state = store.getState();
    expect(state).toEqual(INITIAL_STATE);
  });

  test('sets the window global variable which points to GLOBAL', () => {
    expect(global).toHaveProperty('window');
    expect(global).toEqual(global.window);
  });

  test('makes store available in the global scope under window.store', () => {
    expect(store).toEqual(window.store);
  });

  test('inserts registerChangeTrigger() (which is deprecated) into the created store instance', () => {
    expect(store).toHaveProperty('registerChangeTrigger');
  });

  test('store.registerChangeTrigger() (which is depracated) throws an error when called', () => {
    expect(() => {
      store.registerChangeTrigger();
    }).toThrow();
  })
});

describe('createSlimReduxStore() (error / special cases)', () => {
  test('throws an error when initialState is null or undefined', () => {
    expect(() => {
      let storeFails = createSlimReduxStore(null);
    }).toThrow();

    expect(() => {
      let storeFails = createSlimReduxStore(undefined);
    }).toThrow();
  });

  test('throws error when more than two arguments are provided', () => {
    expect(() => {
      let storeFails = createSlimReduxStore(INITIAL_STATE, {}, 'should not accept this third parameter');
    }).toThrow();
  });

  test('throws an error when the second argument is not an object and not undefined', () => {
    // Negative case: Array instead of object provided
    expect(() => {
      let storeFails = createSlimReduxStore(INITIAL_STATE, []); // Ha! Tricky test case, this will know when implementation used typeof
    }).toThrow();

    // Positive case: Parameter omitted (it's optional!)
    expect(() => {
      let storeWorks = createSlimReduxStore(INITIAL_STATE);
    }).not.toThrow();
  });

  test('value for rootReducer option in createSlimReduxStore() will be set as the redux rootReducer', () => {
    const existingRootReducer = (state = INITIAL_STATE, action) => {
      switch(action.type){
        case INCREMENT:
          return state + 1;
        default:
          return state;
      }
    }

    let store = createSlimReduxStore(INITIAL_STATE, {
      rootReducer: existingRootReducer,
    });

    store.dispatch({type: INCREMENT});

    // No other reducer was registered, so if the increment worked, the existingRootReducer worked
    let state = store.getState();
    expect(state).toEqual(INCREMENTED_STATE);
  });

  test('value for middleware option in createSlimReduxStore() will be used as middleware', () => {
    let actionType = null;
    // Dummy middleware, intercepting the action type
    const existingMiddleware = store => next => action => {
      actionType = action.type;
      let result = next(action)
      return result
    }

    let store = createSlimReduxStore(INITIAL_STATE, {
      middleware: applyMiddleware(existingMiddleware),
    });

    store.dispatch({type: INCREMENT});

    // Check whether our dummy middleware could successfully intercept the dispatched action
    expect(actionType).toEqual(INCREMENT);
  });
});

describe('createSlimReduxStore() (options object)', () => {
  test('throws an error when an unknown property is set', () => {
    expect(() => {
      let storeFails = createSlimReduxStore(INITIAL_STATE, {
        notExistingOption: 'Which should throw an error'
      });
    }).toThrow();
  });

  test('throws an error when "rootReducer" is not a function', () => {
    expect(() => {
      let storeFails = createSlimReduxStore(INITIAL_STATE, {
        rootReducer: 'This is clearly not a function :)'
      });
    }).toThrow();
  });

  test('throws an error when "middleware" is not a function', () => {
    expect(() => {
      let storeFails = createSlimReduxStore(INITIAL_STATE, {
        middleware: 'This is clearly not a function :)'
      });
    }).toThrow();
  });

  test('throws an error when "disableGlobalStore" is not a boolean value', () => {
    expect(() => {
      let storeFails = createSlimReduxStore(INITIAL_STATE, {
        disableGlobalStore: 'This is clearly not a boolean :)'
      });
    }).toThrow();
  });
});
