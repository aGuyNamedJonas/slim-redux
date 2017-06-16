import { createSlimReduxStore, subscription, calculation, changeTrigger, asyncChangeTrigger } from '../../src/';

const store                = createSlimReduxStore({ counter: 0 }),
      counterSub           = subscription('state.counter', counter => console.log(`New counter state: ${counter}`)),
      counterTimesTen      = calculation(['state.counter'], counter => counter * 10, incCounter => console.log(`Increased calculated counter state: ${incCounter}`)),
      increaseCounter      = changeTrigger('INCREASE_COUNTER', (state) => ({ counter: state.counter + 1 })),
      increaseCounterAsync = asyncChangeTrigger({ increaseCounter }, () => setTimeout(() => increaseCounter(), 2000) );

// All synchronous
increaseCounter();
increaseCounter();
increaseCounter();

// Asynchronous change trigger
console.log('Increasing counter in 2000ms...');
increaseCounterAsync();
