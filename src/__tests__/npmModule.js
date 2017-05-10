import { createSlimReduxStore, changeTrigger, asyncChangeTrigger } from '../';  // It's important we import the functions are they are being exported by the module

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
});
