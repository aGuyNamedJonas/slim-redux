import { createSlimReduxStore, changeTrigger, hoChangeTrigger, calculation } from '../';  // It's important we import the functions are they are being exported by the module

describe('NPM module', () => {
  test('exports createSlimReduxStore()', () => {
    expect(createSlimReduxStore).toBeTruthy();
    expect(createSlimReduxStore).not.toBeUndefined();
  });

  test('exports changeTrigger()', () => {
    expect(changeTrigger).toBeTruthy();
    expect(changeTrigger).not.toBeUndefined();
  });

  test('exports hoChangeTrigger()', () => {
    expect(hoChangeTrigger).toBeTruthy();
    expect(hoChangeTrigger).not.toBeUndefined();
  });

  test('exports calculation()', () => {
    expect(calculation).toBeTruthy();
    expect(calculation).not.toBeUndefined();
  });
});
