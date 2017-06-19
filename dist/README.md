slim-redux
==========

[![CircleCI Status](https://circleci.com/gh/aGuyNamedJonas/slim-redux.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/aGuyNamedJonas/slim-redux)

[*Jump to Table of Contents*](#toc)  

____

# <a name="toc"></a>Table of Contents
* [Quick start](#quick-start)
* [Motivation](#motivation)
* [API Reference](#api-reference)
* [Recipes](#recipes)
* [Examples](#examples)
* [React Bindings](#react-bindings)
* [Future Development](#future-development)
* [Contribute](#contribute)
* [Feedback](#feedback)
* [Change Log](#change-log)
* [License](#license)

____

## <a name="quick-start"></a>Quick Start


<br><br>
[^ Table of Contents ^](#toc)

## <a name="motivation"></a>Motivation


<br><br>
[^ Table of Contents ^](#toc)

## <a name="api-reference"></a>API Reference (API v. 0.2)
### createSlimReduxStore(initialState, options)
**Description:** Creates and initializes the slim-redux store which is actually a redux store injected with some slim-redux functionality. This also automatically saves the store instance in the global scope, so that change triggers have access to it. You can enable this in the options.

**Parameters:**
- `initialState`: The initial state of the store
- `options`: Object with the following (all optional!) options
  - `rootReducer: (default=dummyReducer)` Existing root reducer, in case slim-redux is used alongside an existing redux setup. Again: This is optional, slim-redux does not make use of root reducers.
  - `middleware: (default=undefined)` Middleware you might want to install (like the redux devtools browser extension)
  - `disableActionDispatch: (default=false)` When set to true, change triggers will not dispatch any actions, only apply their reducer function. This could be useful for production builds.
  - `disableGlobalStore: (default=false)` When set to true, the created store instance will not be saved in the global scope. This means that you will have to manually pass the store instance to change triggers when calling them. This might be useful for server side rendering or when testing etc.

**Returns:**  
Slim-redux store instance which is a redux store, injected with slim-redux functionality.

**Example:**  
```javascript
import { createSlimReduxStore } from 'slim-redux'

// Creating a slim-redux store with initial state and devtools installed
const store = createSlimReduxStore({todos:[]}, {
  middleware: window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
});
```

### changeTrigger(actionType, reducer, [{store: storeInstance}])
**Description:** Creates a side-effect free (pure) change trigger. Once a change trigger was created, it can be used directly by calling it as a function which will invoke the reducer function (and provide it access to the state) and then dispatch the action, to allow external code listening for the particular action type to react to it.

**Parameters:**  
* `actionType`: String which contains the action type of this change trigger. Note that calling a change trigger will first invoke the reducer function on the store, and then dispatch the action with this actionType, and the parameters of the change trigger call as the action payload. The dispatch of the action is so that you can continue using tools that help you debug your redux code. This behavior can be turned off for production builds though.
* `reducer`: Function which will be used to create the next version of the state when this change trigger is called. The parameters are whatever you want to pass in to your change trigger, but note that the state is already provided to the reducer function. **The signature of the reducer function can be empty!**
* `(optional) Object with store instance in it` In case you set the `disableGlobalStore=true` option when you invoked `createSlimReduxStore()` you have to pass the store instance to your change triggers manually.
**Example:** `addTodo('Get Milk', {store: storeInstance})`

**Returns:**  
Change trigger function that has the signature of the reducer function and when called will first invoke the reducer function on the store state and then dispatch the appropriate action.

**Example:**  
```javascript
// changes/todo.js
import { changeTrigger } from 'slim-redux';

export const addTodo = changeTrigger('ADD_TODO', (label) => {
  // Reducer function has access to the state
  const newId = state.todos.map((max, todo) => Math.max(max, todo,id), 0) + 1;
  return {
    ...state,
    todos: [
      ...state.todos,
      {id: newId, label: label, checked: false},
    ]
  };
});

// main.js
import { createSlimReduxStore } from 'slim-redux'
import { addTodo } from './changes/todo';

const store = createSlimReduxStore({todos:[]});

// Notice how we don't need to initialize anything anymore,
// we just call the change trigger to use it. The store is
// automatically placed in the global scope
addTodo('Get Milk');
```

**Note on implementation:** The optional store which can be passed in, is probably best implemented by setting `this.store` for the reducer function before invoking it. So the change trigger functions should be implemented in a way that they first check `this.store`, then `window.store` (on node.js we should just do `GLOBAL.window = GLOBAL` to be able to use the window object universally).

### asyncChangeTrigger(changeTriggers, triggerFunction, [{store: storeInstance}])
**Description:** Async change triggers allow you to execute network requests, or other asynchronous functions and then call change triggers whenever needed. This is to preserve the nature of change triggers which are supposed to be side-effect free actual state changes, but at the same time provides with a convenient way of dealing with async state changes.  
Note that this does not have an action type, as only change triggers have an action type. This is to make sure that whenever you see an action in your redux devtools, they actually represent a state change, not any pseudo actions that are only there to trigger async code.

**Parameters:**  
* `changeTriggers`: Object which contains all the change triggers that this async change trigger needs. Can be regular change triggers or async change triggers. Object keys are the names under which the change triggers will be available inside the `triggerFunction`, the value are the change triggers themselves. It's recommended to use the ES6 shorthand - **Example**:   
`export const addTodoServerSync = asynChangeTrigger({ addTodo, addTodoSuccess, addTodoFailed }, (name) => { /* ... */ })`
* `triggerFunction`: A function which receives all the parameters that this async change trigger needs, and will have access to the state and to the change triggers from the first argument. This is called the trigger function, because unlike in the `changeTrigger()` API call, this function is not a reducer. The only way for it to change state is to invoke change triggers. **The signature of this function can be empty!**
* `(optional) Object with store instance in it` In case you set the `disableGlobalStore=true` option when you invoked `createSlimReduxStore()` you have to pass the store instance to your change triggers manually. When you pass this in for asyncChangeTrigger it will automatically be set for the change triggers called from within.

**Returns:**  
A change trigger function which can be called, passing in the parameters that the `triggerFunction` expects. This is not checked of course, you would have to implement your own parameter validation if you need it.

**Example:**  
```javascript
// async/todo.js
import { asyncChangeTrigger } from 'slim-redux-react';
import { addTodo, addTodoSuccess } from '../changes/todo';

// First argument is a change trigger mapping like in slimReduxReact()
export const addTodoServerSync = asyncChangeTrigger({ addTodo, addTodoSuccess }, (name) => {
  // Notice how we have access to the state inside of the reducer function
  const newId = state.todos.filter((max, value) => Math.max(max, value), 0) + 1;

  // Call our first change trigger (also notice how change triggers now take arguments!)
  addTodo(newId, title);

  fetch(`/v1/todos`, {
    method: 'post',
    /* ... */
  ).then(data => {
    // Calling our second change trigger to confirm we added the task on the server
    addTodoConfirmed(newId);
  })
});

// main.js
import { createSlimReduxStore } from 'slim-redux'
import { addTodoServerSync } from './async/todo';

const store = createSlimReduxStore({todos:[]});

// Notice how we don't need any sort of registration here.
// We just call this asynchronous change trigger and pass it the name
// of our new todo. The rest is taken care of by the async change
// trigger and will lead to a new todo which is persitetd to the server
addTodoServerSync('Get Milk');
```

### store.registerChangeTrigger()
**(BREAKING CHANGE - not part of the API anymore!)** It's no longer neccessary to register change triggers before using them. We might deliver a middleware in the future which would have a similiar functionality to `registerChangeTrigger()` in that it would allow users to have change triggers handle actions dispatched from outside of slim-redux.

That's probably not very much needed though, as slim-redux allows you to use it alongside existing redux setups, and as long as those can work next to each other and don't have to work *with* each other, the exisiting slim-redux API should serve you great!

<br><br>
[^ Table of Contents ^](#toc)

## <a name="recipes"></a>Recipes


<br><br>
[^ Table of Contents ^](#toc)


## <a name="examples"></a>Examples
#### 🢂 [Examples folder](./examples)

<br><br>
[^ Table of Contents ^](#toc)

## <a name="react-bindings"></a>React Bindings
Yes, there are react bindings- and they were written with the same intentions as slim-redux (less boilerplate, fast to use, easy to reason about):

### 🢂 [slim-redux-react](https://github.com/aGuyNamedJonas/slim-redux-react)

<br><br>
[^ Table of Contents ^](#toc)

## <a name="future-development"></a>Future Development


## <a name="contribute"></a>Contribute
Want to contribute something to this project? AWESOME! Just open up a pull request or an issue and then let's figure out together whether or not it makes sense to add it to the project!

## <a name="feedback"></a>Feedback
Got a question, feedback, improvement suggestion, found a bug, wanna share a cool idea?  
[Create an issue](https://github.com/aGuyNamedJonas/slim-redux/issues/new)

**- OR -**

[Get in touch on twitter](https://twitter.com/intent/tweet?screen_name=aGuyNamedJonas&text=%23slim-redux%20)  

[(Optional) follow me on twitter (@aGuyNamedJonas)](https://twitter.com/aGuyNamedJonas)

## <a name="change-log"></a>Change Log
### 0.2 release (May 2017)
* createSlimReduxStore()
  * Now takes two arguments: Initial state (mandatory) and an options object (optional)
  * Arguments & options (keys & values) are extensively checked when calling this function to ensure correct use
  * Completely covered by unit tests, which were created before the implementation (TDD)
  * Puts the created store instance into global scope by default (window.store, sets global.window = global)
  * Does not create an internal reducer anymore, v0.2 of slim-redux is root-reducer free!

## <a name="license"></a>License
MIT

[^ Table of Contents ^](#toc)
