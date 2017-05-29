import { subscription } from '../subscription';

describe('Subscriptions', () => {
  describe('subscription() (regular / default case)', () => {
    test('returns true when subscription successfully created', () => {
      expect(false).toEqual(true);
    });

    test('will call changeCallback when subscribed to part of state is changed', () => {
      expect(false).toEqual(true);
    });

    test('will not call changeCallback when non-subscribed to part of state is changed', () => {
      expect(false).toEqual(true);
    });

    test('will call changeCallback with the changed subscription value as the first argument', () => {
      expect(false).toEqual(true);
    });

    test('will call changeCallback the state as the second argument', () => {
      expect(false).toEqual(true);
    });

    test('will use global store instance to register itself per default', () => {
      expect(false).toEqual(true);
    });
  });

  describe('subscription() (error cases)', () => {
    test('will throw when subscriptionString is not a string', () => {
      expect(false).toEqual(true);
    });

    test('will throw when subscriptionString cannot be found in state', () => {
      expect(false).toEqual(true);
    });

    test('will throw when subscriptionString is null, empty, or undefined', () => {
      expect(false).toEqual(true);
    });

    test('will throw when changeCallback is not a function', () => {
      expect(false).toEqual(true);
    });

    test('will throw when changeCallback is null or undefined', () => {
      expect(false).toEqual(true);
    });

    test('will throw when global store instance could not be found, and no local instance is provided', () => {
      expect(false).toEqual(true);
    });

    test('will throw when store instance provided is not a slim-redux store instance', () => {
      expect(false).toEqual(true);
    });
  });
});
