import { getReducer } from './slimRedux';

export function createSlimReduxReducer(initialState) {
  return function slimReduxReducer(state = initialState, action) {
    // if(action.type === '__ANONYMOUS_CHANGE__'){
    //   // Action was created by slim-redux and is an "anonymous" change - a change to the store without a named action
    //   // Action contains everything that the reducer needs to make the changes to the store
    //   const payload = action.payload.__slimReduxChange__.payload,
    //         handler = action.payload.__slimReduxChange__.handler;
    //
    //   return handler(state, payload, '__ANONYMOUS_CHANGE__');
    // } else {
      // Action was triggered by a named change or dispatched by regular redux code
      const reducer = getReducer(action.type);

      if(reducer){
        return reducer(state, action.payload, action);
      }else{
        return state;
      }
    // }
  }
}
