slim-redux
==========
[*Jump to Table of Contents*](#toc)  
slim-redux is an alternative way of working with redux that aims at being less boilerplate-heavy, faster to code, and easier to reason about than your typical redux-setups while being 100% redux compatible.

The core idea is that action and reducer definitions are defined in one place. **Triggering store changes is now a simple two step process**:

### Step #1: Create a change trigger  
*(aka register an Action + Reducer)*  

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

### Step #2: Trigger a change in the store
*(aka dispatch an action)*  

```javascript
addTodo({id: 2, text: 'GET MILK', checked: false});
```

This will trigger a [FSA](https://github.com/acdlite/flux-standard-action) compliant action to the reducers:  
``` javascript
{type: 'ADD_TODO', payload: {id: 2, text: 'GET MILK', checked: false}}
```
Which will be picked up by the reducer we defined in `store.createChangeTrigger({...})` and all other reducers reacting to this action type.    

That was pretty painless right? :)  

### Bonus points: Payload validation  
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

# <a name="toc"></a>Table of Contents
* [Quick start](#quick-start)
* [Motivation](#motivation)
* [API Reference](#api-reference)
* [Recipes](#recipes)
  * [Bundle change trigger definitions in one file](#bundle-change-definitions)
  * [Namespace change trigger definitions](#namespace-change-triggers)
  * [Use slim-redux in an existing redux setup](#existing-redux-setup)
  * [Use payload validation](#use-payload-validation)
  * [Build custom middleware to catch payload validation errors](#middleware-validation-errors)
* [Examples](#examples)
* [React Bindings](#react-bindings)
* [Future Development](#future-development)
* [Contribute](#contribute)
* [Feedback](#feedback)
* [License](#license)

____

## <a name="quick-start"></a>Quick Start
Start by adding slim-redux to your project: `npm install --save slim-redux`.

```javascript
/*
  The most basic example of using slim-redux - using createChangeTrigger() statements to register
  an action and its corresponding action in one call.
*/

import { createSlimReduxStore } from 'slim-redux';

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

<br><br>
[^ Table of Contents ^](#toc)

## <a name="motivation"></a>Motivation
Time for a possibly somewhat embarrassing truth: The decoupled nature of typical redux setups confuses the hell out of me.  

The simple act of adding an item to a todo list in the official [TodoMVC example](https://github.com/reactjs/redux/tree/master/examples/todomvc) relies on five different files (action constants, action creator, reducer, root reducer, react-redux connect).  

While decoupling usually is the best weapon for tackling complexity, with redux (and react-redux) it always confused me that there is so much overhead for ultimately making an object change (the reducer) with a name on it (the `ADD_TODO` action).

So the goal was to create something that is 100% redux compatible, and seemlessly fits into existing redux setups, to help teams work more efficiently with redux while not having to refactor their entire state management system.  

I also created react bindings which work with change triggers and subscriptions (powered by [reselect](https://github.com/reactjs/reselect)) for accessing the state.  

Go check them out: [slim-redux-react](https://github.com/aGuyNamedJonas/slim-redux-react).

<br><br>
[^ Table of Contents ^](#toc)

## <a name="api-reference"></a>API Reference
### createSlimReduxStore(initialState, [existingRootReducer], [enhancer])
Creates and returns a redux store which is a regular redux store with the slim-redux
functionality (the `store.createChangeTrigger()` function + some internal stuff) injected.

Since all the slim-redux functionality is directly injected into the store instance,
slim-redux is suitable for server side rendering:
http://redux.js.org/docs/recipes/ServerRendering.html

**Parameters:**
- *initialState*: The initial state of the redux store.
- *existingRootReducer (optional)*: Root reducer of already existing redux setup
- *enhancer (optional)*: Your regular middleware magic that you would normally pass to createStore() (in redux)

**Returns:** A fresh store with some slim-redux functionality injected (mainly: `store.createChangeTrigger()`)

**Example:**  
```javascript
import { createSlimReduxStore } from 'slim-redux';

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
For more advanced use of `createSlimReduxStore()` have a look at the recipes: [Recipes](#recipes).

### store.createChangeTrigger(parameters)
Creates a change trigger for the given parameters object. This function is
injected into the store instance through `createSlimReduxStore()`, so please use this
by calling `store.createChangeTrigger()`.

Returns a change trigger function which takes an object (= action payload) and will
run the `payloadValidation` function (if provided) before dispatching and action to
reducers (if validation passed) or an error action (if validation failed).

The action trigger function when called will return an object specifying the validation results:  
`{type: 'accept'}` if validation has passed or no payload validation was provided,  
`{type: 'reject', payload: {...}}` if validation failed (payload is additional error information).

**Parameters:**
- *parameters.actionType*: The type of action this change trigger function will dispatch (e.g. 'ADD_TODO')
- *parameters.reducer*: The reducer to process action of this action type (can also be from external redux code). Signature: (state, payload, [action]) --> new state
- *parameters.payloadValidation (optional)*: A callback function with the signature ({payload}, accept, reject) --> return reject({error payload}) / return accept() (see examples!)

**Returns:** A change trigger function with the signature ({actionPayload}) --> {type: 'accept'} / {type: 'reject', payload: {...}}

**Example:**  
```javascript
import { createSlimReduxStore } from 'slim-redux';

// Create a store with initial state
var store = createSlimReduxStore(0);

// Make sure we see any store changes in the console
store.subscribe(() =>
  console.log(store.getState())
)

// create the change trigger for the action type 'INCREMENT'
const increment = store.createChangeTrigger({
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
});

// Trigger a store-change - that is: Dispatch the action:
// {type: 'INCREMENT', payload: {value: 10}}
increment({value: 10});
increment({value: 23});
```

For an example of using `payloadValidation` in `createChangeTrigger()` have a look at the recipes: [Recipes](#recipes).

<br><br>
[^ Table of Contents ^](#toc)

## <a name="recipes"></a>Recipes
This section features ideas on how to solve certain challenges when working with slim-redux as well as a few suggestions on how to make the most of slim-redux.

### <a name="bundle-change-definitions"></a>Bundle change trigger definitions in one file
When working with regular redux projects, you will most likely bundle certain parts of your business logic with the help of a combined root reducer.  

Since slim-redux makes the actual reducer transparent to you however, an alternative way of grouping business logic is probably needed.

And while what I'm about to show you be obvious, I still want to explicitly point out this pattern as a way to bundle business logic:

**Example:**  
```javascript
// counterChangeTriggers.js
export const increment = {
  actionType: 'INCREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
}

export const decrement = {
  actionType: 'DECREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  }
}

//------------------------------------------------
// index.js
import { createSlimReduxStore } from 'slim-redux';
import { increment, decrement } from './counterChangeTriggers';

var store = createSlimReduxStore(0);

// Make sure we see any store changes in the console
store.subscribe(() =>
  console.log(store.getState())
)

var doIncrement = store.createChangeTrigger(increment);
var doDecrement = store.createChangeTrigger(decrement);

doIncrement({value: 10});
doIncrement({value: 23});

doDecrement({value: 31});
doDecrement({value: 11});
```
The reason why this works is that `createChangeTrigger()` takes a singular object as an argument. I almost feel stupid for having included this as a recipe, but I wanted to point this out- you probably already did it like that automatically. I'll show myself out now :D  

See this example in its full glory [here](./examples/bundled-change-trigger-definitions).


<br><br>
[^ Table of Contents ^](#toc)

### <a name="namespace-change-triggers"></a>Namespace change trigger definitions
When building bigger projects, this recipe might be a good idea for you.

Usually when working with react-redux, the separation of your business logic into separate, autonomous modules is achieved through merging your reducers with `combineReducers()`.  

Since slim-redux doesn't explicitly work with reducers like that (you define the code that will act as a reducer, but in the background it's applied by an internal reducer) bigger projects might run into problems with accidentally identical action types when registering change triggers.  

To get around issues like that one idea might be to namespace your actions. If you bundle your related change trigger definitions in one file, namespacing actions easily be achieved with the help of template strings:  

```javascript
// Let's assume this is the file where you keep all your counter-related change
// trigger definitions
const namespace = 'COUNTER_';

export const increment = {
  actionType: `${namespace}INCREMENT`,
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state + value;
  }
}

export const decrement = {
  actionType: `${namespace}DECREMENT`,
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  }
}
```
With this little trick you can prevent two issues from arising:  

**Prevented issue #1:** Regular redux code accidentally triggering one of these reducers (the reducers you define in your change triggers listen to that action type - regardless of whether a change trigger emitted it or other redux code)  

**Prevented issue #2:** slim-redux change triggers with accidentally identical actionTypes overwriting each other (the internal reducer in slim-redux just registers the reducers under the actionType you give them. Whenever you call `createChangeTrigger()` the reducer + payload validation for that actionType will be overwritten if they already existed)

<br><br>
[^ Table of Contents ^](#toc)

### <a name="existing-redux-setup"></a>Use slim-redux in an existing redux setup
*(this was copy'n'pasted from the [slim-redux-react](https://github.com/aGuyNamedJonas/slim-redux-react) README)*  
Glad you came here to this very recipe: This is the gospel - the good message - of slim-redux & slim-redux-react: You can use it **alongside your existing redux projects!**  

If you already have a root reducer in place, just pass it into `createSlimReduxStore()`:
```javascript
const store = createSlimReduxStore(initialState, yourAlreadyExistingRootReducer)
```
slim-redux takes care of merging your already existing root reducer together with the internal slim-redux reducer.  

**Got middleware?** Well guess what....  
```javascript
const store = createSlimReduxStore(initialState, yourAlreadyExistingRootReducer, yourAlreadyExistingMiddleware)
```

That's how easy it is :) You can actually see that middleware part in action here: [Including the redux devtools browser extension in the counter example (slim-redux-react)](https://github.com/aGuyNamedJonas/slim-redux-react/blob/master/examples/counter/src/index.js#L8)

Also make sure to check out the `createSlimReduxStore()` [API reference](https://github.com/aGuyNamedJonas/slim-redux#createslimreduxstoreinitialstate-existingrootreducer-enhancer).

<br><br>
[^ Table of Contents ^](#toc)

### <a name="use-payload-validation"></a>Use payload validation
Payload validation might be hands-down one of the coolest features of slim-redux. In redux you would probably usually want to validate the parameters of your actions in your action creators. But then when you want to dispatch an [error action](https://github.com/acdlite/flux-standard-action#example) you will need middleware again that provides your action creators with the ability to dispatch error actions.  

In slim-redux payload validation for your actions is a first-class citizen:
```javascript
var decrement = store.createChangeTrigger({
  actionType: 'DECREMENT',
  reducer: (state, payload, action) => {
    const value = payload.value || 1;
    return state - value;
  },

  // Payload validation - notice how it returns either reject() with a message or
  // accept() to let slim-redux know whether the validation passed or not.
  payloadValidation: (payload, accept, reject) => {
    if(!payload || !payload.value)
      return reject({
        msg: 'No parameters given or no "value" attribute in parameters provided!',
        params: payload
      });
    else
      return accept();
  }
});
```

The way payload validation works is that after you call a change trigger function with some values (e.g. `decrement({value: 10})`) the `payloadValidation()` function is called. If the validation is successful, the action gets passed to the reducers.  

If validation fails however, a [FSA compliant error action](https://github.com/acdlite/flux-standard-action#example) is dispatched:  

```javascript
decrement({thisIsAnInvalid: 'payload'})

/*
  This will trigger the following (error) action which will not lead to any state changes in the slim-redux reducer:

  {
    type: 'DECREMENT',
    error: true,
    payload: {
      "msg": "No parameters given or no \"value\" attribute in parameters provided!",
      "params": {
        "thisIsAnInvalid": "payload"
      }
    }
  }
*/
```
Neat huh? :) I love this feature, hoping you also dig it!  
Make sure to check out the example that I took this code from: [payload-validation example](./examples/payload-validation/).

*Make sure to read on to the next recipe to find out how you can react to payload validation errors.*

<br><br>
[^ Table of Contents ^](#toc)


### <a name="middleware-validation-errors"></a>Build custom middleware to catch payload validation errors
As discussed in the previous section, payload validation is a built-in, first-class citizen in slim-redux. What's not included right now is a way to register a function handling all payload validation errors.  

Centralized payload validation error handling is on the roadmap for [future development](#future-development), but for now you can already get that by writing a small piece of middleware:

```javascript
// Middleware that catches payload validation errors
// Go ahead and give it a nicer name if you like :)
const payloadValidationErrorCatcher = store => next => action => {
  if(action.error)
    console.error(`*** Error while trying to dispatch ${action.type}:\n${JSON.stringify(action.payload, null, 2)}`)

  let result = next(action)
  return result
}

// Include the middleware in your slim-redux setup
var store = createSlimReduxStore(0, null, applyMiddleware(payloadValidationErrorCatcher));
```


Now when calling a change trigger which fails the payload validation and emits an error action, you will see something like the following in your console:
```
*** Error while trying to dispatch DECREMENT:
{
  "msg": "No parameters given or no \"value\" attribute in parameters provided!",
  "params": {
    "thisIsAnInvalid": "payload"
  }
}
```
Check out the full example that this snippet was taken from: [payload-validation example](./examples/payload-validation/).  

If you want to change your store according to a payload validation error occuring, you could either `dispatch()` and action from within the middleware (not recommended) or better yet: Just use a change trigger!  

Read more [on middleware in the redux docs](http://redux.js.org/docs/api/applyMiddleware.html#applymiddlewaremiddleware) to find out more about the capabilities of middleware.

<br><br>
[^ Table of Contents ^](#toc)


## <a name="examples"></a>Examples
#### 🢂 [Examples folder](./examples/README.md)

<br><br>
[^ Table of Contents ^](#toc)

## <a name="react-bindings"></a>React Bindings
Yes, there are react bindings- and they were written with the same intentions as slim-redux (less boilerplate, fast to use, easy to reason about):

### 🢂 [slim-redux-react](https://github.com/aGuyNamedJonas/slim-redux-react)

<br><br>
[^ Table of Contents ^](#toc)

## <a name="future-development"></a>Future Development
Don't know yet what will be needed in the future (since we just started out) but I already have some ideas:
- [ ] Test coverage
- [ ] Centralized payload validation (will be passed to `createSlimReduxStore()`)
- [ ] Centralized error handling for dealing with failed payload validations and other error actions (will also be passed to `createSlimReduxStore()`)

This list will be extended, as [feedback](#feedback) comes in!

## <a name="contribute"></a>Contribute
Want to contribute something to this project? AWESOME! Just open up a pull request or an issue and then let's figure out together whether or not it makes sense to add it to the project!

## <a name="feedback"></a>Feedback
Got a question, feedback, improvement suggestion, found a bug, wanna share a cool idea?  
[Create an issue](https://github.com/aGuyNamedJonas/slim-redux/issues/new)

**- OR -**

[Get in touch on twitter](https://twitter.com/intent/tweet?screen_name=aGuyNamedJonas&text=%23slim-redux%20)  

[(Optional) follow me on twitter (@aGuyNamedJonas)](https://twitter.com/aGuyNamedJonas)

## <a name="license"></a>License
MIT

[^ Table of Contents ^](#toc)
