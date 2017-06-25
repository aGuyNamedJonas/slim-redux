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
      const aCT = asyncChangeTrigger({ noopCt }, ct => {});
      expect(isFunction(aCT)).toBe(true);
    });
  });

  describe('asyncChangeTrigger() (error cases)', () => {
    test('throws when more than two arguments are provided', () => {
      expect(() => asyncChangeTrigger({ noopCt }, ct => {}, 'ILLEGAL THIRD ARGUMENT')).toThrow();
    });

    test('throws when "changeTriggers" (first argument) is not an object', () => {
      expect(() => asyncChangeTrigger([ noopCt ], ct => {})).toThrow();
    });

    test('throws when "changeTriggers" (first argument) is null, undefined, or an empty Object', () => {
      expect(() => asyncChangeTrigger(null, ct => {})).toThrow();
      expect(() => asyncChangeTrigger(undefined, ct => {})).toThrow();
      expect(() => asyncChangeTrigger({}, ct => {})).toThrow();
    });

    test('throws when "triggerFunction" (second argument) is not a function', () => {
      expect(() => asyncChangeTrigger({ noopCt }, 'NOT A FUNCTION')).toThrow();
    });

    test('throws when "triggerFunction" (second argument) is null or undefined', () => {
      expect(() => asyncChangeTrigger({ noopCt }, null)).toThrow();
      expect(() => asyncChangeTrigger({ noopCt }, undefined)).toThrow();
    });

    test('throws when "triggerFunction" (second argument) has zero arguments (needs at least one for change triggers + state)', () => {
      expect(() => asyncChangeTrigger({ noopCt }, () => {})).toThrow();
    });
  });

  describe('trigger functions (regular / default cases)', () => {
    test('will pass in state + changetriggers as an object as the last function argument', () => {
      var contextState = null,
          contextCt    = null;
      
      const triggerFunction = ct => {
                                contextState = ct.state;
                                contextCt    = ct.noopCt;
                              },
            aCT             = asyncChangeTrigger({ noopCt }, triggerFunction);

      aCT();

      expect(contextState).toEqual(store.getState());

      // To check for equality of change trigger functions, we'll have to make sure they:
      // #1 Emit the same action type
      // #2 Produce the same action
      // #3 Produce the same store modification
      // expect(contextCt).toEqual(noopCt);
    });

    test('context for the trigger function (last argument) can be any valid javascript identifier', () => {
      // Just having a little bit of unicode fun, remember kids: There's an absurd amount of characters that JS allows to be variable names! :)
      // https://stackoverflow.com/questions/1661197/what-characters-are-valid-for-javascript-variable-names
      expect(() => asyncChangeTrigger({ noopCt }, 𐅡 => {})).not.toThrow();
      expect(() => asyncChangeTrigger({ noopCt }, ي => {})).not.toThrow();
      expect(() => asyncChangeTrigger({ noopCt }, ˮ => {})).not.toThrow();
    });

    test('change triggers will use the same store as the instance that is used by triggerFunction on invocation', () => {
      var stateInstanceCt  = null,
          stateInstanceAct = null; 
      
      const localStore = createSlimReduxStore({ random: 'state' }),
            ct         = changeTrigger('RANDOM_OP', state => {
              stateInstanceCt = state; 
              return state; 
            }),
            act        = asyncChangeTrigger({ ct }, context => {
              // Store the state instance we received...
              stateInstanceAct = context.state;
              // Execute the change trigger we got...
              context.ct();
            });

      act(localStore);

      expect(stateInstanceCt).toEqual(localStore.getState());
      expect(stateInstanceAct).toEqual(localStore.getState());
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
      const aCT = asyncChangeTrigger({ noopCt }, ct => {});
      expect(() => aCT('first', 'illegal second argument')).toThrow();
    });
  });
});

describe('Bug fixes (test names indicate the version where this was found)', () => {});
