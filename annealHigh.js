var browser = true;
var hasConsole = typeof console == "object";
var log = hasConsole?console.log.bind(console):print;
if (typeof require == "function") {
	browser = false;
	var fs = require('fs');
	// var Combinatorics = require('./combinatorics.js').Combinatorics;
	// var Parallel = require('./parallel.js');
}

// 3..27

var denoms = {};
var gcdDict = {};

function generateGCD() {
	for (var i = max; i >= 1; i--) {
		// log(i);
		denoms[i] = findDenominators(i);
	};
	// log(JSON.stringify(denoms, null, 2));
	for (var i = 2; i <= max; i++) {
		for (var j = i; j < max; j++) {
			var mul = i * j;
			if (mul > global.p.size)
				break;
			// log(i + "*" + j + " = " + mul);
			addDenominator(denoms[mul], i);
			addDenominator(denoms[mul], j);
		};
	};
	for (var i = max; i >= 1; i--) {
		denoms[i].sort(function (a, b) {
			  return a - b;
			});
	}

	// log(JSON.stringify(denoms, null, 2));

	for (var i = 1; i <= max; i++) {
		for (var j = 1; j < max; j++) {
			global.p.gcdDict[index(i,j)] = findGCD(i,j);
		}
	}
};

function index(a, b) {
	return a * 1000 + b;
}

function findGCD(a, b) {
	var da = denoms[a];
	var db = denoms[b];
	var match = da.filter(function(val) {
		return db.indexOf(val) != -1;
	});
	return match[match.length - 1];
}

function findDenominators(i) {
	var result = [1];
	if (i > 1)
		result.push(i);
	return result;	
};

function addDenominator(denom, i) {
	if (denom.indexOf(i) != -1)
		return;
	// log("Adding: " + i + " to ", denom);
	denom.push(i);
};

function lookupGCD(a, b) {
	return global.p.gcdDict[a * 1000 + b];
}

function calcDistance(a, b) {
	
	// var ay = Math.floor(a / width);
	// var ax = a - (ay * width);

	// var by = Math.floor(b / width);
	// var bx = b - (by * width);

	var width = global.p.width;
	var ax = a % width;
	var ay = (a - ax) / width;
	var bx = b % width;
	var by = (b - bx) / width;

	var dx = Math.abs(ax - bx);
	var dy = Math.abs(ay - by);
	var result = dx * dx + dy * dy;
	return result;
}

function score(d, debug) {
	var result = 0;
	var index = [-1];
	for (var i = 0; i < d.length; i++) {
		// !debug|| log(d[i] + " at " + i);
		index[d[i]] = i;
	};

	// !debug||log(index);
	var out;
	!debug||(out = []);
	var size = global.p.size;

	if (debug) {
		for (var a = 0; a < size; a++) {
			out[a] = 0;
		}
	}

	for (var a = 1; a < size; a++) {
		var ia = index[a];
		for (var b = a + 1; b <= size; b++) {
			var gcd = lookupGCD(a, b);
			var ib = index[b];
			// !debug|| log(a + " = " + ia + ", " + b + " = " + ib);
			var dist = calcDistance(ia, ib);
			var dab = gcd * dist;
			!debug|| (out[ia] += dab);
			!debug|| (out[ib] += dab);
			result += dab;
		};
	};

	!debug||log("" + out.join(","));

	return result;
}

function format(d) {
	var result = [];
	var i = 0;
	for (var y = 0; y < height; y++) {
		var row = [];
		for (var x = 0; x < width; x++) {
			row.push(d[i]);
			i++;
		};
		result.push("(" + row.join(",") + ")");
	};
	return result.join(", ");
}

function generateInput() {
	var result = [];
	for (var i = 1; i <= global.p.size; i++) {
		result[i-1] = i;
	};
	return result;
}

function generateValidIndex() {
	// [0, 1, 4]
	var result = [];
	var w2 = Math.ceil(width / 2) - 1;
	var h2 = Math.floor(height / 2);
	var h2ceil = Math.ceil(height / 2);
	var i = 0;
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			if (y < h2 && x <= w2) {
				result.push(i);
			}
			i++;
		};
	};
	if (h2 != h2ceil)
		result.push(h2 * width + w2);
	return result;
}

function generateValidTwoIndex() {
	var result = [];
	var i = 0;
	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			if (x >= y) {
				result.push(i);
			}
			i++;
		};
	};
	return result;
}

function mutate(a) {
	var best = a;
	var bestScore = 0;
	for (var i = 0; i < size; i++) {
		for (var j = i; j < size; j++) {
			var b = a.concat();
			var k = b[i];
			b[i] = b[j];
			b[j] = k;
			var s = score(b);
			if (s > bestScore)
			{
				bestScore = s;
				best = b;
			}
		};
	};

	return {best: best, bestScore: bestScore};
}



function generateRandomInput() {
	var queue = [];
	var size = global.p.size;
	for (var i = 1; i <= size; i++) {
		queue[i-1] = i;
	};
	var result = [];
	while(queue.length) {
		result.push(queue.splice(Math.random() * queue.length, 1)[0]);
	}
	return result;
}

var n = (typeof process == "object" && process.argv.length > 2)?parseInt(process.argv[2]):4;
log("Starting with: " + n);
var width = n;
var height = n;
var size = width * height;//size*size;
var max = size * size;

global.p = {
	size: size,
	gcdDict: gcdDict,
	width: width,
	height: height,
	max: max
}

generateGCD();

// // log(lookupGCD(12, 12));
// var square = [2, 8, 4, 5, 9, 7, 1, 6, 3];
// log("Score: " + score(square));

// log("Format: " + format(square))
// log(calcDistance(5, 3));

function findBest(input, bestScore) {

	var a = input;
	var s = score(a);
	while(true) {

		var s2 = mutate(a);
		if (s2.bestScore <= s)
			break;
		s = s2.bestScore;
		a = s2.best;
		if (s > bestScore) {
			bestScore = s;
			log("H: " + s, format(a));
			log(a.join(","));

			fs.appendFileSync('high' + n + '.txt', '\n' + s + '\n' + format(a));
		}
	}

	return {best:a,bestScore:bestScore};
}

function go() {

	var input;

	input = generateRandomInput();
	// input = [1,9,7,11,10,3,6,14,5,15,12,8,13,2,4,16];
	log("Input: ", input);
	var validIndex = generateValidIndex();
	var validTwoIndex = generateValidTwoIndex();
	var processed = 0;
	var start = new Date().getTime();

	var best = input;
	var bestScore = score(best);

	while (true) {
		var result = findBest(input, bestScore);
		if (result.bestScore > bestScore)
		{
			bestScore = result.bestScore;
			best = result.best;
		}
		input = generateRandomInput();
	}


	log("Took: " + (new Date().getTime() - start) + " ms");

	log(score(best, true));
}

if (!browser || !hasConsole)
	go();

