#slim-redux API v0.2
### createSlimReduxStore(initialState, options)
**Description:** Creates and initializes the slim-redux store which is actually a redux store injected with some slim-redux functionality. This also automatically saves the store instance in the global scope, so that change triggers have access to it. You can enable this in the options.

**Parameters:**
- `initialState`: The initial state of the store
- `options`: Object with the following (all optional!) options
  - `rootReducer: (default=dummyReducer)` Existing root reducer, in case slim-redux is used alongside an existing redux setup. Again: This is optional, slim-redux has an internal reducer, you don't need to define any reducer to use slim-redux. This is just to be compatible with your existing redux setup.
  - `middleware: (default=undefined)` Middleware you might want to install (like the redux devtools browser extension)
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
The change trigger when called will return the action that was dispatched by the change trigger.

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
**Description:** Change triggers are always synchronous, as is the norm in redux (store.dispatch() and the reducers are actually synchronous). To allow for asynchronous code to take care of state changes, in slim-redux asyncChangeTrigger() is provided. The name might be slightly confusing at first, but the idea is that your async code gets provided with change triggers (synchronous) which you can call out of your async callbacks / promises etc. Async change triggers are of course not guaranteed to actually make a state change, but when they do, it's through a regular, synchronous change trigger.  
Note that this does not have an action type, as only change triggers have an action type. This is to make sure that whenever you see an action in your redux devtools, they actually represent a state change, not any pseudo actions that are only there to trigger async code.

**Parameters:**  
* `changeTriggers`: Object which contains all the change triggers that this async change trigger needs. Can be regular change triggers or async change triggers. Object keys are the names under which the change triggers will be available inside the `triggerFunction`, the value are the change triggers themselves. It's recommended to use the ES6 shorthand - **Example**:   
`export const addTodoServerSync = asynChangeTrigger({ addTodo, addTodoSuccess, addTodoFailed }, (name) => { /* ... */ })`
* `triggerFunction`: A function which receives all the parameters that this async change trigger needs, and will have access to the state and to the change triggers from the first argument. This is called the trigger function, because unlike in the `changeTrigger()` API call, this function is not a reducer. The only way for it to change state is to invoke change triggers. **The signature of this function can be empty!**
* `(optional) Object with store instance in it` In case you set the `disableGlobalStore=true` option when you invoked `createSlimReduxStore()` you have to pass the store instance to your change triggers manually. When you pass this in for asyncChangeTrigger it will automatically be set for the change triggers called from within.

**Returns:**  
A change trigger function which can be called, passing in the parameters that the `triggerFunction` expects. When calling the trigger function, it will return a promise (since hoChangeTrigger are rather asynchronous in nature) which contains all the actions dispatched and access to the state.

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

### subscription(subscriptionString, changeCallback, [{store: storeInstance}])  
**Description:** Function which lets you react to state changing in very specific areas (so whatever you subscribed to). The changeCallback is called anytime the subscribed to part of the state changes, and will receive the subscribed to value and the state as arguments.  
This API function is only neccessary when exclusively working with slim-redux. In slim-redux-react, this function is used internally to provide subscriptions.

**Prameters:**  
* `subscriptionString`: String which addresses (a part of) the state tree. For example: `state.todos.filter`.
* `changeCallback`: This is called anytime the subscribed-to part of the state changes. The callback will receive the subscribed to part of the state and the state itself as arguments.
* `(optional) storeInstance`: With this parameter you can specify which store instance to register this calculation with. Default is the global instance.

**Returns:**  
True, if subscription was successfully created, throws exception when the subscription string did not match anything in the state or a store instance could not be found.

### calculation(calcFunction, subscriptionMap, [changeCallback], [{store: storeInstance}])
**Description:** Calculations are a great way to compute derived values off of the state. calculation() returns the computed value and internally uses redux-reselect, so the value you get might be cached which makes this efficient.  
Also you can pass in a callback into calculation() which gets invoked AFTER any of the subscribed-to values has changed and the new result has been computed. Like that this is a powerful way to react to state changes in a very specific and granular way.

**Parameters:**  
* `calcFunction`: Function which takes the subscriptions as an argument and then returns a calculated value off of these subscriptions. Anytime any of these subscriptions change, the `calcFunction` is re-invoked.
* `subscriptionMap`: An object mapping a part of the state to values that will be passed in to the `calcFunction` as arguments.
* `changeCallback`: Optional callback which is called whenever the calculation was retriggered. Function receives whatever the calculation returns as arguments and the state as the last argument
* `(optional) storeInstance`: With this parameter you can specify which store instance to register this calculation with. Default is the global instance.

**Returns:**  
The calculated value. As this is based on redux-reselect, calling a calculation might very well return a cached result - it does not recalculate if it doesn't have to. Like that this is also a very efficient way to access computed values that are derived from the state. Throws error whenever one of the subscriptions could not be found inside the state.

**Example:**  
```javascript
import { calculation } from 'slim-redux';

const todos = 'state.todos';
const filter = 'state.todos.visbilityFilter';

export const visibleTodos = calculation((todos, filter) => (
  todos.filter(todo => (
    filter === 'all' ||
    filter === 'open' && !todo.checked ||
    filter === 'done' && todo.checked
  ));
), { todos, filter });
```

### store.registerChangeTrigger()
**(BREAKING CHANGE - not part of the API anymore!)** It's no longer neccessary to register change triggers before using them. We might deliver a middleware in the future which would have a similiar functionality to `registerChangeTrigger()` in that it would allow users to have change triggers handle actions dispatched from outside of slim-redux.

That's probably not very much needed though, as slim-redux allows you to use it alongside existing redux setups, and as long as those can work next to each other and don't have to work *with* each other, the exisiting slim-redux API should serve you great!
