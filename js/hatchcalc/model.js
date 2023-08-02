/**
 * The model for the hatchling probability calculator. Does all the calculations, etc.
 * @module HatchCalcModel
 * @requires module:FRdata
 * @author egad13
 * @version 0.0.1
 */

//import { areBreedsCompatible, calcRarityProb, eyes, isColourInRange, colourRangeLength, nestSizesForBreeds } as FRdata from "./frdata.js";
import * as FRdata from "../frdata.js";

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

/** Turns a chance table into rows for an HTML table
 * @param {number[][]} table
 * @private */
function formatChanceTable(table) {
	var out = "";
	for (var i = 0; i < table.length; i++) {
		const chance = (table[i][1] >= 0.999) ? "~100%"
			: (table[i][1] * 100).toFixed(2) + "%";
		out +=
			`\n<tr><td>${table[i][0]}</td><td>${chance}</td></tr>`;
	}
	return out;
}


/////////////////////////////////////////////////////
/////////// HATCHLING TRAIT PROBABILITIES ///////////
/////////////////////////////////////////////////////

/** Returns the probability of the goal breed occurring, given the parent breeds; or an error message if the probability can't be calculated.
 * @private */
function breedProbability(parent1, parent2, goal) {
	if (!FRdata.areBreedsCompatible(parent1.breed, parent2.breed)) {
		return ["Incompatible parent breeds. Moderns can breed with any other modern; ancients can breed with the same species of ancient."];
	}
	if (goal.breed === "any") {
		return 1;
	}

	if (goal.breed !== parent1.breed && goal.breed !== parent2.breed) {
		return ["Hatchling breed is not one of the parents' breeds."];
	}
	return FRdata.calcRarityProb(FRdata.breeds, parent1.breed, parent2.breed, goal.breed);
}

/** Returns the probability of the goal eyes occurring.
 * @private */
function eyeProbability(goal) {
	// TODO error check
	if (goal.eye === "any") {
		return 1;
	}
	return FRdata.eyes[goal.eye].probability;
}

/** Returns the probability of the goal colours occurring, given the parent colourss; or error messages if the probability can't be calculated.
 * @private */
function colourProbability(parent1, parent2, goal) {
	var errs = [];
	var denominator = 1;
	for (const slot of Object.keys(goal.colour)) {
		if (goal.colour[slot] === "any") {
			continue;
		}
		if (!FRdata.isColourInRange(parent1.colour[slot], parent2.colour[slot], goal.colour[slot])) {
			errs.push(`Hatchling's ${slot} colour is not within the range of the parents' ${slot} colours.`);
		} else {
			denominator *= FRdata.colourRangeLength(parent1.colour[slot], parent2.colour[slot]);
		}
	}
	if (errs.length > 0) {
		return errs;
	}
	return 1 / denominator;
}

/** Returns the probability of the goal genes occurring, given the parent genes; or error messages if the probability can't be calculated.
 * @private */
function geneProbability(parent1, parent2, goal) {
	var errs = [];
	var n = 1;
	for (const slot of Object.keys(goal.gene)) {
		if (goal.gene[slot] === "any") {
			continue;
		}
		if (goal.gene[slot] !== parent1.gene[slot] && goal.gene[slot] !== parent2.gene[slot]) {
			errs.push(`Hatchling ${slot} gene is not one of the parents' ${slot} genes.`);
		} else {
			n *= FRdata.calcRarityProb(FRdata.genes[slot], parent1.gene[slot], parent2.gene[slot], goal.gene[slot]);
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
 * @param {DragonParams} parent1
 * @param {DragonParams} parent2
 * @param {{breed:number, colour:number, gene:number, eye:number, gender:number}} goal
 * @returns {Object|{err:string[]}} */
export function getHatchlingReport(parent1, parent2, goal) {
	var overall = 1,
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
		overall *= prob[key];
	}
	prob.overall = overall;

	if (err.length > 0) {
		return { err: err };
	}

	prob.egg_table = chanceTable(prob.overall, [1, 5, 10, 20, 50, 100]);

	const nestSizes = FRdata.nestSizesForBreeds(parent1.breed, parent2.breed);

	prob.avg_nest_size = weightedMean(nestSizes.map((x) => x.eggs), nestSizes.map((x) => x.probability));
	prob.per_nest = nestProbability(nestSizes, prob.overall);
	prob.nest_table = chanceTable(prob.per_nest, [1, 5, 10, 20, 50, 100]);

	return prob;
}

/**
 * Converts a probability report object calculated by {@link getHatchlingReport} into readable HTML.
 * @param {Object} probReport
 * @returns {string} */
export function formatHatchlingReport(probReport) {
	if (probReport.err) {
		return `
				<div id="placeholder">
					<p>That hatchling is impossible with the given parents!</p>
					<ul>
						<li>${probReport.err.join("</li>\n\t\t<li>")}</li>
					</ul>
				</div>`;
	}
	const percent = (x) => (x * 100).toFixed(2) + "%",
		inverse = (x) => (1 / x).toFixed(2),
		round = (x) => x.toFixed(2);
	return `
			<div id="overview">
				<p>Each egg from this pair will produce a Goal hatchling ${percent(probReport.overall)} of the time; that's 1 out of every ${inverse(probReport.overall)} eggs.</p>

				<p>Each nest from this pair will contain at least one Goal hatchling ${percent(probReport.per_nest)} of the time; that's 1 out of every ${inverse(probReport.per_nest)} nests.</p>

				<p>There will be an average of ${round(probReport.avg_nest_size)} eggs per nest.</p>
			</div>

			<table id="egg-table">
				<caption>Chance of hatching Goal within X eggs:</caption>
				<tr><th>Eggs</th><th>Chance</th></tr>
				${formatChanceTable(probReport.egg_table)}
			</table>

			<table id="nest-table">
				<caption>Chance of hatching Goal within X nests:</caption>
				<tr><th>Nests</th><th>Chance</th></tr>
				${formatChanceTable(probReport.nest_table)}
			</table>

			<table id="attrs-table">
				<caption>Chances of a hatchling with desired X:</caption>
				<tr><th>Trait</th><th>Chance</th></tr>
				<tr><td>Breed</td><td>${percent(probReport.breed)}</td></tr>
				<tr><td>Eye type</td><td>${percent(probReport.eye)}</td></tr>
				<tr><td>Colours</td><td>${percent(probReport.colour)}</td></tr>
				<tr><td>Genes</td><td>${percent(probReport.gene)}</td></tr>
			</table>`;
}
