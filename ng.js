'use strict';

angular.module('calc', [])
.controller('gaem', function ($scope) {
  'use strict';
  let g = this;
  g.cards = ['2','18','62'];
  g.nums = ['8','4','3','2','5','6'];


  let completeWork = (e) => {
    g.loading = false;
    g.results = e.data;
    console.log('results.length', g.results.length);
    let largest = g.results.reduce((p, s) => {
      if (s.ints.length > p) {
        return s.ints.length;
      }
      return p;
    }, 0);

    let sorted = g.results.sort((a, b) => b.ints.length - a.ints.length);

    if (g.results.length) {
      console.log(`${g.results.length} Solutions found`);
      console.log(`Best solution allows ${largest} card(s)`);
      console.log(sorted.slice(0, 10));
    } else {
      console.log('No solutions found');
    }
  };

  g.runLevel = () => {
    g.selected = null;
    g.results = null;
    g.loading = true;
    g.percent = 0;
    let worker = new Worker('calculords.js');

    worker.postMessage({
      cards: g.cards.map(c => +c),
      nums: g.nums.map(n => +n)
    });

    worker.onmessage = e => {
      console.log('message', e.data);
      if (typeof e.data === 'object') {
        completeWork(e);
      } else {
        g.percent = e.data * 100;
      }
      $scope.$evalAsync();
    };
  };

  g.useSolution = (solution) => {
    solution.ints.forEach(i => {
      let idx = g.cards.indexOf(i+'');
      if (idx !== -1) {
        g.cards.splice(idx, 1);
      }
    });
    g.nums = [];
    g.results = [solution];
    g.selected = solution;
  };
});
