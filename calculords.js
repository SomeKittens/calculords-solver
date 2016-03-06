'use strict';

// TODO: Show solutions that use lots of cards but don't use all numbers
// For instance, second round

// TODO: prioritize certain cards

// Need a bunch of functions instead of straight eval to consider both sides of subtraction
let operations = [(a, b) => {
  return {
    str: `${a} + ${b}`,
    result: a + b
  };
}, (a, b) => {
  return {
    str: `${a} - ${b}`,
    result: a - b
  };
}, (a, b) => {
  return {
    str: `${b} - ${a}`,
    result: b - a
  };
}, (a, b) => {
  return {
    str: `${a} * ${b}`,
    result: a * b
  };
}];


function runLevel(cards, initInts) {
  let solutions = [];
  let totalUnits = initInts.reduce((a, b, idx) => a + (idx+1), 0);
  let work = 0;
  let counter = initInts.length;
  let incrementWork = () => {
    work += counter;
    counter--;
  };

  function explore (stack, ints, isRoot) {
    // Base cases
    let localCards = cards.slice(0);
    let done = ints.every(input => {
      let idx = localCards.indexOf(input);
      if (idx !== -1) {
        localCards.splice(idx, 1);
        return true;
      }
      return false;
    });
    if (done) {
      let sortedInts = ints.sort();
      let alreadyFound = solutions.some(s => {
        if (s.ints.length !== ints.length) { return false; }
        return s.ints.sort().every((int, idx) => {
          return int === sortedInts[idx];
        });
      });
      if (!alreadyFound) {
        solutions.push({
          stack: stack,
          ints: ints
        });
      }
      return;
    }
    if (ints.length === 1) { return; }
    if (stack.length > Math.pow(ints.length, 2)) { return; }

    // Search!
    for(let i = 0; i < ints.length; i++) {
      if (isRoot) {
        console.log(`${i} of ${ints.length} checked`);
        console.log(`${work} items of ${totalUnits} done`);
        incrementWork();
        postMessage(work / totalUnits);
      }
      for (let j = i+1; j < ints.length; j++) {
        operations.forEach(operation => {
          let localInputs = ints.slice(0);
          let localStack = stack.slice(0);

          let r = operation(ints[i], ints[j]);
          localStack.push(r.str);
          localInputs.splice(i, 1);
          localInputs.splice(j-1, 1);
          localInputs.push(r.result);

          explore(localStack, localInputs);
        });
      }
    }
  }

  explore([], initInts, true);

  return solutions;
}

onmessage = function(e) {
  var result = runLevel(e.data.cards, e.data.nums);
  console.log('worker result:', result);
  postMessage(result);
};