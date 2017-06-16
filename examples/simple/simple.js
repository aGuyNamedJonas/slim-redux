import { createSlimReduxStore, subscription, calculation, changeTrigger, asyncChangeTrigger } from '../../src/';

const store                = createSlimReduxStore({ counter: 0 }),
      counterSub           = subscription('state.counter', counter => console.log(`New counter state: ${counter}`)),
      counterTimesTen      = calculation(['state.counter'], counter => counter * 10, incCounter => console.log(`Increased calculated counter state: ${incCounter}`)),
      increaseCounter      = changeTrigger('INCREASE_COUNTER', (inc, state) => ({ counter: state.counter + inc })),
      increaseCounterAsync = asyncChangeTrigger({ increaseCounter }, () => setTimeout(() => increaseCounter(1), 2000) );

// All synchronous
increaseCounter(1);
increaseCounter(2);
increaseCounter(3);

// Asynchronous change trigger
console.log('Increasing counter in 2000ms...');
increaseCounterAsync();
