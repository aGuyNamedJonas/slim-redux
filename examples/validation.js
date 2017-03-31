/*
  Validation example. Notice how the first change trigger function passes in a
  valid payload and the corresponding action is correctly triggered, while the
  second call to the change trigger function (the one with the empty object as
  the parameter) is prevented from having any effect by the validation function.
*/

import { createStore } from 'redux';
import { createSlimReduxReducer, initSlimRedux } from 'slim-redux';

var store = createStore(createSlimReduxReducer(0));
initSlimRedux(store);

store.subscribe(() =>
  console.log(store.getState())
)

const incrementWithValidation = store.change({
  actionType: 'INCREMENT_WITH_VALIDATION',
  reducer: (state, payload) => {
    return state + payload.value;
  },

  // The validation will run everytime this change trigger is being called
  payloadValidation: (payload, accept, reject) => {
    if(!payload || !payload.value)
      return reject({
        msg: 'No parameters given or no "value" attribute in parameters provided!',
        params: payload
      });
    else
      return accept();
  }
})

// This will be accepted and will trigger a change in the store
incrementWithValidation({value: 5})

// This will be rejected and will dispatch a FSA compliant error action (and a console.error())
incrementWithValidation({})
