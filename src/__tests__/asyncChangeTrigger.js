import { createSlimReduxStore, changeTrigger, asyncChangeTrigger } from '../';
import { isFunction } from '../util';
import sinon from 'sinon';

const store      = createSlimReduxStore({ one: 'one', two: 'two', three: { four: 'four' } }),
      resetStore = changeTrigger('RESET_STORE', state => ({ one: 'one', two: 'two', three: { four: 'four' } })),
      noopCt     = changeTrigger('NOOP', state => state);

beforeEach(() => resetStore());

describe('Async change triggers', () => {
  describe('asyncChangeTrigger() (regular / default case)', () => {
    test('returns a function', () => {});


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

    test('throws when "triggerFunction" (second argument) null or undefined', () => {
      expect(() => asyncChangeTrigger({ noopCt }, null)).toThrow();
      expect(() => asyncChangeTrigger({ noopCt }, undefined)).toThrow();
    });
  });

  describe('trigger functions (regular / default cases)', () => {
    test('will receive function arguments and state + changetriggers as the context', () => {
      const triggerFunction = jest.fn((arg) => {}),
            aCT             = asyncChangeTrigger({ noopCt }, triggerFunction),
            testArg         = 'TEST ARGUMENT VALUE';

      aCT(testArg);

      expect(triggerFunction).toHaveBeenCalledWith(testArg);
    });

    test('change triggers will use the same store as the instance that is used by triggerFunction on invocation', () => {});
  });

  describe('trigger functions (error cases)', () => {
    test('throws when no slim-redux store instance can be found', () => {});
  });
});
