import { registerReducer, dispatchStoreAction, dispatchErrorAction } from './slimRedux';

const performPayloadValidation = (actionType, payload, payloadValidation) => {
  const accept = () => ({type: 'accept'});
  const reject = (msg = '') => ({type: 'reject', payload: msg});

  const validation = payloadValidation(payload, accept, reject);

  if(validation.type === 'reject')
    dispatchErrorAction(actionType, validation.payload);

  return validation.type;
}

export function change(parameters){
  var actionType        = parameters.actionType || null,
      reducer           = parameters.reducer,
      payloadValidation = parameters.payloadValidation || null;

  if(actionType){
    // This change has an ACTION_TYPE, which means we can register it in the reducer
    registerReducer(actionType, reducer, payloadValidation);

    // Create and return change trigger function (has payload as the only parameter, will trigger validation)
    return (actionPayload) => {
      var validation = 'accept';

      if(payloadValidation)
        validation = performPayloadValidation(actionType, actionPayload, payloadValidation);

      if(validation === 'accept'){
        dispatchStoreAction({
          type: actionType,
          payload: actionPayload,
        });
      }
    }
  } else {
    // Anonymous change (no ACTION_TYPE) - don't register, just dispatch the appropriate action!
    return (actionPayload) => {
      var validation = 'accept';

      if(payloadValidation)
        validation = performPayloadValidation(actionType, actionPayload, payloadValidation);

      if(validation === 'accept'){
        dispatchStoreAction({
          type: '__ANONYMOUS_CHANGE__',
          payload: {
            reducer: reducer,
            payload: actionPayload,
          }
        });
      }
    }
  }
}
