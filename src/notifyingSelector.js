import { createSelectorCreator } from 'reselect'

/*
    Special reselector which can tell us whether the underlying value has actually changed
*/
const defaultEqualityCheck = (a, b) => (a === b);

const areArgumentsShallowlyEqual = (equalityCheck, prev, next) => {
  if (prev === null || next === null || prev.length !== next.length) {
    return false
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  const length = prev.length
  for (let i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false
    }
  }

  return true
}

const defaultMemoize = (func, equalityCheck = defaultEqualityCheck) => {
  let lastArgs = null
  let lastResult = null
  // we reference arguments instead of spreading them for performance reasons
  return function () {
    let changed = false

    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments);
      changed = true
    }

    lastArgs = arguments

    return {
      hasChanged: changed,
      data: lastResult,
    }
  }
}

const getNotifyingSelectorCreator = () => createSelectorCreator(defaultMemoize);
const createNotifyingSelector = getNotifyingSelectorCreator();

export default createNotifyingSelector;
