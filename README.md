slim-redux
==========

slim-redux is an alternative interface for redux which aims at making working with redux more concise while being 100% redux compatible.

# Motivation
Redux is awesome- the decoupled nature of defining actions and reducers can have its (challenges)[] though.
`slim-redux` attempts to simplify working with redux by coupling action and reducer definitions in singular `change` statements:

```
const addTodo = change({
  actionType: 'ADD_TODO',
  reducer: (state, payload, action) => {
    return [...state, {id: payload.id, label: payload.label, checked: false}];
  },
});
```

`change()` returns a *change-trigger function* (it will trigger a change in the store) which takes a single *payload* parameter and will dispatch the *ADD_TODO* action when called: 
```
addTodo({id: 2, label: 'CHANGE THE WORLD'});
// will dispatch the following FSA (flux standard action) compliant action to the reducer:
// {type: 'ADD_TODO', payload: {id: 2, label: 'CHANGE THE WORLD'}}
```  

In our example the reducer that we defined in the `change()` statement will process the `ADD_TODO` action, but note that the `ADD_TODO` action could also have been triggered by regular redux code.
`change()` returns an action creator function and processes the registered action like a regular reducer. `slim-redux` is 100% redux-compatible and adheres to the same (core principles)[] as redux.

Read more about the motivation and design goals of `slim-redux` in (this blog post)[].  

# Installation
*insert installation guide + instructions on rollup / ES2016 here*

# Getting started
*insert getting started code example here*

# Advanced
## Payload validation (not implemented yet)
To give the *change-trigger function* the possibility to check the passed in arguments before triggering an action in the store, an optional *inputValidation* function can be passed in the *change()* function. The *inputValidation* function can determine whether the action will be triggered or not.
In case of an error in the *inputValidation* a FSA compliant error action is triggered which can be caught by middleware like (redux-catch)[https://github.com/PlatziDev/redux-catch].

## Anonymous changes (not implemented yet)
To make store changes even more accessible and simpler to trigger, when calling the `change()` function, the `actionType` parameter can be omitted. The only required parameter is the `reducer`:  
```
const addTodoAnonymous = change({
  reducer: (state, payload, action) => {
    return [...state, {id: payload.id, label: payload.label, checked: false}];
  }
});
```
Calling `addTodoAnonymous()` will now trigger an action of the type `__ANONYMOUS-CHANGE__`:
```
addTodo({id: 2, label: 'CHANGE THE WORLD'});
// dispatches the following action:
// {type: '__ANONYMOUS-CHANGE__', payload: {id: 2, label: 'CHANGE THE WORLD'}}
```  
