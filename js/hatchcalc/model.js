/**
 * The model for the hatchling probability calculator. Does all the calculations, etc.
 * @module hatchcalc/model
 * @requires module:frdata
 * @author egad13
 * @version 0.0.1
 */

import * as FR from "../frdata.js";

/////////////////////////////////////////////////////
///////////////// GENERAL FUNCTIONS /////////////////
/////////////////////////////////////////////////////

/** Returns a table of the probability of an outcome with the given probability occurring at least once in each of the given numbers of attempts.
 * @param {number} prob The probability of an outcome.
 * @param {number[]} steps An array of numbers of attempts to calculate overall probabilities for.
 * @private */
function chanceTable(prob, steps) {
	var result = [];
	for (var x of steps) {
		result.push([x, probInAttempts(prob, x)]);
	}
	return result;
}

/** Returns the probability of an outcome with the given probability occurring at least once in the given number of attempts.
 * @param {number} prob The probability of an outcome.
 * @param {number} attempts The number of attempts to calculate overall probability for.
 * @private */
function probInAttempts(prob, attempts) {
	const lossProb = 1 - prob;
	return 1 - (lossProb ** attempts);
}

/** Calculates a weighted average from a list of values and their weights.
 * @param {number[]} values The values to average.
 * @param {number[]} weights The weights of the values. Must sum to 1.
 * @private */
function weightedMean(values, weights) {
	var result = 0;
	for (var i = 0; i < values.length; i++) {
		result += values[i] * weights[i];
	}
	return result;
	// TODO test this experimental other way of doing it
	return values.reduce((a, b, index) => a + (b * weights[index]));
}


/////////////////////////////////////////////////////
/////////// HATCHLING TRAIT PROBABILITIES ///////////
/////////////////////////////////////////////////////

/** Returns the probability of the goal breed occurring, given the parent breeds; or an error message if the probability can't be calculated.
 * @private */
function breedProbability(parent1, parent2, goal) {
	if (!FR.areBreedsCompatible(parent1.breed, parent2.breed)) {
		return ["Incompatible parent breeds. Moderns can breed with any other modern; ancients can breed with the same species of ancient."];
	}
	if (goal.breed === "any") {
		return 1;
	}

	if (goal.breed !== parent1.breed && goal.breed !== parent2.breed) {
		return ["Hatchling breed is not one of the parents' breeds."];
	}
	return FR.calcRarityProb(FR.breeds, parent1.breed, parent2.breed, goal.breed);
}

/** Returns the probability of the goal eyes occurring.
 * @private */
function eyeProbability(goal) {
	if (goal.eye === "any") {
		return 1;
	}
	if (goal.eye in FR.eyes) {
		return FR.eyes[goal.eye].probability;
	}
	return ["Invalid eye type. Something has gone very wrong."];
}

/** Returns the probability of the goal colours occurring, given the parent colourss; or error messages if the probability can't be calculated.
 * @private */
function colourProbability(parent1, parent2, goal) {
	var errs = [];
	var prob = 1;

	for (const slot in goal.colour) {
		// skip if probability need not be calc'd for this slot
		if (goal.colour[slot] === "any") {
			continue;
		}

		const p1 = parent1.colour[slot], p2 = parent2.colour[slot],
			g1 = goal.colour[slot], g2 = goal.colour_range[slot];

		if (goal.use_ranges && g2 !== "") {
			// error checking
			if (!FR.isColourSubrangeInRange(p1, p2, g1, g2)) {
				errs.push(`Hatchling's ${slot} colour range is not within the range of the parents' ${slot} colours.`);
				continue;
			}
			prob *= FR.colourRangeLength(g1, g2) / FR.colourRangeLength(p1, p2);
		} else {
			// error checking
			if (!FR.isColourInRange(p1, p2, g1)) {
				errs.push(`Hatchling's ${slot} colour is not within the range of the parents' ${slot} colours.`);
				continue;
			}
			prob *= 1 / FR.colourRangeLength(p1, p2);
		}
	}
	if (errs.length > 0) {
		return errs;
	}
	return prob;
}

/** Returns the probability of the goal genes occurring, given the parent genes; or error messages if the probability can't be calculated.
 * @private */
function geneProbability(parent1, parent2, goal) {
	var errs = [];
	var n = 1;
	for (const slot in goal.gene) {
		if (goal.gene[slot] === "any") {
			continue;
		}
		if (goal.gene[slot] !== parent1.gene[slot] && goal.gene[slot] !== parent2.gene[slot]) {
			errs.push(`Hatchling ${slot} gene is not one of the parents' ${slot} genes.`);
		} else {
			n *= FR.calcRarityProb(FR.genes[slot], parent1.gene[slot], parent2.gene[slot], goal.gene[slot]);
		}
	}
	if (errs.length > 0) {
		return errs;
	}
	return n;
}

/** Returns the probability of the goal gender occurring.
 * @private */
function genderProbability(goal) {
	if (goal.gender === "any") {
		return 1;
	}
	return 0.5;
}

/** The probability that, when pairing two dragons, the nest will contain at least 1 Goal hatchling.
 * @param {object[]} nestSizes An array of possible nest sizes and the probabilities that they'll occur. 
 * @param {any} eggProb The probability that a single egg will be a Goal hatchling.
 * @private */
function nestProbability(nestSizes, eggProb) {
	// P(A|B) for independent events is P(A) * P(B)
	// prob that nest size occurs AND contains a goal hatchling
	const nestSuccessProb =
		nestSizes.map(n => n.probability * probInAttempts(eggProb, n.eggs));

	// P(A or B) = P(A) + P(B)
	// prob that any nest will contain a goal hatchling
	return nestSuccessProb.reduce((a, b) => a + b);
}


/////////////////////////////////////////////////////
///////////////// OUTPUT FUNCTIONS //////////////////
/////////////////////////////////////////////////////

/**
 * Calculates a detailed report of the probability of hatching the given Goal hatchling by nesting the given parents. Includes the overall probability of a goal hatchling occurring in one egg and in one nest, tables of expected probabilities within several attempts of eggs and nests, and probabilities of success in individual properties.
 * @param {module:hatchcalc/controller~DragonTraits} parent1
 * @param {module:hatchcalc/controller~DragonTraits} parent2
 * @param {module:hatchcalc/controller~GoalTraits} goal
 * @returns {Object|{err:string[]}} */
export function getHatchlingReport(parent1, parent2, goal) {
	var per_egg = 1,
		err = [],
		prob = {
			breed: breedProbability(parent1, parent2, goal),
			colour: colourProbability(parent1, parent2, goal),
			gene: geneProbability(parent1, parent2, goal),
			eye: eyeProbability(goal),
			gender: genderProbability(goal),
		};

	for (const key in prob) {
		if (prob[key] instanceof Array) {
			err.push(...prob[key]);
			continue;
		}
		per_egg *= prob[key];
	}
	prob.per_egg = per_egg;

	if (err.length > 0) {
		return { err: err };
	}

	const nestSizes = FR.nestSizesForBreeds(parent1.breed, parent2.breed);

	prob.avg_nest_size = weightedMean(nestSizes.map((x) => x.eggs), nestSizes.map((x) => x.probability));
	prob.per_nest = nestProbability(nestSizes, prob.per_egg);

	prob.egg_table = chanceTable(prob.per_egg, [1, 5, 10, 20, 50, 100]);
	prob.nest_table = chanceTable(prob.per_nest, [1, 5, 10, 20, 50, 100]);

	return prob;
}
