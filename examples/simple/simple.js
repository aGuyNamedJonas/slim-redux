import { createSlimReduxStore, subscription, calculation, changeTrigger, asyncChangeTrigger } from 'slim-redux';

/*
      Feel free to inspect this store object! 
      It's a redux store with a few injected properties and the internal slim-redux reducer setup already!
*/
const store = createSlimReduxStore({ counter: 0, text: '<insert test string here>' });

/*
      Subscriptions let you react to parts of the state changing - here we react to the counter value changing
*/
const counterSub = subscription('state.counter', counter => console.log(`COUNTER: ${counter}`));

/*
     Calculations allow you to take multiple subscriptions and derive a new value off of it.
     Notice how you specify two functions - one to calculate a derived value and one to react to the >derived< value changing.
 */
const counterTimesTen = calculation(['state.counter'], counter => counter * 10, incCounter => console.log(`INC COUNTER: ${incCounter}`));


/* 
      Change triggers are a bundle of an action + a reducer function.
      It returns a function which takes the arguments you specify (in this case: inc) and will automatically create an action and dispatch it.
      Change triggers are always synchronous functions!
*/
const increaseCounter = changeTrigger('INCREASE_COUNTER', (inc, state) => ({ ...state, counter: state.counter + inc }));

/*
      Async change triggers let you take synchronous change triggers and use them asynchronously.
      Just like calculations rely on a bunch of subscriptions, async change triggers rely on a bunch of change triggers.
      So calculation is the higher order concept of subscriptions, async change triggers are the higher order concept of change triggers.
      Just like regular change triggers, you can also define parameters that the returned function will take (here: inc).
 */
const increaseCounterAsync = asyncChangeTrigger({ increaseCounter }, (inc, ct) => {      
      setTimeout(() => ct.increaseCounter(inc), 2000);
});

const stSub = subscription('state', state => console.log(`STATE: ${JSON.stringify(state, null, 2)}`));

/*
      Change triggers can take a subscription string as an optional third parameter. It allows you to only modify that part of the
      state in your reducer function. This should make using change triggers incredibly smooth.
      This will let you for instance have one file with change triggers of one file that use a shared constant to have all change
      triggers from that file operate on the same part of the state.
*/
const changeText = changeTrigger('CHANGE_TEXT', (text, state) => {
      console.log('Changing text state...');
      return text;
}, 'state.text');

/*
      Calling a few change triggers. Notice how this is synchronously (it calls the subscription and calculation that were defined before
      going to the next change trigger call). Also notice how here you can make use of the argument you defined earlier.
*/
increaseCounter(1);
increaseCounter(2);
increaseCounter(3);


/*
      Using the scoped change triggers. Notice how these will not trigger the subscription and calculation we defined on state.counter
*/
changeText('💩');
changeText('💩💩');
changeText('💩💩💩');

/*
      Notice how this state change will occur precisely 2000 ms after the console log appeeared on your terminal output :)
*/
increaseCounterAsync(100);
console.log('Increasing counter in 2000ms...');
