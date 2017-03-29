s
==========

`crud-redux` is an alternative interface for `redux` which replaces the concept of `actions` and `reducers` with singular `change` statements which have a **label**, a **pure state-modifying function** (which of course doesn't modify state, but returns a new version) and an (optional) **input validation function**.

`crud-redux` adheres to the three core principles of redux and creates actions & reducers in the background which makes it completely compatible with redux.

This project was created to make working with redux more efficient and concise while allowing redux based projects to gradually switch, instead of having to refactor their entire state management code to work with a more concise redux alternative.