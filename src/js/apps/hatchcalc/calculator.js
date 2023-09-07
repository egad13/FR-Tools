/** Performs probability calculations to determine a pair of dragons' chances of producing a defined goal hatchling, based on Flight Rising's breeding mechanics.
 *
 * Relies on the `data` module from `FRjs`.
 * @module hatchcalc/calculator
 * @version 0.0.1
 * @outerdocs FRjs
 */

import * as FR from "FRjs/data";

/////////////////////////////////////////////////////
// GENERAL FUNCTIONS
/////////////////////////////////////////////////////

/** Returns a table of the probability of an outcome with the given probability occurring at least once in each of the given numbers of attempts.
 * @param {number} prob The probability of an outcome.
 * @param {number[]} steps An array of numbers of attempts to calculate overall probabilities for.
 * @private */
function chanceTable(prob, steps) {
	const result = [];
	for (const x of steps) {
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
	let result = 0;
	for (let i = 0; i < values.length; i++) {
		result += values[i] * weights[i];
	}
	return result;
}


/////////////////////////////////////////////////////
// HATCHLING TRAIT PROBABILITIES
/////////////////////////////////////////////////////

/** Returns the probability of the goal breed occurring, given the parent breeds; or an error message if the probability can't be calculated.
 * @private */
function breedProbability(parent1, parent2, goal) {
	if (goal.breed === "any") { return 1; }
	return FR.calcRarityProb(FR.BREEDS, parent1.breed, parent2.breed, goal.breed);
}

/** Returns the probability of the goal eyes occurring.
 * @private */
function eyeProbability(goal) {
	if (goal.eye === "any") { return 1; }
	return FR.EYES[goal.eye].probability;
}

/** Returns the probability of the goal colours occurring, given the parent colourss; or error messages if the probability can't be calculated.
 * @private */
function colourProbability(parent1, parent2, goal) {
	let prob = 1;
	for (const slot in goal.colour) {
		if (goal.colour[slot] === "any") { continue; }

		const p1 = parent1.colour[slot], p2 = parent2.colour[slot],
			g1 = goal.colour[slot], g2 = goal.colourRange[slot];

		if (goal.useRanges && g2 !== "") {
			prob *= FR.colourRangeLength(g1, g2) / FR.colourRangeLength(p1, p2);
		} else {
			prob *= 1 / FR.colourRangeLength(p1, p2);
		}
	}
	return prob;
}

/** Returns the probability of the goal genes occurring, given the parent genes; or error messages if the probability can't be calculated.
 * @private */
function geneProbability(parent1, parent2, goal) {
	let n = 1;
	for (const slot in goal.gene) {
		if (goal.gene[slot] === "any") { continue; }

		n *= FR.calcRarityProb(FR.GENES[slot], parent1.gene[slot], parent2.gene[slot], goal.gene[slot]);
	}
	return n;
}

/** Returns the probability of the goal gender occurring.
 * @private */
function genderProbability(goal) {
	if (goal.gender === "any") { return 1; }
	return 0.5;
}

/** The probability that, when pairing two dragons, the nest will contain at least 1 Goal hatchling.
 * @param {object[]} nestSizes An array of possible nest sizes and the probabilities that they'll occur.
 * @param {any} eggProb The probability that a single egg will be a Goal hatchling.
 * @private */
function nestProbability(nestSizes, eggProb) {
	// P(A|B) for independent events is P(A) * P(B)
	// prob that nest size occurs AND contains a goal hatchling
	const nestSuccessProb
		= nestSizes.map(n => n.probability * probInAttempts(eggProb, n.size));

	// P(A or B) = P(A) + P(B)
	// prob that any nest will contain a goal hatchling
	return nestSuccessProb.reduce((a, b) => a + b);
}


/////////////////////////////////////////////////////
// OUTPUT FUNCTIONS
/////////////////////////////////////////////////////

/** Calculates a detailed report of the probability of hatching the given Goal hatchling by nesting the given parents. Includes the overall probability of a goal hatchling occurring in one egg and in one nest, tables of expected probabilities within several attempts of eggs and nests, and probabilities of success in individual properties.
 * @param {module:hatchcalc/main~DragonFields.values} parent1
 * @param {module:hatchcalc/main~DragonFields.values} parent2
 * @param {module:hatchcalc/main~GoalFields.values} goal
 * @returns {{breed:number,colour:number,gene:number,eye:number,gender:number,perEgg:number,perNest:number,avgNestSize:number,eggTable:number[][],nestTable:number[][]}|{err: string[]}} */
export function getHatchlingReport(parent1, parent2, goal) {
	let perEgg = 1;
	const err = [],
		prob = {
			breed: breedProbability(parent1, parent2, goal),
			colour: colourProbability(parent1, parent2, goal),
			gene: geneProbability(parent1, parent2, goal),
			eye: eyeProbability(goal),
			gender: genderProbability(goal)
		};

	for (const key in prob) {
		if (prob[key] instanceof Array) {
			err.push(...prob[key]);
			continue;
		}
		perEgg *= prob[key];
	}
	prob.perEgg = perEgg;

	if (err.length > 0) {
		return { err: err };
	}

	const nestSizes = FR.nestSizesForBreeds(parent1.breed, parent2.breed);

	prob.avgNestSize = weightedMean(nestSizes.map((x) => x.size), nestSizes.map((x) => x.probability));
	prob.perNest = nestProbability(nestSizes, prob.perEgg);

	prob.eggTable = chanceTable(prob.perEgg, [1, 5, 10, 20, 50, 100]);
	prob.nestTable = chanceTable(prob.perNest, [1, 5, 10, 20, 50, 100]);

	return prob;
}
