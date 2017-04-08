slim-redux
==========
slim-redux is an alternative way of working with redux that focuses on being less decoupled, faster to use, and easier to reason about than your typical redux-setups while being 100% redux compatible.

The core idea is that action and reducer definitions are defined in one place. Triggering store changes is now a simple two step process:

**Step #1: Create a change trigger** (aka register an Action + Reducer)  
```javascript
const addTodo = store.createChangeTrigger({
  actionType: 'ADD_TODO',
  reducer: (state, payload, action) => {
    return {
      ...state,
      todos: [
        ...state.todos,
        {id: payload.id, text: payload.text, checked: false}
      ]
    }
  }
});
```

**Step #2: Trigger a change in the store** (aka dispatch an action)  
```javascript
addTodo({id: 2, text: 'GET MILK', checked: false});
```

This will trigger a [FSA](https://github.com/acdlite/flux-standard-action) compliant action to the reducers:  
``` javascript
{type: 'ADD_TODO', payload: {id: 2, text: 'GET MILK', checked: false}}
```
Which will be picked up by the reducer we defined in `store.createChangeTrigger({...})` and all other reducers reacting to this action type.    

That was pretty painless right? :)  

**Bonus points: Payload validation**  
```javascript
const addTodo = store.createChangeTrigger({
  actionType: /* ... */,
  reducer: /* ... */,
  payloadValidation: (payload, accept, reject) => {
    if(!payload || !payload.id || !payload.text)
      return reject({
        msg: 'Not all parameters provided for ADD_TODO!',
        params: payload
      });
    else
      return accept();
  }  
});
```
slim-redux allows you to provide a payload validation function when registering a change trigger.  

Anytime you call a change trigger with a payload validation, the validation gets run and if successful will dispatch the desired action as usual.

If the payload validation fails however, a [FSA](https://github.com/acdlite/flux-standard-action) compliant error action is dispatched instead:

``` javascript
{type: 'ADD_TODO', error: true, payload: {
  msg: 'Not all parameters provided for ADD_TODO!',
  params: {text: 'Random new todo'} //Notice how the id is missing in the payload!
}}
```
In the future, there will also be a way to react to error actions directly from within slim-redux, see [Future Development](#future-development).
____

# Table of Contents
* [Quick start](#quick-start)
* [Motivation](#motivation)
* [API Reference](#api-reference)
* [Recipes](#recipes)
  * Bundle change trigger definitions in one file
  * Use slim-redux in an existing redux setup  
  * Use payload validation
  * Register middleware in slim-redux
  * Build custom middleware to catch payload validation errors
  * Build centralized payload validation
* [Examples](#examples)
* [React Bindings](#react-bindings)
* [Feedback](#feedback)
* [Future Development](#future-development)
* [License](#license)

____

## <a name="quick-start"></a>Quick Start
Start by adding slim-redux to your project: `npm install --save slim-redux`.

```javascript
/*
  The most basic example of using slim-redux - using createChangeTrigger() statements to register
  an action and its corresponding action in one call.
*/

import { createSlimReduxStore } from './src/index';

// Create a store with initial state
var store = createSlimReduxStore(0);

// Make sure we see any store changes in the console
store.subscribe(() =>
  console.log(store.getState())
)

// Register a change with the actionType 'INCREMENT' and the appropriate reducer.
// This returns a change-trigger function (see below)
const increment = store.createChangeTrigger({
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
});

// Note that the hereby registered reducer would also process 'DECREMENT' actions
// from the rest of your redux code.
const decrement = store.createChangeTrigger({
  actionType: 'DECREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  }
});

// Trigger a store-change - that is: Dispatch the action:
// {type: 'INCREMENT', payload: {value: 10}}
increment({value: 10});
increment({value: 23});

decrement({value: 31});
decrement({value: 11});

```

Simple, ey? For more advanced stuff, see the [Examples](#examples) and the [Recipes](#recipes) and make sure to check out the [API Reference](#api-reference).

## <a name="motivation"></a>Motivation
Time for a possibly somewhat embarrassing truth: The decoupled nature of typical redux setups confuses the hell out of me.  

The simple act of adding an item to a todo list in the official [TodoMVC example](https://github.com/reactjs/redux/tree/master/examples/todomvc) relies on five different files (action constants, action creator, reducer, root reducer, react-redux connect).  

While decoupling usually is the best weapon for tackling complexity, with redux (and react-redux) it always confused me that there is so much overhead for ultimately making an object change (= the reducer) with a name on it (= the `ADD_TODO` action).

So the goal was to create something that is 100% redux compatible, and seemlessly fits into existing redux setups, to help teams work more efficiently with redux while not having to refactor their entire state management system.  

I also created react bindings which work with change triggers (= this library) and subscriptions for accessing the state (= powered by `reselect`).  

Go check them out: [slim-redux-react](https://github.com/aGuyNamedJonas/slim-redux-react).

## <a name="api-reference"></a>API Reference
### createSlimReduxStore(initialState, [existingRootReducer], [enhancer])
Creates and returns a redux store which is a regular redux store with the slim-redux
functionality (the `store.createChangeTrigger()` function + some internal stuff) injected.

Since all the slim-redux functionality is directly injected into the store instance,
slim-redux is suitable for server side rendering:
http://redux.js.org/docs/recipes/ServerRendering.html

**Parameters:**
- initialState: The initial state of the redux store.
- existingRootReducer (optional): Root reducer of already existing redux setup
- enhancer (optional): Your regular middleware magic that you would normally pass to createStore() (in redux)

**Returns:** A fresh store with some slim-redux functionality injected (mainly: `store.createChangeTrigger()`)

**Example:**  
```javascript
import { createSlimReduxStore } from './src/index';

// Create a store with initial counter state = 0
// This automatically injects the create slim-redux reducer and exposes store.createChangeTrigger()
var store = createSlimReduxStore(0);

// store is a regular redux store with slim-redux, you can subscribe to it like to a regular redux store:
store.subscribe(() =>
  console.log(store.getState())
)

// With slim-redux initialized you can then go ahead and register change triggers...
const increment = store.createChangeTrigger({/* ... */});

// And use them to make state modifications
increment({value: 10});
```

## <a name="recipes"></a>Recipes
## <a name="examples"></a>Examples
## <a name="react-bindings"></a>React Bindings
## <a name="feedback"></a>Feedback
## <a name="future-development"></a>Future Development
## <a name="license"></a>License
MIT (just like redux)
