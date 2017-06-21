import { createSlimReduxStore, changeTrigger, asyncChangeTrigger, calculation, subscription, CANCEL_SUBSCRIPTION } from '../';  // It's important we import the functions are they are being exported by the module

describe('NPM module', () => {
  test('exports createSlimReduxStore()', () => {
    expect(createSlimReduxStore).toBeTruthy();
    expect(createSlimReduxStore).not.toBeUndefined();
  });

  test('exports changeTrigger()', () => {
    expect(changeTrigger).toBeTruthy();
    expect(changeTrigger).not.toBeUndefined();
  });

  test('exports asyncChangeTrigger()', () => {
    expect(asyncChangeTrigger).toBeTruthy();
    expect(asyncChangeTrigger).not.toBeUndefined();
  });

  test('exports calculation()', () => {
    expect(calculation).toBeTruthy();
    expect(calculation).not.toBeUndefined();
  });

  test('exports subscription()', () => {
    expect(subscription).toBeTruthy();
    expect(subscription).not.toBeUndefined();
  });

  test('exports CANCEL_SUBSCRIPTION constant', () => {
    expect(CANCEL_SUBSCRIPTION).toBeTruthy();
    expect(CANCEL_SUBSCRIPTION).not.toBeUndefined();
  });
});
