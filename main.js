var browser = true;
var hasConsole = typeof console == "object";
var log = hasConsole?console.log.bind(console):print;
if (typeof require == "function") {
	browser = false;
	var Combinatorics = require('./combinatorics.js').Combinatorics;
	var Parallel = require('./parallel.js');
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
	return global.p.gcdDict[index(a,b)];
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



var width = 4;
var height = 4;
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

function go() {

	var input;

	// input = generateInput();
	input = [1,9,7,11,10,3,6,14,5,15,12,8,13,2,4,16];
	log("Input: ", input);
	var cmb = Combinatorics.permutation(input);
	log("Length: " + cmb.length);
	var highestScore = 0;
	var lowestScore = 1000000;
	var highest = null;
	var lowest = null;
	var parallel = false;
	var validIndex = generateValidIndex();
	var validTwoIndex = generateValidTwoIndex();
	var processed = 0;
	var start = new Date().getTime();
	var a = null;
	while(a = cmb.next()) {
    // while (a == null) {
		// if (validIndex.indexOf(a.indexOf(1)) == -1)
		// 	continue;
		// var valid = true;
		// var s2 = validTwoIndex.length;
		// for (var i = 2; i <= s2; i++) {
		// 	if (validTwoIndex.indexOf(a.indexOf(i)) == -1) {
		// 		valid = false;
		// 		break;
		// 	}
		// };
		// if (!valid)
		// 	continue;

		processed++;
		// if (parallel) {
		// 	var job = new Parallel(
		// 		{problem:a,score:0}, {
		// 		env: global.p,
		// 		envNamespace: 'p'
		// 	}).require(score, lookupGCD, calcDistance, index).spawn(function(data) {
		// 		data.score = score(data.problem);
		// 		return data;
		// 	}).then(function(data) {
		// 		var s = data.score;
		// 		var a = data.problem;
		// 		if (s > highestScore) {
		// 			highestScore = s;
		// 			highest = a;
		// 			log("H: " + s, format(a));
		// 		}
		// 		if (s < lowestScore) {
		// 			lowestScore = s;
		// 			lowest = a;
		// 			log("L: " + s, format(a));
		// 		}	
		// 	});
		// } else {
			var s = score(a);
			if (s > highestScore) {
				highestScore = s;
				highest = a;
				log("H: " + s, format(a));
				log(a.join(","));
			}
			if (s < lowestScore) {
				lowestScore = s;
				lowest = a;
				log("L: " + s, format(a));
				log(a.join(","));
			}
		// }

		if (highest)
			break;
	}

	log("Highest: " + highestScore);
	log("  " + format(highest));

	log("Lowest: " + lowestScore);
	log("  " + format(lowest));

	log("Processed: " + processed);
	log("Took: " + (new Date().getTime() - start) + " ms");

	log(score(highest, true));
}

if (!browser || !hasConsole)
	go();

