slim-redux
==========

slim-redux is an alternative interface for redux which aims at making working with redux less decoupled and a lot faster while being 100% redux compatible.  

The complete redux compatability is important as one of the design goals of `slim-redux` was to improve the redux experience for teams without forcing them to refactor their state-management code or change their redux setups dramatically.

### Feedback wanted
I sincerely hope that `slim-redux` can help improve your working experience with redux.  
To further improve `slim-redux` please let me know if you have any questions / suggestions / frustrations by opening an issue or getting in touch on twitter [@aGuyNamedJonas](https://twitter.com/aguynamedjonas)

**React bindings are in the works :)**

# Motivation
Redux is awesome but the decoupled nature of defining actions and reducers can have its challenges.
`slim-redux` attempts to simplify working with redux by coupling action and reducer definitions in singular `change` statements:

```javascript
const addTodo = change({
  actionType: 'ADD_TODO',
  reducer: (state, payload, action) => {
    return [...state, {id: payload.id, label: payload.label, checked: false}];
  },
});
```

`change()` returns a *change trigger function* (it will trigger a change in the store) which takes a single *payload* parameter and will dispatch the *ADD_TODO* action when called:
```javascript
addTodo({id: 2, label: 'CHANGE THE WORLD'});
// will dispatch the following FSA (flux standard action) compliant action to the reducer:
// {type: 'ADD_TODO', payload: {id: 2, label: 'CHANGE THE WORLD'}}
```  

In our example the reducer that we defined in the `change()` statement will process the `ADD_TODO` action, but note that the `ADD_TODO` action could also have been triggered by regular redux code.
`change()` returns an *change trigger function* (which is an action creator function which automatically dispatches the created action) and processes the registered action like a regular reducer.

`slim-redux` indeed is 100% redux-compatible.

# Installation
`npm install --save slim-redux`

# Getting started
```javascript
import { createStore } from 'redux';
import { createSlimReduxReducer, initSlimRedux } from 'slim-redux';

// createSlimReduxReducer([initialState]) returns the slim-redux reducer.
// If you have a rootReducer, make sure to add the slim-redux reducer there!
var store = createStore(createSlimReduxReducer(0));

// Add the change() function to the store
initSlimRedux(store);

// Make sure we see any store changes in the console
store.subscribe(() =>
  console.log(store.getState())
)

// Register a change with the actionType 'INCREMENT' and the appropriate reducer.
// This returns a change-trigger function (see below)
const increment = store.change({
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
});

// Note that the hereby registered reducer would also process 'DECREMENT' actions
// from the rest of your redux code.
const decrement = store.change({
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

This is the [simple.js example](./examples/simple.js).

# Examples
Instructions on how to install & run the examples: [Examples Readme](./examples/README.md)

# Advanced Topics
While the proposed `change()` function is the centerpiece of `slim-redux` there are two more concepts which I think could be useful when using `slim-redux`- this section gives a quick overview and points to the appropriate examples.

## Payload validation
To give the *change-trigger function* the possibility to check the passed in arguments before triggering an action in the store, an optional *inputValidation* function can be passed in the *change()* function.  
The *inputValidation* function can determine whether the action will be triggered or not:

```javascript
const incrementWithValidation = store.change({
  actionType: 'INCREMENT_WITH_VALIDATION',
  reducer: (state, payload) => {
    return state + payload.value;
  },
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
```

In case of an error in the *inputValidation* a FSA compliant error action is triggered which can be caught by middleware like [redux-catch](https://github.com/PlatziDev/redux-catch).

See the [validation example](./examples/validation.js).

## Anonymous changes
To make store changes even more accessible and simpler to trigger, when calling the `change()` function, the `actionType` parameter can be omitted. The only required parameter is the `reducer`:  
```javascript
const addTodoAnonymous = change({
  reducer: (state, payload, action) => {
    return [...state, {id: payload.id, label: payload.label, checked: false}];
  }
});
```javascript
Calling `addTodoAnonymous()` will now trigger an action of the type `__ANONYMOUS-CHANGE__`:
```javascript
addTodo({id: 2, label: 'CHANGE THE WORLD'});
// dispatches the following action:
// {type: '__ANONYMOUS-CHANGE__', payload: {id: 2, label: 'CHANGE THE WORLD'}}
```  

See the [anonymous example](./examples/anonymous.js).

## Building the npm module
In the root of the repository, after running `npm install`, run `npm run build` and then publish the npm module from inside the `/dist` folder.  

**Note to self**: Publish npm module by running `npm run build` and then in the `./dist` folder run `npm version patch` and then `npm publish` (after making sure I'm logged in with `npm login`)
