'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _toConsumableArray = _interopDefault(require('babel-runtime/helpers/toConsumableArray'));
var _extends = _interopDefault(require('babel-runtime/helpers/extends'));
var _Object$keys = _interopDefault(require('babel-runtime/core-js/object/keys'));
var _JSON$stringify = _interopDefault(require('babel-runtime/core-js/json/stringify'));
var redux = require('redux');
var intersection = _interopDefault(require('lodash.intersection'));
var reduceReducers = _interopDefault(require('reduce-reducers'));
var reselect = require('reselect');

var error = function error(location, msg) {
  throw new Error('*** Error in ' + location + ': ' + msg);
};

/*
  Functions to determine the type of something
  Pattern stolen from here: http://tobyho.com/2011/01/28/checking-types-in-javascript/
*/
var getType = function getType(whatever) {
  return whatever.constructor;
};
var isObject = function isObject(obj) {
  return obj.constructor === Object;
};
var isArray = function isArray(arr) {
  return arr.constructor === Array;
};
var isString = function isString(str) {
  return str.constructor === String;
};
var isFunction = function isFunction(func) {
  return typeof func == 'function';
}; // Taken from: https://jsperf.com/alternative-isfunction-implementations/4
var isBoolean = function isBoolean(binary) {
  return binary.constructor === Boolean;
};
var isSet = function isSet(smthg) {
  return smthg !== undefined && smthg !== null;
};
var isEmptyString = function isEmptyString(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '') === '';
}; // Taken from: https://stackoverflow.com/questions/3000649/trim-spaces-from-start-and-end-of-string
var isEmptyObject = function isEmptyObject(obj) {
  return _Object$keys(obj).length === 0;
};
var isSlimReduxStore = function isSlimReduxStore(obj) {
  return obj.slimReduxOptions;
};

/*
  Validates a subscription string
*/

var isSubscriptionStrValid = function isSubscriptionStrValid(str, state) {
  var subStringParts = str.split('.');
  var statePointer = state;

  // Check whether or not first part is "store"
  if (subStringParts[0] !== 'state') return false;

  for (var i = 1; i < subStringParts.length; i++) {
    var nextPart = subStringParts[i];

    if (!statePointer.hasOwnProperty(nextPart)) return false;

    statePointer = statePointer[nextPart];
  }

  return true;
};

/*
  Checks whether two arrays contain any duplicates, or not
*/

function createSlimReduxStore(initialState, options) {
  var error$$1 = function error$$1(msg) {
    return error('createSlimReduxStore()', msg);
  };

  if (!window) global.window = global;

  /*
    Set default values
  */
  var defaultReducer = function defaultReducer(state) {
    return state;
  },
      registerChangeTrigger = function registerChangeTrigger() {
    error$$1('It\'s not neccessary anymore to register change triggers. Please see https://github.com/aGuyNamedJonas/slim-redux/blob/master/README.md#api-reference for details.');
  };

  // Default values
  var rootReducer = defaultReducer,
      middleware = undefined,
      slimReduxOptions = {
    disableActionDispatch: false,
    disableGlobalStore: false
  },
      slimReduxChangeTriggers = {};

  /*
    Check input parameters, this puppy should be fool proof :)
  */
  if (arguments.length > 2) error$$1('Only 2 arguments allowed, ' + arguments.length + ' given: \n ' + _JSON$stringify(arguments, null, 2));

  if (initialState === undefined || initialState === null) error$$1('initialState (first argument) cannot be null or undefined, got: ' + initialState);

  // Check the options argument
  if (options !== undefined) {
    // Check whether it's an object
    if (!isObject(options)) error$$1('options (second argument) needs to be an object. Instead got argument of type: ' + getType(options));

    // Check option names and their values
    var optionKeys = _Object$keys(options);

    for (var i = 0; i < optionKeys.length; i++) {
      var name = optionKeys[i];
      var option = options[name];

      switch (name) {
        case 'rootReducer':
          if (!isFunction(option)) error$$1('The value for the "rootReducer" option needs to be of Type "Function", got ' + getType(option));else rootReducer = options.rootReducer;
          break;

        case 'middleware':
          if (!isFunction(option)) error$$1('The value for the "middleware" option needs to be of Type "Function", got ' + getType(option));else middleware = options.middleware;
          break;

        case 'disableActionDispatch':
          if (!isBoolean(option)) error$$1('The value for the "disableActionDispatch" option needs to be of Type "Boolean", got ' + getType(option));else slimReduxOptions.disableActionDispatch = options.disableActionDispatch;
          break;

        case 'disableGlobalStore':
          if (!isBoolean(option)) error$$1('The value for the "disableGlobalStore" option needs to be of Type "Boolean", got ' + getType(option));else slimReduxOptions.disableGlobalStore = options.disableGlobalStore;
          break;

        default:
          error$$1('Unknown option: "' + name + '"');
      }
    }
  }

  /*
    Create the redux store, inject the slim-redux reducer and the slim-redux functionality into it
  */
  var store = redux.createStore(rootReducer, initialState, middleware);

  // Inject all the good stuff into the store
  store.registerChangeTrigger = registerChangeTrigger;
  store.slimReduxOptions = slimReduxOptions;
  store.slimReduxChangeTriggers = slimReduxChangeTriggers;

  /*
    Setup internal slim-redux reducer
  */
  function slimReduxReducer(state, action) {
    var actionType = action.type,
        payload = action.payload,
        actionTypeRegistered = this.slimReduxChangeTriggers[actionType] !== undefined;

    if (actionTypeRegistered) {
      var reducer = this.slimReduxChangeTriggers[actionType].reducer,
          focusSubString = this.slimReduxChangeTriggers[actionType].focusSubString,
          getFocusState = this.slimReduxChangeTriggers[actionType].getFocusState,
          setFocusState = this.slimReduxChangeTriggers[actionType].setFocusState;

      // Case #1: Focus subscription string was set --> Change trigger function only gets executed on a part of the state
      if (focusSubString) {
        var stateClone = _extends({}, state),
            // It's vital that we don't mutate the existing state, see this: https://egghead.io/lessons/javascript-redux-avoiding-object-mutations-with-object-assign-and-spread
        focusState = getFocusState(stateClone),
            newFocusState = reducer.apply(undefined, _toConsumableArray(payload).concat([focusState])),
            newState = setFocusState(newFocusState, stateClone);

        return newState;
      }

      // Case #2: Focus subscription string null --> Execute change trigger function on complete state
      return reducer.apply(undefined, _toConsumableArray(payload).concat([state]));
    } else {
      return state;
    }
  }

  // Inject internal reducer
  var enhancedRootReducer = reduceReducers(rootReducer, slimReduxReducer.bind(store));
  store.replaceReducer(enhancedRootReducer);

  // Register store instance in global namespace if not turned off
  if (!slimReduxOptions.disableGlobalStore) window.store = store;

  return store;
}

function changeTrigger(actionType, reducer, focusSubString) {
  var error$$1 = function error$$1(msg) {
    return error('changeTrigger()', msg);
  };

  /*
    Check input parameters, make it incredibly tight against faulty use
  */
  if (arguments.length > 3) error$$1('Only three arguments allowed, got ' + arguments.length + ': \n ' + _JSON$stringify(arguments, null, 2));

  if (actionType === undefined || actionType === null || actionType.replace(/\s/g, '') === '') error$$1('"actionType" (first argument) cannot be empty, null, undefined or only contain whitespace: \n ' + _JSON$stringify(arguments, null, 2));

  if (!isString(actionType)) error$$1('"actionType" (first argument) needs to be of type String, got ' + getType(actionType) + ' instead: \n ' + _JSON$stringify(arguments, null, 2));

  if (!isSet(reducer)) error$$1('"reducer" (second argument) cannot be undefined or null: \n ' + _JSON$stringify(arguments, null, 2));

  if (!isFunction(reducer)) error$$1('"reducer" (second argument) needs to be of type Function, got ' + getType(actionType) + ' instead: \n ' + _JSON$stringify(arguments, null, 2));

  if (reducer.length === 0) error$$1('"reducer" (second argument) needs to have at least one argument: \n ' + _JSON$stringify(arguments, null, 2));

  if (isSet(focusSubString) && !isString(focusSubString)) error$$1('"focusSubString" (optional third argument) needs to be a string \n ' + _JSON$stringify(arguments, null, 2));

  if (isSet(focusSubString) && isEmptyString(focusSubString)) error$$1('"focusSubString" (optional third argument) cannot be empty \n ' + _JSON$stringify(arguments, null, 2));

  /*
    Setup all the things the change trigger function needs inside a closure (ct = change trigger)
  */
  var ctActionType = actionType,
      ctReducerFunc = reducer,
      ctReducerArgumentsCount = reducer.length,
      // Rename this to payload arguments count?
  ctError = function ctError(msg) {
    return error(ctActionType + ' change trigger function', msg);
  },
      ctFocusSubString = focusSubString || null;

  var ctRegistered = false,
      storeParam = null;

  function changeTriggerFunction() {
    for (var _len = arguments.length, parameters = Array(_len), _key = 0; _key < _len; _key++) {
      parameters[_key] = arguments[_key];
    }

    /*
      Check parameters
    */

    // Check for the 'slimReduxOptions' key in the last argument to assess whether it's a slim-redux store
    var lastArg = parameters[parameters.length - 1];

    if (parameters.length > 0) storeParam = isObject(lastArg) && 'slimReduxOptions' in lastArg ? lastArg : null;else storeParam = null;

    // Get store either from the parameters, the global scope (if setup) or throw an error
    var store = storeParam || window.store;

    if (!isSet(store)) ctError('Cannot find slim-redux store instance in arguments (last parameter) of change trigger or in window.store (global scope, set by createSlimReduxStore()). If set the (disableGlobalStore: true) option in createSlimReduxStore(), make sure to pass in the desired slim-redux store instance as the last argument in every change trigger call');

    // If last argument is not a slim-redux store instance, max. amount of arguments can be one less than the reducer func. had
    if (storeParam === null && parameters.length > ctReducerArgumentsCount - 1) ctError('Last argument doesn\'t seem to be slim-redux store instance, thus max. allowed arguments: ' + (ctReducerArgumentsCount - 1) + ', got ' + parameters.length + ' instead: \n ' + _JSON$stringify(parameters, null, 2));

    if (storeParam !== null && parameters.length > ctReducerArgumentsCount) ctError('Last argument seems to be slim-redux store instance, thus max. allowed arguments: ' + ctReducerArgumentsCount + ', got ' + parameters.length + ' instead: \n ' + _JSON$stringify(parameters, null, 2));

    /*
      Register change trigger in slim-redux reducer, if not done yet
    */
    if (!ctRegistered) {
      // Check the subscription string of the change trigger
      if (isSet(ctFocusSubString) && !isSubscriptionStrValid(ctFocusSubString, store.getState())) ctError('"focusSubString" (' + ctFocusSubString + ') could not be found in state \n ' + _JSON$stringify(store.getState(), null, 2));

      store.slimReduxChangeTriggers[ctActionType] = {
        reducer: ctReducerFunc, // change trigger function
        focusSubString: ctFocusSubString, // subscription string which dictates the focus of the change trigger function
        getFocusState: null,
        setFocusState: null
      };

      // If change trigger has a focus string, set that up
      if (ctFocusSubString) {
        store.slimReduxChangeTriggers[ctActionType].getFocusState = eval('state => ' + ctFocusSubString), // function which will return the part of the state that the change trigger processes
        store.slimReduxChangeTriggers[ctActionType].setFocusState = eval('(value, state) => { ' + ctFocusSubString + ' = value; return state; }'); // function which will set a part of the state and return the full state
      }

      ctRegistered = true;
    }

    /*
      Prepare action and then dispatch it
    */
    var payload = [];

    for (var i = 0; i < ctReducerArgumentsCount - 1; i++) {
      payload.push(parameters[i]);
    }var action = { type: ctActionType, payload: payload };

    // Dispatch action
    store.dispatch(action);

    // Return dispatched action and the new state
    return { action: action, state: store.getState() };
  }

  return changeTriggerFunction;
}

function asyncChangeTrigger(changeTriggers, triggerFunction) {
  var error$$1 = function error$$1(msg) {
    return error('asyncChangeTrigger()', msg);
  };

  /*
    Parameter validation (see tests)
  */
  if (arguments.length > 2) error$$1('Only 2 arguments allowed, ' + arguments.length + ' given: \n ' + _JSON$stringify(arguments, null, 2));

  // Check changeTriggers
  if (!isObject(changeTriggers)) error$$1('"changeTriggers" (first argument) needs to be an object, got ' + getType(changeTriggers) + ' instead: \n ' + _JSON$stringify(arguments, null, 2));

  if (!isSet(changeTriggers) || isEmptyObject(changeTriggers)) error$$1('"changeTriggers" (first argument) cannot be null, empty, or undefined: \n ' + _JSON$stringify(arguments, null, 2));

  // Check triggerFunction
  if (!isFunction(triggerFunction)) error$$1('"triggerFunction" (second argument) needs to be a function, got ' + getType(triggerFunction) + ' instead: \n ' + _JSON$stringify(arguments, null, 2));

  if (!isSet(triggerFunction)) error$$1('"triggerFunction" (second argument) cannot be null or undefined: \n ' + _JSON$stringify(arguments, null, 2));

  if (triggerFunction.length === 0) error$$1('"triggerFunction" (second argument) needs to have at least one argument. The last argument is used to pass in the change triggers and the state: \n ' + _JSON$stringify(arguments, null, 2));

  /*
    Implementation
  */
  var actError = function actError(msg) {
    return error('Async change trigger function', msg);
  },
      actChangeTriggers = changeTriggers,
      actTriggerFunction = triggerFunction;

  var storeParam = null;

  function asyncChangeTriggerFunction() {
    for (var _len = arguments.length, parameters = Array(_len), _key = 0; _key < _len; _key++) {
      parameters[_key] = arguments[_key];
    }

    if (parameters.length > 0) {
      var lastArg = parameters[parameters.length - 1];
      storeParam = isObject(lastArg) && isSlimReduxStore(lastArg) ? lastArg : null;
    }

    // Get store either from the parameters, the global scope (if setup) or throw an error
    var store = storeParam || window.store;

    if (!isSet(store)) actError('Cannot find slim-redux store instance in arguments (last parameter) of async change trigger or in window.store (global scope, set by createSlimReduxStore()). If set the (disableGlobalStore: true) option in createSlimReduxStore(), make sure to pass in the desired slim-redux store instance as the last argument in every change trigger call');

    if (storeParam && parameters.length - 1 > actTriggerFunction.length - 1 || !storeParam && parameters.length > actTriggerFunction.length - 1) actError('This async change trigger function only takes ' + (actTriggerFunction.length - 1) + ' arguments (not taking the last argument into account which is used to pass in change triggers + state). Not taking the optional last store argument into account, you passed in ' + (storeParam ? arguments.length - 1 : arguments.length) + ' parameters.');

    // Wrap change triggers in a way that they use the store instance we just got hold of
    var localStoreChangeTriggers = _extends({}, actChangeTriggers);

    // Wrap all change triggers in functions which use the store instance
    _Object$keys(actChangeTriggers).map(function (key) {
      localStoreChangeTriggers[key] = function () {
        // Creating a new closure to preserve the store instance
        var ct = actChangeTriggers[key];

        // We only pass down the parameters to the change trigger if the change trigger accepts any

        for (var _len2 = arguments.length, params = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          params[_key2] = arguments[_key2];
        }

        if (ct.length === 1) ct(store);else ct.apply(undefined, params.concat([store]));
      };
    });

    // Call triggerFunction w/ parameters and object with state and change triggers as last argument
    if (storeParam && parameters.length === 1 || !storeParam && parameters.length === 0) // in this case the async change trigger doesn't have any function arguments of its own
      actTriggerFunction(_extends({ state: store.getState() }, localStoreChangeTriggers));else actTriggerFunction.apply(undefined, parameters.concat([_extends({ state: store.getState() }, localStoreChangeTriggers)]));
  }

  return asyncChangeTriggerFunction;
}

var CANCEL_SUBSCRIPTION = 'CANCEL_SUBSCRIPTION';

/*
    Special reselector which can tell us whether the underlying value has actually changed
*/
var defaultEqualityCheck = function defaultEqualityCheck(a, b) {
  return a === b;
};

var areArgumentsShallowlyEqual = function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  var length = prev.length;
  for (var i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
};

var defaultMemoize = function defaultMemoize(func) {
  var equalityCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultEqualityCheck;

  var lastArgs = null;
  var lastResult = null;
  // we reference arguments instead of spreading them for performance reasons
  return function () {
    var changed = false;

    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments);
      changed = true;
    }

    lastArgs = arguments;

    return {
      hasChanged: changed,
      data: lastResult
    };
  };
};

var getNotifyingSelectorCreator = function getNotifyingSelectorCreator() {
  return reselect.createSelectorCreator(defaultMemoize);
};
var createNotifyingSelector = getNotifyingSelectorCreator();

function calculation(subscriptions, calcFunction, changeCallback, storeArg) {
  var _arguments = arguments;

  var error$$1 = function error$$1(msg) {
    return error('calculation()', msg);
  };

  /*
    Parameter validation (see tests)
  */

  if (arguments.length > 4) error$$1('Only four arguments allowed, got ' + arguments.length + ': \n ' + _JSON$stringify(arguments, null, 2));

  // Check subscriptions
  if (!isArray(subscriptions)) error$$1('"subscriptions" (first argument) needs to be of type Array, got \n ' + getType(subscriptions) + ' instead: \n ' + _JSON$stringify(arguments, null, 2));

  if (!isSet(subscriptions) || subscriptions.length === 0) error$$1('"subscriptions" (first argument) cannot be undefined, null, or empty: \n ' + _JSON$stringify(arguments, null, 2));

  // Check calcFunction
  if (!isFunction(calcFunction)) error$$1('"calcFunction" (second argument) needs to be a function, got ' + getType(actionType) + ' instead: \n ' + _JSON$stringify(arguments, null, 2));

  if (!isSet(calcFunction)) error$$1('"calcFunction" (second argument) cannot be undefined or null: \n ' + _JSON$stringify(arguments, null, 2));

  if (calcFunction.length !== subscriptions.length) error$$1('"calcFunction" (second argument) Needs to have as many arguments as there are subscriptions. Calculations can only rely on their subscriptions for data: \n ' + _JSON$stringify(arguments, null, 2));

  // Check changeCallback
  if (!isSet(changeCallback)) error$$1('"changeCallback" (third argument) cannot be undefined or null:  \n ' + _JSON$stringify(arguments, null, 2));

  // Check (optional) store instance
  if (storeArg && !isSlimReduxStore(storeArg)) error$$1('"storeArg" (third argument) is optional, but has to be a slim-redux store instance if provided: \n' + _JSON$stringify(arguments, null, 2));

  var store = storeArg || window.store;

  if (!isSet(store)) error$$1('No store instance provided in global and local scope! In case you set "disableGlobalStore" when creating slim-redux store, make sure to pass it in as the last argument!\n ' + _JSON$stringify(arguments, null, 2));

  if (!isSlimReduxStore(store)) error$$1('Store instance provided is not a slim-redux store! \n ' + _JSON$stringify(arguments, null, 2));

  // check subscription strings
  subscriptions.map(function (subscription, i) {
    if (!isString(subscription)) error$$1('subscriptions need to be of value string, got ' + getType(subscription) + ' for subscriptions[' + i + '] instead: \n ' + _JSON$stringify(_arguments, null, 2));

    if (!isSubscriptionStrValid(subscription, store.getState())) error$$1('Cannot find subscription path \'' + subscription + '\'  in state (subscriptions[' + i + ']). Remember: Subscription strings have to be of the form: "state.todos.filter". \n ' + _JSON$stringify(store.getState(), null, 2));
  });

  /*
    Implementation
  */
  // Same approach as with subscriptions:
  // #1: Turn subscriptions into functions
  var subFunctions = subscriptions.map(function (subscription) {
    // Straight up copied from the implementation of subscription()...
    var getStateFunctionString = 'state => ' + subscription,
        // Syntax for a function: state => subscription-string part of state
    getStateFunction = eval(getStateFunctionString); // Turn the string from step one into an actual function

    return getStateFunction;
  });

  // #2: Create notifying selector (using the subscription functions + calcFunction)
  var checkCalculationSelector = createNotifyingSelector.apply(undefined, _toConsumableArray(subFunctions).concat([calcFunction]));

  // Initial firing - initially of course the state has changed!
  checkCalculationSelector(store.getState());

  // #3: Subscribe calculation using store.subscribe() and only call changeCallback if it actually changed
  var unsubscribe = store.subscribe(function () {
    var subscriptionState = checkCalculationSelector(store.getState());

    if (subscriptionState.hasChanged) changeCallback(subscriptionState.data, store.getState());
  });

  // #4: Create the function which will be returned
  var getCalculationOrUnsubscribe = function getCalculationOrUnsubscribe(instruction) {
    if (instruction === CANCEL_SUBSCRIPTION) unsubscribe();else return checkCalculationSelector(store.getState()).data; // Returns the calculation value
  };

  // All done!
  return getCalculationOrUnsubscribe;
}

function subscription(subscription, changeCallback, storeArg) {
  var error$$1 = function error$$1(msg) {
    return error('subscription()', msg);
  };

  /*
    Parameter validation (see tests)
  */
  if (arguments.length > 3) error$$1('Only 3 arguments allowed, ' + arguments.length + ' given: \n ' + _JSON$stringify(arguments, null, 2));

  // Check subscription
  if (!isString(subscription)) error$$1('"subscription" (first argument) needs to be a string, got ' + getType(subscription) + ' instead: \n ' + _JSON$stringify(arguments, null, 2));

  if (!isSet(subscription) || isEmptyString(subscription)) error$$1('"subscription" (first argument) cannot be null, empty, or undefined: \n ' + _JSON$stringify(arguments, null, 2));

  // Check changeCallback
  if (!isFunction(changeCallback)) error$$1('"changeCallback" (second argument) needs to be a function, got ' + getType(changeCallback) + ' instead: \n ' + _JSON$stringify(arguments, null, 2));

  if (!isSet(changeCallback)) error$$1('"changeCallback" (second argument) cannot be null or undefined: \n ' + _JSON$stringify(arguments, null, 2));

  // Check (optional) store instance
  if (storeArg && !isSlimReduxStore(storeArg)) error$$1('"storeArg" (third argument) is optional, but has to be a slim-redux store instance if provided: \n' + _JSON$stringify(arguments, null, 2));

  var store = storeArg || window.store;

  if (!store) error$$1('No store instance provided in global and local scope! In case you set "disableGlobalStore" when creating slim-redux store, make sure to pass it in as the last argument!\n ' + _JSON$stringify(arguments, null, 2));

  if (!isSlimReduxStore(store)) error$$1('Store instance provided is not a slim-redux store! \n ' + _JSON$stringify(arguments, null, 2));

  // check subscription string
  if (!isSubscriptionStrValid(subscription, store.getState())) error$$1('Cannot find subscription path \'' + subscription + '\'  in state. Remember: Subscription strings have to be of the form: "state.todos.filter". \n ' + _JSON$stringify(store.getState(), null, 2));

  /*
    Implementation
  */

  // Step #1: Create a notifying selector out of a function we build using the subscription string
  var getStateFunctionString = 'state => ' + subscription,
      // Syntax for a function: state => subscription-string part of state
  getStateFunction = eval(getStateFunctionString),
      // Turn the string from step one into an actual function
  checkSubscriptionSelector = createNotifyingSelector( // Create subscrption selector using the function we just created
  getStateFunction, function (data) {
    return data;
  });

  // Initial firing - initially of course the state has changed!
  checkSubscriptionSelector(store.getState());

  // Step #2: Subscribe to state changes (native redux API function), but only trigger changeTrigger() when our subscription has changed
  var unsubscribe = store.subscribe(function () {
    var subscriptionState = checkSubscriptionSelector(store.getState());

    if (subscriptionState.hasChanged) changeCallback(subscriptionState.data, store.getState());
  });

  // Step #3: Create getter for subscription value / unsubscribe function
  var getStateOrUnsubscribe = function getStateOrUnsubscribe(instruction) {
    if (instruction === CANCEL_SUBSCRIPTION) unsubscribe();else return checkSubscriptionSelector(store.getState()).data; // Returns the subscription value
  };

  // All done!
  return getStateOrUnsubscribe;
}

exports.createSlimReduxStore = createSlimReduxStore;
exports.changeTrigger = changeTrigger;
exports.asyncChangeTrigger = asyncChangeTrigger;
exports.calculation = calculation;
exports.subscription = subscription;
exports.CANCEL_SUBSCRIPTION = CANCEL_SUBSCRIPTION;
//# sourceMappingURL=index.js.map
