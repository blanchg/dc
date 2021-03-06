var browser = true;
var hasConsole = typeof console == "object";
var log = hasConsole?console.log.bind(console):print;
var fs = {appendFileSync: function() {}};
if (typeof require == "function") {
	browser = false;
	fs = require('fs');
	var LineByLineReader = require('line-by-line');
	var request = require('request');
	var cheerio = require('cheerio');
}

// 3..27

var denoms = {};
var gcdDict = {};
var toX = {};
var toY = {};
var distDict = {};

function generateGCD() {
	var start = new Date().getTime();
	for (var i = max; i >= 1; i--) {
		if (i > 1) {
			denoms[i] = [1, i];
		} else {
			denoms[i] = [1];
		}
	};
	log("a: " + (new Date().getTime() - start));
	start = new Date().getTime();
	var size = global.p.size;
	log("size: " + size);
	log("max: " + max);
	// log(JSON.stringify(denoms, null, 2));
	for (var i = 2; i <= max; i++) {
		for (var j = i; j < max; j++) {
			var mul = i * j;
			if (mul > size)
				break;
			// log(i + "*" + j + " = " + mul);
			var d = denoms[mul];
			if (d.indexOf(i) == -1)
				d.push(i);
			if (d.indexOf(j) == -1)
				d.push(j);
		};
	};
	log("b: " + (new Date().getTime() - start));
	start = new Date().getTime();
	for (var i = max; i >= 1; i--) {
		denoms[i].sort(function (a, b) {
			  return a - b;
			});
	}

	// log(JSON.stringify(denoms, null, 2));
	var dict = global.p.gcdDict;
	for (var i = 1; i <= size; i++) {
		for (var j = 1; j <= size; j++) {
			dict[i * 1000 + j] = findGCD(i,j);
		}
	}
	log("c: " + (new Date().getTime() - start));
};

function findGCD(a, b, debug) {
	var da = denoms[a];
	var db = denoms[b];
	var ia = da.length - 1;
	var ib = db.length - 1;
	while(ia >= 0 && ib >= 0) {
		!debug||log("i " + ia + " , " + ib);
		var va = da[ia];
		var vb = db[ib];

		!debug||log("  " + va + " , " + vb);
		if (va == vb)
			break;
		if (va < vb)
			ib--;
		else
			ia--;
	}
	return da[ia];
}

function generatetoX() {
	for (var i = 0; i < size; i++) {
		toX[i] = i % width;
		toY[i] = (i - toX[i]) / width;
	};
}

function generateDistDict() {
	for (var a = 0; a < size; a++) {
		for (var b = 0; b < size; b++) {
			distDict[a*1000+b] = calcDistance(a,b);
		}
	}
}

function calcDistance(a, b) {
	
	var width = global.p.width;

	var ax = toX[a];//a % width;
	var ay = toY[a];
	var bx = toX[b];//b % width;
	var by = toY[b];

	var dx = ax-bx;//ax>bx?ax-bx:bx-ax; //Math.abs(ax - bx);
	var dy = ay-by;//ay>by?ay-by:by-ay; //Math.abs(ay - by);
	var result = dx * dx + dy * dy;
	return result;
}

function score(d, debug) {
	var result = 0;
	var index = [-1];
	var size = global.p.size;
	var gcdDict = global.p.gcdDict;
	var distDict = global.p.distDict;
	for (var i = 0; i < size; i++) {
		// !debug|| log(d[i] + " at " + i);
		index[d[i]] = i;
	};

	for (var a = 1; a < size; a++) {
		var ia = index[a];
		var a1000 = a * 1000;
		var ia1000 = ia * 1000;

		for (var b = a + 1; b <= size; b++) {
			var gcd = gcdDict[a1000 + b];//lookupGCD(a, b);
			var ib = index[b];
			var dist = distDict[ia1000 + ib];//calcDistance(ia, ib);
			var dab = gcd * dist;
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

function mutate(a) {
	var best = a.concat();
	var b = a.concat();
	var low = global.p.low;
	var size = global.p.size;
	var bestScore = low?Number.MAX_VALUE:0;
	for (var i = 0; i < size; i++) {
		for (var j = i; j < size; j++) {
			b[i] = a[j];
			b[j] = a[i];
			var s = score(b);
			// log("Score: " + s + " best: " + bestScore + " low: " + low);
			if (low?(s < bestScore):(s > bestScore))
			{
				// Only 
				bestScore = s;
				// best = b;
				for (var k = 0; k < size; k++) {
					best[k] = b[k];
					// b[k] 
				};
				// b = a.concat();
			}
			// reset
			b[i] = a[i];
			b[j] = a[j];
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
var width = n;
var height = n;
var size = width * height;//size*size;
var max = size * size;

var low = (typeof process == "object" && process.argv.length > 3)?process.argv[3] == "true":false;

var filename = (low?'low':'high') + n + ".txt";

log("Finding " + (low?"lowest":"highest") + " for " + n + " logging to " + filename);

if (typeof global != "object") {
	var global = {};
}

global.p = {
	size: size,
	gcdDict: gcdDict,
	width: width,
	height: height,
	max: max,
	distDict: distDict,
	low: low,
	filename: filename
}

generateGCD();
generatetoX();
generateDistDict();


function findBest(input, inputScore, cb) {

	var a = input;
	var s = score(a);
	var low = global.p.low;
	var filename = global.p.filename;


	function processInput(dontUseProcess) {
		var s2 = mutate(a);
		// log("Took: " + (new Date().getTime() - start) + " ms to mutate");
		// log("Best mutation: " + s2.bestScore + " vs " + s);
		if (low?(s2.bestScore >= s):(s2.bestScore <= s)) {
			cb();
			return;
		}
		s = s2.bestScore;
		a = s2.best;
		if (low?(s < inputScore):(s > inputScore)) {
			inputScore = s;
			log(s, format(a));
			log(a.join(","));

			fs.appendFileSync(filename, '\n' + s + '\n' + format(a));

			if (low?(s < bestScore):(s > bestScore))
			{
				bestScore = s;
				best = a;
			}

		}
		if (!dontUseProcess) {
			setImmediate(processInput);
		}
	}
	if (typeof process == "object") {
		processInput(false);
	} else {
		while (true) {
			processInput(true);
		}
	}


}

function findBestScoreSoFar(bestScore, cb) {
	if (typeof LineByLineReader == "undefined")
		cb(bestScore);

	var filename = global.p.filename;
	var low = global.p.low;
	var lr = new LineByLineReader(filename);
	var lineNum = 0;
	lr.on('error', function (err) {
	    log("Error: " + err);
	    cb(bestScore)
	});

	lr.on('line', function (line) {
	    lineNum++;
	    line = line.toString();
	    if (line.indexOf("(") != -1)
	    	return;
	    var score = parseInt(line);
	    if (low?(score < bestScore):(score > bestScore)) {
	    	log("Found score: " + score + " in " + filename + " @ " + lineNum);
	    	bestScore = score;
	    }
	});

	lr.on('end', function () {
	    cb(bestScore);
	});
}

function record(score, input) {

	var result = format(input);
	// if (typeof fs == "object") {
	// 	fs.appendFileSync(filename, '\n' + score + '\n' + result);
	// }
	// log("R: " + (typeof request));
	if (typeof request == "function") {
		request({
			method: "POST",
			url:"http://azspcs.net/Contest/DelacorteNumbers/Enter",
			headers: {
				Cookie:"ASP.NET_SessionId=i3ofuyryadc3xz45ydnex445; UserName=blanchard.glen@gmail.com; SessionCode=d790d606-f9bd-4535-a01d-0f3055aa3c46;"
			},
			form: {
				rawText: result,
				submit: "Submit Entry"
			}
		},
		function (err, response, body) {
			if (err) {
				log("Post error: ", err);
				setTimeout(checkRecord, 30000).unref();
			} else {
				var $ = cheerio.load(body, {normalizeWhitespace: true});
				log($(path).text());
				lastPostedScore = score;
				setTimeout(checkRecord, 60000).unref();
			}
		});
	}
}

var lastPostedScore = 0;

var best = null;
var bestScore = 0;
var path = "#contentContainer > fieldset > table:nth-child(3)"

function checkRecord() {
	log("Checking if should record: " + lastPostedScore + " == " + bestScore)
	if (lastPostedScore == bestScore) {
		setTimeout(checkRecord, 10000).unref();
		return;
	}

	record(bestScore, best);
}

function go() {

	var input;
	
	input = generateRandomInput();
	log("Input: ", input.join(","));

	log("GCD:", findGCD(16, 8, true));

	best = input;
	bestScore = score(best);

	findBestScoreSoFar(bestScore, function(fileBestScore) {
		if (bestScore == fileBestScore) {
			log("Starting: " + bestScore, format(best));
			fs.appendFileSync(filename, '\nStarting\n' + bestScore + '\n' + format(best));
		} else {
			bestScore = fileBestScore;
			log("Resuming with best score: " + bestScore);
		}

		lastPostedScore = bestScore;


		log("Creating record timer");
		setTimeout(checkRecord, 1000).unref();

		function processInput(dontUseProcess) {
			findBest(input, bestScore, function() {

				input = generateRandomInput();

				if (!dontUseProcess) {
					setImmediate(processInput);
				}
			});
		}
		if (typeof process == "object") {
			processInput(false);
		} else {
			while (true) {
				processInput(true);
			}
		}

	});


}

if (!browser || !hasConsole)
	go();
