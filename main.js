var browser = true;
var hasConsole = typeof console == "object";
var log = hasConsole?console.log.bind(console):print;
if (typeof require == "function") {
	browser = false;
	var Combinatorics = require('./combinatorics.js').Combinatorics;
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
			if (mul > size)
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
			gcdDict[index(i,j)] = findGCD(i,j);
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
	return gcdDict[index(a,b)];
}

function calcDistance(a, b) {
	
	// var ay = Math.floor(a / width);
	// var ax = a - (ay * width);

	// var by = Math.floor(b / width);
	// var bx = b - (by * width);

	var ax = a % width;
	var ay = (a - ax) / width;
	var bx = b % width;
	var by = (b - bx) / width;

	var dx = Math.abs(ax - bx);
	var dy = Math.abs(ay - by);
	var result = dx * dx + dy * dy;
	return result;
}

function score(d) {
	var result = 0;
	var index = [-1];
	for (var i = 0; i < d.length; i++) {
		// log(d[i] + " at " + i);
		index[d[i]] = i;
	};

	// log(index);

	for (var a = 1; a < size; a++) {
		var ia = index[a];
		for (var b = a + 1; b <= size; b++) {
			var gcd = lookupGCD(a, b);
			var ib = index[b];
			// log(a + " = " + ia + ", " + b + " = " + ib);
			var dist = calcDistance(ia, ib);
			var dab = gcd * dist;
			// log(a + "|" + b + "|" + gcd + "|" + dist + "|" + dab);
			result += dab;
		};
	};

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
	for (var i = 1; i <= size; i++) {
		result[i-1] = i;
	};
	return result;
}



var width = 4;
var height = 4;
var size = width * height;//size*size;
var max = size * size;

generateGCD();

// // log(lookupGCD(12, 12));
// var square = [2, 8, 4, 5, 9, 7, 1, 6, 3];
// log("Score: " + score(square));

// log("Format: " + format(square))
// log(calcDistance(5, 3));

function go() {

var input = generateInput();
log("Input: ", input);
var cmb = Combinatorics.permutation(input);
log("Length: " + cmb.length);
var highestScore = 0;
var lowestScore = 1000000;
var highest = null;
var lowest = null;
while(a = cmb.next()) {
	var s = score(a);
	if (s > highestScore) {
		highestScore = s;
		highest = a;
		log("H: " + s, format(a));
	}
	if (s < lowestScore) {
		lowestScore = s;
		lowest = a;
		log("L: " + s, format(a));
	}
}

log("Highest: " + highestScore);
log(format(highest));

log("Lowest: " + lowestScore);
log(format(lowest));

}

if (!browser || !hasConsole)
	go();

