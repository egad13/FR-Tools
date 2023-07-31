
/** A Breeding probability calculator. Relies on the FRdata namespace being available.*/
const HatchCalc = (function () {

	/////////////////////////////////////////////////////
	///////////////// GENERAL FUNCTIONS /////////////////
	/////////////////////////////////////////////////////

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


	/////////////////////////////////////////////////////
	/////////// HATCHLING TRAIT PROBABILITIES ///////////
	/////////////////////////////////////////////////////

	/** Returns the probability of the goal breed occurring, given the parent breeds; or an error message if the probability can't be calculated.*/
	function breedProbability(parent1, parent2, goal){
		if ( !FRdata.areBreedsCompatible(parent1.breed, parent2.breed) ){
			return ["Incompatible parent breeds. Moderns can breed with any other modern; ancients can breed with the same species of ancient."];
		}
		if (goal.breed === "any") {
			return 1;
		}

		if (goal.breed !== parent1.breed && goal.breed !== parent2.breed){
			return ["Hatchling breed is not one of the parents' breeds."];
		}
		return FRdata.calcRarityProb(FRdata.breeds, parent1.breed, parent2.breed, goal.breed);
	}

	/** Returns the probability of the goal eyes occurring.*/
	function eyeProbability(goal){
		// TODO error check
		if (goal.eye === "any") {
			return 1;
		}
		return FRdata.eyes[goal.eye].probability;
	}

	/** Returns the probability of the goal colours occurring, given the parent colourss; or error messages if the probability can't be calculated.*/
	function colourProbability(parent1, parent2, goal){
		var errs = [];
		var denominator = 1;
		for (const slot of Object.keys(goal.colours)) {
			if (goal.colours[slot] === "any") {
				continue;
			}
			if (!FRdata.isColourInRange(parent1.colours[slot], parent2.colours[slot], goal.colours[slot] )){
				errs.push(`Hatchling's ${slot} colour is not within the range of the parents' ${slot} colours.`);
			} else {
				denominator *= FRdata.colourRangeLength(parent1.colours[slot], parent2.colours[slot]);
			}
		}
		if (errs.length > 0){
			return errs;
		}
		return 1/denominator;
	}

	/** Returns the probability of the goal genes occurring, given the parent genes; or error messages if the probability can't be calculated.*/
	function geneProbability(parent1, parent2, goal){
		var errs = [];
		var n = 1;
		for (const slot of Object.keys(goal.genes)) {
			if (goal.genes[slot] === "any") {
				continue;
			}
			if (goal.genes[slot] !== parent1.genes[slot] && goal.genes[slot] !== parent2.genes[slot]){
				errs.push(`Hatchling ${slot} gene is not one of the parents' ${slot} genes.`);
			} else {
				n *= FRdata.calcRarityProb(FRdata.genes[slot], parent1.genes[slot], parent2.genes[slot], goal.genes[slot]);
			}
		}
		if (errs.length > 0){
			return errs;
		}
		return n;
	}

	/** Returns the probability of the goal gender occurring.*/
	function genderProbability(goal){
		if (goal.gender === "any") {
			return 1;
		}
		return 0.5;
	}

	/** The probability that, when pairing two dragons, the nest will contain at least 1 Goal hatchling.
	 * @param {object[]} nestSizes An array of possible nest sizes and the probabilities that they'll occur. 
	 * @param {any} eggProb The probability that a single egg will be a Goal hatchling. */
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

	/** Calculates the overall probability of a goal hatchling occurring given the properties of the two parents, as well as tables of expected probabilities within several attempts, and probabilities of success in individual properties. */
	function getHatchlingReport(parent1, parent2, goal){
		var overall = 1,
			err = [],
			prob = {
				breed: breedProbability(parent1, parent2, goal),
				colour: colourProbability(parent1, parent2, goal),
				gene: geneProbability(parent1, parent2, goal),
				eye: eyeProbability(goal),
				gender: genderProbability(goal),
			};

		for(const key in prob){
			if (prob[key] instanceof Array) {
				err.push(...prob[key]);
				continue;
			}
			overall *= prob[key];
		}
		prob.overall = overall;

		if (err.length > 0) {
			return {err: err};
		}

		prob.egg_table = chanceTable(prob.overall, [1, 5, 10, 20, 50, 100]);

		const nestSizes = FRdata.nestSizesForBreeds(parent1.breed, parent2.breed);

		prob.avg_nest_size = weightedMean(nestSizes.map((x) => x.eggs), nestSizes.map((x) => x.probability));
		prob.per_nest = nestProbability(nestSizes, prob.overall);
		prob.nest_table = chanceTable(prob.per_nest, [1, 5, 10, 20, 50, 100]);

		return prob;
	}

	/** Turns a chance table into rows for an HTML table.*/
	function formatChanceTable(table) {
		var out = "";
		for (var i = 0; i < table.length; i++){
			const chance = (table[i][1] >= 0.999) ? "~100%"
							: (table[i][1]*100).toFixed(2) + "%";
			out +=
				`\n<tr><td>${table[i][0]}</td><td>${chance}</td></tr>`;
		}
		return out;
	}

	/**Converts a probability report object calculated by getHatchlingReport() into readable HTML*/
	function formatHatchlingReport(result) {
		if (result.err) {
			return `
				<div id="placeholder">
					<p>That hatchling is impossible with the given parents!</p>
					<ul>
						<li>${result.err.join("</li>\n\t\t<li>")}</li>
					</ul>
				</div>`;
		}
		const percent = (x) => (x*100).toFixed(2) + "%",
			inverse = (x) => (1/x).toFixed(2),
			round = (x) => x.toFixed(2);
		return `
			<div id="overview">
				<p>Each egg from this pair will produce a Goal hatchling ${percent(result.overall)} of the time; that's 1 out of every ${inverse(result.overall)} eggs.</p>

				<p>Each nest from this pair will contain at least one Goal hatchling ${percent(result.per_nest)} of the time; that's 1 out of every ${inverse(result.per_nest)} nests.</p>

				<p>There will be an average of ${round(result.avg_nest_size)} eggs per nest.</p>
			</div>

			<table id="egg-table">
				<caption>Chance of hatching Goal within X eggs:</caption>
				<tr><th>Eggs</th><th>Chance</th></tr>
				${formatChanceTable(result.egg_table)}
			</table>

			<table id="nest-table">
				<caption>Chance of hatching Goal within X nests:</caption>
				<tr><th>Nests</th><th>Chance</th></tr>
				${formatChanceTable(result.nest_table)}
			</table>

			<table id="attrs-table">
				<caption>Chances of a hatchling with desired X:</caption>
				<tr><th>Trait</th><th>Chance</th></tr>
				<tr><td>Breed</td><td>${percent(result.breed)}</td></tr>
				<tr><td>Eye type</td><td>${percent(result.eye)}</td></tr>
				<tr><td>Colours</td><td>${percent(result.colour)}</td></tr>
				<tr><td>Genes</td><td>${percent(result.gene)}</td></tr>
			</table>`;
	}

	return {
		getHatchlingReport: getHatchlingReport,
		formatHatchlingReport: formatHatchlingReport
	};

}());
