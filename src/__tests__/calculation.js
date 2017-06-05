import { changeTrigger, calculation, createSlimReduxStore } from '../';
import sinon from 'sinon';

const store      = createSlimReduxStore({ one: 'one', two: 'two', three: { four: 'four' } }),
      resetStore = changeTrigger('RESET_STORE', state => ({ one: 'one', two: 'two', three: { four: 'four' } })),
      noopCbFunc = state => {};

beforeEach(() => resetStore());

describe('Calculation() (default behavior)', () => {
  test('changeCallback gets invoked whenever subscribed to state changes', () => {
    const store     = createSlimReduxStore({one: 'one', two: 'two'}),
          changeOne = changeTrigger('CHANGE_ONE', state => ({ ...state, one: 'ONE' })),
          calcFunc  = one => one,
          cbFunc    = sinon.spy(result => result),
          calc      = calculation(['state.one'], calcFunc, cbFunc);

    // Make a change to the subscribed to 'state.one' value
    changeOne();
    expect(store.getState().one).toEqual('ONE');

    expect(cbFunc.called).toBe(true);
  });

  test('changeCallback DOES NOT get invoked when not-subscribed to state changes', () => {
    const store     = createSlimReduxStore({one: 'one', two: 'two'}),
          changeTwo = changeTrigger('CHANGE_TWO', state => ({ ...state, two: 'TWO' })),
          calcFunc  = one => one,
          cbFunc    = sinon.spy(result => result),
          calc      = calculation(['state.one'], calcFunc, cbFunc);

    // Make a change to the NOT SUBSCRIBED TO 'state.two' value
    changeTwo();
    expect(store.getState().two).toEqual('TWO');

    expect(cbFunc.called).toBe(false);
  });

  test('changeCallback will receive latest version of subscribed to state when invoked', () => {
    const store     = createSlimReduxStore({one: 'one', two: 'two'}),
          changeOne = changeTrigger('CHANGE_ONE', state => ({ ...state, one: 'ONE' })),
          calcFunc  = sinon.spy(one => one),
          calc      = calculation(['state.one'], calcFunc, noopCbFunc);

    // Make a change to the subscribed to 'state.one' value
    changeOne();
    expect(store.getState().one).toEqual('ONE');

    expect(calcFunc.calledWith('ONE')).toBe(true);
  });

  test('changeCallback will be invoked after calcFunction has run', () => {
    const store     = createSlimReduxStore({one: 'one', two: 'two'}),
          changeOne = changeTrigger('CHANGE_ONE', state => ({ ...state, one: 'ONE' })),
          calcFunc  = sinon.spy(one => one),
          cbFunc    = sinon.spy(result => result),
          calc      = calculation(['state.one'], calcFunc, cbFunc);

    // Make a change to the subscribed to 'state.one' value
    changeOne();
    expect(store.getState().one).toEqual('ONE');

    expect(calcFunc.calledBefore(cbFunc)).toBe(true);
  });

  test('changeCallback will receive result of calcFunction when invoked', () => {
      const MODIFIED_VALUE = 'MODIFIED_VALUE',
            store          = createSlimReduxStore({one: 'one', two: 'two'}),
            changeOne      = changeTrigger('CHANGE_ONE', state => ({ ...state, one: 'ONE' })),
            calcFunc       = sinon.spy(one => MODIFIED_VALUE),
            cbFunc         = sinon.spy(result => result),
            calc           = calculation(['state.one'], calcFunc, cbFunc);

      // Make a change to the subscribed to 'state.one' value
      changeOne();
      expect(store.getState().one).toEqual('ONE');

      expect(cbFunc.calledWith(MODIFIED_VALUE)).toBe(true);
  });

  // Inspired by observables <3
  test('calculation() when successful returns a function which can be used to cancel the calculation', () => {
    const store             = createSlimReduxStore({one: 'one', two: 'two'}),
          changeOne         = changeTrigger('CHANGE_ONE', state => ({ ...state, one: 'ONE' })),
          calcFunc          = one => one,
          cbFunc            = sinon.spy(result => result),
          cancelCalculation = calculation(['state.one'], calcFunc, cbFunc);

    // First cancel the calculation and then change that very state to make sure it indeed was cancelled
    cancelCalculation();
    changeOne();

    expect(cbFunc.called).toBe(false);
  });
});

describe('Calculation() (error / special cases)', () => {
  test('will throw error when more than 4 arguments are passed in', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(['state.one'], one => one, noopCbFunc, {store}, 'fifth argument which is not allowed')).toThrow();
  });

  test('will throw error when subscriptions (first argument) is an empty array', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation([], one => one, noopCbFunc)).toThrow();
  });

  test('will throw error when subscriptions (first argument) is undefined or null', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(null, one => one, noopCbFunc)).toThrow();
    expect(() => calculation(undefined, one => one, noopCbFunc)).toThrow();
  });

  test('will throw error when subscriptions (first argument) is not an array', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation('NOT AN ARRAY', one => one, noopCbFunc)).toThrow();
  });

  test('will throw error when any of the subscriptions values are not a string', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(['state.one',['not', 'a', 'string']], one => one, noopCbFunc)).toThrow();
  });

  test('will throw an error when any of the subscriptions values (URLs in the state) cannot be found in the state', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation([ 'path.does.not.exist' ], one => one, noopCbFunc)).toThrow();
  });

  test('will throw error when calcFunction (second argument) is not a function', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(['state.one'], 'NOT_A_FUNCTION', noopCbFunc)).toThrow();
  });

  test('will throw an error when changeCallback (third argument) is null or undefined', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(['state.one'], one => one, undefined)).toThrow();
  });

  test('will throw error when #subscriptions !== #arguments of calcFunction (the calculation should only rely on its subscriptions)', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(['state.one', 'state.two'], one => one, noopCbFunc)).toThrow();
  });

  test('will throw error when no global instance of store was found and no local instance provided', () => {
    window.store = null;
    expect(() => calculation(['state.one'], one => one, noopCbFunc)).toThrow();
    window.store = store;
  });

  test('will prefer locally passed in store over global instance', () => {
    const cbFunc             = sinon.spy(one => one),
          localStore         = createSlimReduxStore({one: 1}, { disableGlobalStore: true }),
          globalStore        = store,
          cancelSubscription = calculation(['state.one'], one => one, cbFunc, localStore),
          changeOne          = changeTrigger('CHANGE_ONE', state => ({
            ...state,
            one: 'newOne',
          }));

    // Since we're not passing in a store instance here, this will affect the global store!
    changeOne();

    // So we're testing for the subscription not having been called!
    expect(cbFunc.notCalled).toBe(true);
  });
});
