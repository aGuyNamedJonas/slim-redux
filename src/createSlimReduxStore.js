import { createStore } from 'redux';
import { error as _err, getType, isObject, isFunction, isBoolean } from './util';
import reduceReducers from 'reduce-reducers';

export function createSlimReduxStore(initialState, options) {
  const error = msg => _err('createSlimReduxStore()', msg);
  global.window = global;

  /*
    Set default values
  */
  const defaultReducer        = state => state,
        registerChangeTrigger = () => { error(`It's not neccessary anymore to register change triggers. Please see https://github.com/aGuyNamedJonas/slim-redux/blob/master/README.md#api-reference for details.`) };

  // Default values
  var rootReducer = defaultReducer,
      middleware  = undefined,
      slimReduxOptions = {
        disableActionDispatch : false,
        disableGlobalStore    : false,
      },
      slimReduxChangeTriggers = {};

  /*
    Check input parameters, this puppy should be fool proof :)
  */
  if(arguments.length > 2)
    error(`Only 2 arguments allowed, ${arguments.length} given: \n ${JSON.stringify(arguments, null, 2)}`);

  if(initialState === undefined || initialState === null)
    error(`initialState (first argument) cannot be null or undefined, got: ${initialState}`);

  // Check the options argument
  if(options !== undefined){
    // Check whether it's an object
    if(!isObject(options))
      error(`options (second argument) needs to be an object. Instead got argument of type: ${getType(options)}`)

    // Check option names and their values
    const optionKeys = Object.keys(options);

    for(var i=0; i<optionKeys.length; i++){
      let name = optionKeys[i];
      let option = options[name];

      switch(name){
        case 'rootReducer':
          if(!isFunction(option))
            error(`The value for the "rootReducer" option needs to be of Type "Function", got ${getType(option)}`)
          else
            rootReducer = options.rootReducer;
          break;

        case 'middleware':
          if(!isFunction(option))
            error(`The value for the "middleware" option needs to be of Type "Function", got ${getType(option)}`)
          else
            middleware = options.middleware;
          break;

        case 'disableActionDispatch':
          if(!isBoolean(option))
            error(`The value for the "disableActionDispatch" option needs to be of Type "Boolean", got ${getType(option)}`)
          else
            slimReduxOptions.disableActionDispatch = options.disableActionDispatch;
          break;

        case 'disableGlobalStore':
          if(!isBoolean(option))
            error(`The value for the "disableGlobalStore" option needs to be of Type "Boolean", got ${getType(option)}`)
          else
            slimReduxOptions.disableGlobalStore = options.disableGlobalStore;
          break;

        default:
          error(`Unknown option: "${name}"`);
      }
    }
  }

  /*
    Create the redux store, inject the slim-redux reducer and the slim-redux functionality into it
  */
  var store = createStore(rootReducer, initialState, middleware);

  // Inject all the good stuff into the store
  store.registerChangeTrigger   = registerChangeTrigger;
  store.slimReduxOptions        = slimReduxOptions;
  store.slimReduxChangeTriggers = slimReduxChangeTriggers;

  /*
    Setup internal slim-redux reducer
  */
  function slimReduxReducer(state, action){
    const actionType = action.type,
          payload    = action.payload,
          reducer    = (this.slimReduxChangeTriggers[actionType] ? this.slimReduxChangeTriggers[actionType] : null);

    if(reducer)
      return reducer(...payload, state);
    else
      return state;

  }

  // Inject internal reducer
  const enhancedRootReducer = reduceReducers(rootReducer, slimReduxReducer.bind(store));
  store.replaceReducer(enhancedRootReducer);

  // Register store instance in global namespace if not turned off
  if(!slimReduxOptions.disableGlobalStore)
    window.store = store;

  return store;
}
