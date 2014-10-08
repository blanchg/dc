function GeometricMean(stdlib, foreign, buffer) {
  "use asm";

  var exp = stdlib.Math.exp;
  var log = stdlib.Math.log;
  var values = new stdlib.Float64Array(buffer);

  var l = foreign.log;

  function logSum(start, end) {
    start = start|0;
    end = end|0;

    var sum = 0.0, p = 0;

    // asm.js forces byte addressing of the heap by requiring shifting by 3
    for (p = start; (p|0) < (end|0); p = (p + 1)|0) {
      sum = sum + +log(+(values[p<<3>>3]));
    }

    return +sum;
  }

  function geometricMean(start, end) {
    start = start|0;
    end = end|0;

    return +exp(+logSum(start, end) / +((end - start)|0));
  }

  function sum(start, end) {
    start = start|0;
    end = end|0;
    var sum = 0.0, p = 0;
    for (p = start; (p|0) <= (end|0); p = (p + 1)|0) {
      sum = sum +(values[p<<3>>3]);
    }
    return +sum;
  }

  return { 
    geometricMean: geometricMean,
    sum: sum
   };
}

function init(heap, start, end) {
  heap = new Float64Array(heap);
  for (var i = start; i <= end; i++) {
    heap[i] = Math.random();//i;// * Math.random();
  };
}

var START = 0;
var END = 10000000;

var heap = new ArrayBuffer(0x10000000);          // 64k heap
init(heap, START, END);                       // fill a region with input values
var fast = GeometricMean((typeof global == "object")?global:window, {log:console.log.bind(console)}, heap); // produce exports object linked to AOT-compiled code
var start = new Date().getTime();
console.log(fast.geometricMean(START, END));               // computes geometric mean of input values
console.log("Took: " + (new Date().getTime() - start) + "ms");

var bogusGlobal = {
  Math: {
    exp: function(x) { return Math.exp(x); },
    log: function(x) { return Math.log(x); }
  },
  Float64Array: Float64Array
};
var slow = GeometricMean(bogusGlobal, {log:console.log.bind(console)}, heap); // produces purely-interpreted/JITted version
start = new Date().getTime();
console.log(slow.geometricMean(START, END));       // computes bizarro-geometric mean thanks to bogusGlobal
console.log("Took: " + (new Date().getTime() - start) + "ms");