import { getChangeHandlerModifier } from './slimRedux';

export function slimReduxReducer(state = 0, action) {
  const changeActionHandler = getChangeHandlerModifier(action.type);

  if(changeActionHandler){
    return changeActionHandler(state, action.payload, action);
  }else{
    return state;
  }
}
