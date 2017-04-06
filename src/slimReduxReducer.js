import { getReducer } from './slimRedux';

export function createSlimReduxReducer(initialState) {
  return function slimReduxReducer(state = initialState, action) {
    // Action was triggered by a named change or dispatched by regular redux code
    const reducer = getReducer(action.type);

    if(reducer){
      return reducer(state, action.payload, action);
    }else{
      return state;
    }
  }
}
