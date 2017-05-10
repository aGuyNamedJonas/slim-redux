import { changeTrigger } from '../changeTrigger';

describe('Change triggers', () => {
  // test('change triggers dispatch an action', () => {
  //   let actionType = null;
  //   let actionObject = null;
  //
  //   // Dummy middleware, intercepting the action type and the action itself
  //   const interceptionMiddleware = store => next => action => {
  //     actionType = action.type;
  //     actionObject = action;
  //     let result = next(action)
  //     return result
  //   }
  //
  //   let store = createSlimReduxStore(INITIAL_STATE, {
  //     middleware: applyMiddleware(interceptionMiddleware),
  //   });
  //
  //   const increment = changeTrigger(INCREMENT, )
  //
  //   // Check whether our dummy middleware could successfully intercept the dispatched action
  //   expect(actionType).toEqual(INCREMENT);
  // });
  //
  // test('change trigger reducers are applied before the action will get dispatched', () => {});
});
