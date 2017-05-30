import { createSlimReduxStore, changeTrigger, asyncChangeTrigger } from '../';
import { isFunction } from '../util';
import sinon from 'sinon';

const store      = createSlimReduxStore({ one: 'one', two: 'two', three: { four: 'four' } }),
      resetStore = changeTrigger('RESET_STORE', state => ({ one: 'one', two: 'two', three: { four: 'four' } })),
      noopCt     = changeTrigger('NOOP', state => state);

beforeEach(() => resetStore());

describe('Async change triggers', () => {
  describe('asyncChangeTrigger() (regular / default case)', () => {
    test('returns a function', () => expect(
      isFunction(
        asyncChangeTrigger({ noopCt }, state => state)
      )
    ).toBe(true));

    test('passes the provided store instance to change triggers invoked', () => {
      // This is possible by having change triggers be wrapped in another function which passes in the store as the last argument!
      const reducer  = sinon.spy(state => state),
            altStore = createSlimReduxStore({ alt: 'altStore' }),
            spyCt    = changeTrigger('NOOP', reducer),
            act      = asyncChangeTrigger({ spyCt }, state => spyCt(), altStore);

      act();
      expect(cbFunc.calledWith(altStore.getState())).toBe(true);
    });
  });

  describe('asyncChangeTrigger() (error cases)', () => {
    test('throws when more than three arguments are provided', () =>
      expect(() => asyncChangeTrigger({ noopCt }, state => state, store, 'ILLEGAL FOURTH ARGUMENT')).toThrow();
    );

    test('throws when change triggers (first argument) is not an object', () =>
      expect(() => asyncChangeTrigger('NOT AN OBJECT', state => state)).toThrow();
    );

    test('throws when change triggers (first argument) is null or undefined', () => {
      expect(() => asyncChangeTrigger(null, state => state)).toThrow();
      expect(() => asyncChangeTrigger(undefined, state => state)).toThrow();
    });

    test('throws when triggerFunction (second argument) is not a function', () =>
      expect(() => asyncChangeTrigger({ noopCt }, 'NOT A FUNCTION')).toThrow();
    );

    test('throws when triggerFunction (second argument) has zero arguments', () =>
      expect(() => asyncChangeTrigger({ noopCt }, () => {})).toThrow();
    );

    test('throws when triggerFunction (second argument) does not have "state" as its last argument', () =>
      expect(() => asyncChangeTrigger({ noopCt }, () => {})).toThrow();
    );

    test('throws when the third argument provided is not a slim-redux instance', () =>
        expect(() => asyncChangeTrigger({ noopCt }, state => state, 'NOT A SLIM-REDUX STORE INSTANCE')).toThrow();
    );
  });

  describe('asyncChangeTrigger() returned function', () => {
    test('when invoked it returns whatever is returned by trigger function', () => {
      const act       = asyncChangeTrigger({ spyCt }, state => 'RETURN VALUE'),
            returnVal = act();

      expect(returnVal).toBe('RETURN VALUE');
    });
  });
});
