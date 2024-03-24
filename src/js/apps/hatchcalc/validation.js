/** Validates form input for the hatchcalc app.
 *
 * Relies on the `data` module from `FRjs`.
 * @module hatchcalc/validation
 * @outerdocs FRjs
 */

import * as FR from "FRjs/data";

/////////////////////////////////////////////////////
// EXPORTS
/////////////////////////////////////////////////////

/** Runs all validation functions on the given parents and hatchling.
 * @param {module:hatchcalc/main~DragonFields.values} parent1
 * @param {module:hatchcalc/main~DragonFields.values} parent2
 * @param {module:hatchcalc/main~GoalFields.values} goal
 * @returns {string[]} An array of error messages. An empty array means the validation passed. */
export function validateAll(parent1, parent2, goal) {
	return [
		...validateBreed(parent1.breed, parent2.breed, goal.breed),
		...validateColours(parent1.colour, parent2.colour, goal.colour, goal.useRanges ? goal.colourRange : null),
		...validateGenes(parent1.gene, parent2.gene, goal.gene),
		...validateEye(goal.eye),
		...validateGender(goal.gender)
	];
}


/////////////////////////////////////////////////////
// INTERNALS - FUNCTIONS
/////////////////////////////////////////////////////

/** Validates that all given breeds exist in FRjs/data.BREEDS, and that goal matches either p1 or p2.
 * @param {number} p1
 * @param {number} p2
 * @param {number} goal
 * @returns {string[]} An array of error messages. An empty array means the validation passed. */
function validateBreed(p1, p2, goal) {
	const errors = [];
	const invalid = n => `Invalid ${n} breed.`;

	if (!(p1 in FR.BREEDS)) { errors.push(invalid("Parent 1")); }
	if (!(p2 in FR.BREEDS)) { errors.push(invalid("Parent 2")); }
	if (!(goal === "any" || goal in FR.BREEDS)) { errors.push(invalid("Hatchling")); }

	if (!FR.areBreedsCompatible(p1, p2)) {
		errors.push("Incompatible parent breeds. Moderns can breed with any other modern; ancients can breed with the same species of ancient.");
	}

	if (!["any", p1, p2].includes(goal)) {
		errors.push("Hatchling breed is not one of the parents' breeds.");
	}

	return errors;
}

/** Validates that all given colours exist in FRjs/data.COLOURS, and that goal colours are within range of the associated colours of p1 and p2.
 * @param {{primary:number,secondary:number,tertiary:number}} p1
 * @param {{primary:number,secondary:number,tertiary:number}} p2
 * @param {{primary:number,secondary:number,tertiary:number}} goal
 * @param {{primary:number,secondary:number,tertiary:number}} [goalRanges]
 * @returns {string[]} An array of error messages. An empty array means the validation passed. */
function validateColours(p1, p2, goal, goalRanges) {
	const errors = [];
	const invalid = (n, s) => `Invalid ${n} ${s} colour.`;

	for (const slot in goal) {
		if (goal[slot] === "any") { continue; }

		const p1c = p1[slot], p2c = p2[slot],
			g1 = goal[slot], g2 = goalRanges ? goalRanges[slot] : null;

		if (!(p1c in FR.COLOURS)) { errors.push(invalid("Parent 1", slot)); }
		if (!(p2c in FR.COLOURS)) { errors.push(invalid("Parent 2", slot)); }
		if (!(g1 in FR.COLOURS)) { errors.push(invalid("Hatchling", slot)); }

		if (goalRanges && g2) {
			if (!(g2 in FR.COLOURS)) { errors.push(invalid("Hatchling", `${slot} range`)); }
			if (!FR.isColourSubrangeInRange(p1c, p2c, g1, g2)) {
				errors.push(`Hatchling's ${slot} colour range is not within the range of the parents' ${slot} colours.`);
			}
		} else if (!FR.isColourInRange(p1c, p2c, g1)) {
			errors.push(`Hatchling's ${slot} colour is not within the range of the parents' ${slot} colours.`);
		}
	}

	return errors;
}

/** Validates that all given genes exist in their given slot of FRjs/data.GENES, and that goal genes match the associated gene of either p1 or p2.
 * @param {{primary:number,secondary:number,tertiary:number}} p1
 * @param {{primary:number,secondary:number,tertiary:number}} p2
 * @param {{primary:number,secondary:number,tertiary:number}} goal
 * @param {{primary:number,secondary:number,tertiary:number}} [goalRanges]
 * @returns {string[]} An array of error messages. An empty array means the validation passed. */
function validateGenes(p1, p2, goal) {
	const errors = [];
	const invalid = (n, s) => `Invalid ${n} ${s} gene.`;

	for (const slot in goal) {
		if (goal[slot] === "any") { continue; }

		const p1g = p1[slot], p2g = p2[slot], gg = goal[slot];

		if (!(p1g in FR.GENES[slot])) { errors.push(invalid("Parent 1", slot)); }
		if (!(p2g in FR.GENES[slot])) { errors.push(invalid("Parent 2", slot)); }
		if (!(gg in FR.GENES[slot])) { errors.push(invalid("Hatchling", slot)); }

		if (gg !== p1g && gg !== p2g) {
			errors.push(`Hatchling ${slot} gene is not one of the parents' ${slot} genes.`);
		}
	}

	return errors;
}

/** Validates that the given eye type exists in FRjs/data.EYES.
 * @param {number} goal
 * @returns {string[]} An array of error messages. An empty array means the validation passed. */
function validateEye(goal) {
	if (goal !== "any" && !(goal in FR.EYES)) {
		return ["Invalid Hatchling eye type."];
	}
	return [];
}

/** Validates that the given gender is one of "m", "f", or "any".
 * @param {string} goal
 * @returns {string[]} An array of error messages. An empty array means the validation passed. */
function validateGender(goal) {
	if (goal !== "any" && !(goal in FR.GENDERS)) {
		return ["Invalid Hatchling gender."];
	}
	return [];
}
