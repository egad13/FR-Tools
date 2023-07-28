
/** A Breeding probability calculator. Relies on the FRdata namespace being available.*/
var HatchCalc = HatchCalc || (function(){
	
	/** Returns a table of the probability of an outcome with the given probability occurring at least once in each of the given numbers of attempts.
	 * @param {number} prob The probability of an outcome.
	 * @param {number[]} steps An array of numbers of attempts to calculate overall probabilities for.*/
	function chanceTable(prob, steps){
		var result = [];
		for (var x of steps){
			result.push([x, probInAttempts(prob, x)]);
		}
		return result;
	}
	
	/** Returns the probability of an outcome with the given probability occurring at least once in the given number of attempts.
	 * @param {number} prob The probability of an outcome.
	 * @param {number} attempts The number of attempts to calculate overall probability for.*/
	function probInAttempts(prob, attempts) {
		const lossProb = 1-prob;
		return 1-(lossProb**attempts);
	}
	
	/** Calculates a weighted average from a list of values and their weights.
	 * @param {number} values The values to average.
	 * @param {number} weights The weights of the values. Must sum to 1.*/
	function weightedMean(values, weights) {
		var result = 0;
		for (var i = 0; i < values.length; i++) {
			result += values[i] * weights[i];
		}
		return result;
	}
	
	/** Returns the probability of the goal breed occurring, given the parent breeds; or an error message if the probability can't be calculated.*/
	function breedProbability(params){
		if ( !FRdata.areBreedsCompatible(params.p1.breed, params.p2.breed) ){
			return ["Incompatible parent breeds. Moderns can breed with any other modern; ancients can breed with the same species of ancient."];
		}
		if (params.h.breed === "any") {
			return 1;
		}
		
		if (params.h.breed !== params.p1.breed && params.h.breed !== params.p2.breed){
			return ["Hatchling breed is not one of the parents' breeds."];
		}
		return FRdata.calcRarityProb(FRdata.breeds, params.p1.breed, params.p2.breed, params.h.breed);
	}
	
	/** Returns the probability of the goal eyes occurring.*/
	function eyeProbability(params){
		// TODO error check
		if (params.h.eye === "any") {
			return 1;
		}
		return FRdata.eyes[params.h.eye].probability;
	}
	
	/** Returns the probability of the goal colours occurring, given the parent colourss; or error messages if the probability can't be calculated.*/
	function colourProbability(params){
		var errs = [];
		var denominator = 1;
		for (const slot of Object.keys(params.h.colours)) {
			if (params.h.colours[slot] === "any") {
				continue;
			}
			if (!FRdata.isColourInRange(params.p1.colours[slot], params.p2.colours[slot], params.h.colours[slot] )){
				errs.push(`Hatchling's ${slot} colour is not within the range of the parents' ${slot} colours.`);
			} else {
				denominator *= FRdata.colourRangeLength(params.p1.colours[slot], params.p2.colours[slot]);
			}
		}
		if (errs.length > 0){
			return errs;
		}
		return 1/denominator;
	}
	
	/** Returns the probability of the goal genes occurring, given the parent genes; or error messages if the probability can't be calculated.*/
	function geneProbability(params){
		var errs = [];
		var n = 1;
		for (const slot of Object.keys(params.h.genes)) {
			if (params.h.genes[slot] === "any") {
				continue;
			}
			if (params.h.genes[slot] !== params.p1.genes[slot] && params.h.genes[slot] !== params.p2.genes[slot]){
				errs.push(`Hatchling ${slot} gene is not one of the parents' ${slot} genes.`);
			} else {
				n *= FRdata.calcRarityProb(FRdata.genes[slot], params.p1.genes[slot], params.p2.genes[slot], params.h.genes[slot]);
			}
		}
		if (errs.length > 0){
			return errs;
		}
		return n;
	}
	
	/** Returns the probability of the goal gender occurring.*/
	function genderProbability(params){
		if (params.h.gender === "any") {
			return 1;
		}
		return 0.5;
	}	
	
	/** Calculates the overall probability of a goal hatchling occurring given the properties of the two parents, as well as tables of expected probabilities within several attempts, and probabilities of success in individual properties. */
	// TODO Maybe rethink this params object so it's slightly less obscure what's happening here...
	function hatchlingProbability(params){		
		var overall = 1,
			err = [],
			prob = {
				breed: breedProbability(params),
				eye: eyeProbability(params),
				colour: colourProbability(params),
				gene: geneProbability(params),
				gender: genderProbability(params),
			};
		
		for(const key in prob){
			if (prob[key] instanceof Array) {
				err.push(...prob[key]);
				prob[key] = 1;
			}
			overall *= prob[key];
		}
		prob.overall = overall;
		prob.err = err;
		
		// table of the chance of hatching the goal within X eggs
		prob.egg_table = chanceTable(prob.overall, [1, 5, 10, 20, 50, 100, 200]);
		
		// average nest size, and rough probability of hatching the goal in each nest
		const nestSizes = FRdata.nestSizesForBreeds(params.p1.breed, params.p2.breed);
		prob.avg_nest_size = weightedMean(nestSizes.map((x) => x.eggs), nestSizes.map((x) => x.probability));
		prob.per_nest = probInAttempts(prob.overall, prob.avg_nest_size);
		
		// table of the chance of hatching the goal within X nests
		prob.nest_table = chanceTable(prob.per_nest, [1, 5, 10, 20, 50, 100, 200]);
		
		console.log(prob);
		return prob;
	}


	return {
		
		hatchlingProbability: hatchlingProbability
		
	};

}());
