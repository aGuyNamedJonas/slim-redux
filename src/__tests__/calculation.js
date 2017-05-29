import { changeTrigger, calculation, createSlimReduxStore } from '../';
import sinon from 'sinon';

describe('Calculation() (default behavior)', () => {
  test('calcFunction gets invoked whenever subscribed to state changes', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    const changeOne = changeTrigger('CHANGE_ONE', state => ({ ...state, one: 'ONE' }));
    const calcFunc = sinon.spy(one => one);
    const calc = calculation(calcFunc, { one: 'state.one' });

    // Make a change to the subscribed to 'state.one' value
    changeOne();
    expect(store.getState().one).toEqual('ONE');

    expect(calcFunc.called).toBe(true);
  });

  test('calcFunction DOES NOT get invoked when not-subscribed to state changes', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    const changeTwo = changeTrigger('CHANGE_TWO', state => ({ ...state, two: 'TWO' }));
    const calcFunc = sinon.spy(one => one);
    const calc = calculation(calcFunc, { one: 'state.one' });

    // Make a change to the NOT SUBSCRIBED TO 'state.two' value
    changeTwo();
    expect(store.getState().two).toEqual('TWO');

    expect(calcFunc.called).toBe(false);
  });

  test('calcFunction will receive latest version of subscribed to state when invoked', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    const changeOne = changeTrigger('CHANGE_ONE', state => ({ ...state, one: 'ONE' }));
    const calcFunc = sinon.spy(one => one);
    const calc = calculation(calcFunc, { one: 'state.one' });

    // Make a change to the subscribed to 'state.one' value
    changeOne();
    expect(store.getState().one).toEqual('ONE');

    expect(calcFunc.calledWith('ONE')).toBe(true);
  });

  test('optional changeCallback will be invoked after calcFunction has run', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    const changeOne = changeTrigger('CHANGE_ONE', state => ({ ...state, one: 'ONE' }));
    const calcFunc = sinon.spy(one => one);
    const cbFunc = sinon.spy(result => result);
    const calc = calculation(calcFunc, { one: 'state.one' }, cbFunc);

    // Make a change to the subscribed to 'state.one' value
    changeOne();
    expect(store.getState().one).toEqual('ONE');

    expect(calcFunc.calledBefore(cbFunc)).toBe(true);
  });

  test('optional changeCallback will receive result of calcFunction when invoked', () => {
      const MODIFIED_VALUE = 'MODIFIED_VALUE';
      const store = createSlimReduxStore({one: 'one', two: 'two'});
      const changeOne = changeTrigger('CHANGE_ONE', state => ({ ...state, one: 'ONE' }));
      const calcFunc = sinon.spy(one => MODIFIED_VALUE);
      const cbFunc = sinon.spy(result => result);
      const calc = calculation(calcFunc, { one: 'state.one' }, cbFunc);

      // Make a change to the subscribed to 'state.one' value
      changeOne();
      expect(store.getState().one).toEqual('ONE');

      expect(cbFunc.calledWith(MODIFIED_VALUE)).toBe(true);
  });
});

describe('Calculation() (error / special cases)', () => {
  test('will throw error when calcFunction (first argument) is not a function', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation('NOT_A_FUNCTION', { one: 'state.one' })).toThrow();
  });

  test('will throw error when subscriptionMap (second argument) is an empty object', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(one => one, {})).toThrow();
  });

  test('will throw error when subscriptionMap (second argument) is undefined or null', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(one => one, null)).toThrow();
    expect(() => calculation(one => one)).toThrow();
  });

  test('will throw error when subscriptionMap (second argument) is not an object', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(one => one, ['not', 'an', 'object'])).toThrow();
  });

  test('will throw error when more than 4 arguments are passed in', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(one => one, {one: 'one'}, result => result, {store}, 'fifth argument which is not allowed')).toThrow();
  });

  test('will throw error when any of the subscriptionMap values are not a string', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(one => one, { one: 'state.one', two: ['not', 'a', 'string'] })).toThrow();
  });

  test('will throw an error when any of the subscriptionMap values (URLs in the state) cannot be found in the state', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(one => one, { one: 'path.does.not.exist'})).toThrow();
  });

  test('will throw error when #subscriptions !== #arguments of calcFunction', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'});
    expect(() => calculation(one => one, { one: 'state.one', two: 'state.two' })).toThrow();
  });

  test('will throw error when no global instance of store was found and no local instance provided', () => {
    const store = createSlimReduxStore({one: 'one', two: 'two'}, { disableGlobalStore: true });
    expect(() => calculation(one => one, { one: 'state.one' })).toThrow();
  });

  test('will prefer locally passed in store over global instance', () => {
    const globalStore = createSlimReduxStore({one: 'one', two: 'two'});
    const localStore = createSlimReduxStore({one: 1}, { disableGlobalStore: true });
    const calc = calculation(one => one, { one: 'state.one' }, { store: localStore });
    expect(calc()).toEqual(1);
  });
});
