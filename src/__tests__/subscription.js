import { changeTrigger, createSlimReduxStore, subscription } from '../';
import sinon from 'sinon';

const store      = createSlimReduxStore({ one: 'one', two: 'two', three: { four: 'four' } }),
      resetStore = changeTrigger('RESET_STORE', state => ({ one: 'one', two: 'two', three: { four: 'four' } }));

beforeEach(() => resetStore());

describe('Subscriptions', () => {
  describe('subscription() (regular / default case)', () => {
    test('returns true when subscription successfully created', () => {
      const subscriptionCreated = subscription('state.three.four', four => four);
      expect(subscriptionCreated).toBe(true);
    });

    test('will call changeCallback when subscribed to part of state is changed', () => {
      const cbFunc              = sinon.spy(one => one),
            subscriptionCreated = subscription('state.one', calcFunc),
            changeOne           = changeTrigger('CHANGE_ONE', state => ({
              ...state,
              one: 'newOne',
            }));

      expect(cbFunc.called).toBe(true);
    });

    test('will not call changeCallback when non-subscribed to part of state is changed', () => {
      const cbFunc              = sinon.spy(one => one),
            subscriptionCreated = subscription('state.one', calcFunc),
            changeTwo           = changeTrigger('CHANGE_TWO', state => ({
              ...state,
              two: 'newTwo',
            }));

      expect(cbFunc.called).toBe(false);
    });

    test('will call changeCallback with the changed subscription value as the first argument and the state as the second argument', () => {
      const cbFunc              = sinon.spy(one => one),
            subscriptionCreated = subscription('state.one', calcFunc),
            changeOne           = changeTrigger('CHANGE_ONE', state => ({
              ...state,
              one: 'newOne',
            }));

      changeOne();

      expect(cbFunc.calledWith('newOne', {
        ...state,
        one: 'newOne',
      })).toBe(true);
    });

    test('will use global store instance to register itself per default', () => {
      const subFunction = one => changeSubValue = one,
            sub         = subscription('state.one', calcFunc),
            changeOne   = changeTrigger('CHANGE_ONE', state => ({
              ...state,
              one: 'newOne',
            }));

      let changeSubValue = null;

      changeOne();
      expect(changeSubValue).toBe('newOne');
    });
  });

  describe('subscription() (error cases)', () => {
    test('throws an error when more than three arguments are provided', () => {
      expect(() => subscription('state.one', one => one, store, 'NOT ALLOWED FOURTH PARAMETER')).toThrow();
    });

    test('throws when three arguments are provided and the last one is not a slim-redux store instance', () => {
      expect(() => subscription('state.one', one => one, 'not a slim-redux store instance')).toThrow();
    });

    test('throws when subscriptionString is not a string', () => {
      expect(() => subscription(['not', 'a', 'string'], one => one)).toThrow();
    });

    test('throws when subscriptionString cannot be found in state', () => {
      expect(() => subscription('state.notExistingKey', notExistingKey => notExistingKey)).toThrow();
    });

    test('throws when subscriptionString is null, empty, or undefined', () => {
      expect(() => subscription('', smthg => smthg)).toThrow();
      expect(() => subscription(null, smthg => smthg)).toThrow();
      expect(() => subscription(undefined, smthg => smthg)).toThrow();
    });

    test('throws when changeCallback is not a function', () => {
      expect(() => subscription('state.one', 'clearly not a function')).toThrow();
    });

    test('throws when changeCallback is null or undefined', () => {
      expect(() => subscription('state.one', null)).toThrow();
      expect(() => subscription('state.one', undefined)).toThrow();
    });

    test('throws when global store instance could not be found, and no local instance is provided', () => {
      window.store = null;
      expect(() => subscription('state.one', smthg => smthg)).toThrow();
    });
  });
});
