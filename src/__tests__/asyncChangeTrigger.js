import { createSlimReduxStore, changeTrigger, asyncChangeTrigger } from '../';
import { isFunction } from '../util';
import sinon from 'sinon';

const store      = createSlimReduxStore({ one: 'one', two: 'two', three: { four: 'four' } }),
      resetStore = changeTrigger('RESET_STORE', state => ({ one: 'one', two: 'two', three: { four: 'four' } })),
      noopCt     = changeTrigger('NOOP', state => state);

beforeEach(() => resetStore());

describe('Async change triggers', () => {
  describe('asyncChangeTrigger() (regular / default case)', () => {
    test('returns a function', () => {
      const aCT = asyncChangeTrigger({ noopCt }, arg => arg);
      expect(isFunction(aCT)).toBe(true);
    });
  });

  describe('asyncChangeTrigger() (error cases)', () => {
    test('throws when more than two arguments are provided', () => {
      expect(() => asyncChangeTrigger({ noopCt }, () => {}, 'ILLEGAL THIRD ARGUMENT')).toThrow();
    });

    test('throws when "changeTriggers" (first argument) is not an object', () => {
      expect(() => asyncChangeTrigger([ noopCt ], () => {})).toThrow();
    });

    test('throws when "changeTriggers" (first argument) is null, undefined, or an empty Object', () => {
      expect(() => asyncChangeTrigger(null, () => {})).toThrow();
      expect(() => asyncChangeTrigger(undefined, () => {})).toThrow();
      expect(() => asyncChangeTrigger({}, () => {})).toThrow();
    });

    test('throws when "triggerFunction" (second argument) is not a function', () => {
      expect(() => asyncChangeTrigger({ noopCt }, 'NOT A FUNCTION')).toThrow();
    });

    test('throws when "triggerFunction" (second argument) is null or undefined', () => {
      expect(() => asyncChangeTrigger({ noopCt }, null)).toThrow();
      expect(() => asyncChangeTrigger({ noopCt }, undefined)).toThrow();
    });
  });

  describe('trigger functions (regular / default cases)', () => {
    test('will provide state + changetriggers as the context', () => {
      var contextState = null,
          contextCt    = null;
      
      const triggerFunction = jest.fn((arg) => {
                                contextState = this.state;
                                contextCt    = this.noopCt;
                              }),
            aCT             = asyncChangeTrigger({ noopCt }, triggerFunction);

      aCT('some argument');

      expect(contextState).toEqual(store.getState());
      expect(contextCt).toEqual(noopCt);
    });

    test('change triggers will use the same store as the instance that is used by triggerFunction on invocation', () => {
      var storeInstanceCt  = null,
          storeInstanceAct = null; 
      
      const localStore = createSlimReduxStore({ random: 'state' }),
            ct         = changeTrigger('RANDOM_OP', state => {storeInstanceCt = state; return state; }),
            act        = asyncChangeTrigger({ct}, () => storeInstanceAct = this.store.getState());

      act(localStore);

      expect(storeInstanceCt).toEqual(localStore.getState());
      expect(storeInstanceAct).toEqual(localStore.getState());
    });
  });

  describe('trigger functions (error cases)', () => {
    test('throws when no slim-redux store instance can be found', () => {
      window.store = null;

      const aCT = asyncChangeTrigger({ noopCt }, arg => arg);
      expect(() => aCT('first')).toThrow();        // This is expected to throw as the global store instance was deleted and no local instance was passed in

      // Re-setup global slim redux store instance
      window.store = store;
    });

    test('throws when more arguments are passed in, than were orignally defined', () => {
      const aCT = asyncChangeTrigger({ noopCt }, arg => arg);
      expect(() => aCT('first', 'illegal second argument')).toThrow();
    });
  });
});

describe('Bug fixes (test names indicate the version where this was found)', () => {});
