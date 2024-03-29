/**
 * The view for the Hatchling Probability Calculator. Collects the necessary form fields for each dragon into a structure hatchcalc/controller understands, and also tells it which element to treat as the "calculate" button and which element to dump results into.
 *
 * Relies on the `forms` and `data` modules from `FRjs`.
 * @module hatchcalc/main
 * @requires module:domutils
 * @requires module:hatchcalc/calculator
 * @requires module:hatchcalc/validation
 * @outerdocs FRjs
 */

import("FRjs/forms");
import {DragonTraits} from "FRjs/convert";
import { triggerEvt } from "../../lib/domutils.js";
import * as HC from "./calculator.js";
import * as HCV from "./validation.js";

/////////////////////////////////////////////////////
// CLASSES
/////////////////////////////////////////////////////

/** Form fields representing a dragon's traits. */
class DragonFields {
	constructor(fieldsetID) {
		this.fieldset = document.querySelector(`#${fieldsetID}`);
		const get = this.fieldset.querySelector.bind(this.fieldset);

		this.breed = get('[is=fr-breeds]');

		this.colour = {
			primary: get('.primary[is="fr-colours"]'),
			secondary: get('.secondary[is="fr-colours"]'),
			tertiary: get('.tertiary[is="fr-colours"]')
		};

		this.gene = {
			primary: get('[is="fr-genes"][slot="primary"]'),
			secondary: get('[is="fr-genes"][slot="secondary"]'),
			tertiary: get('[is="fr-genes"][slot="tertiary"]')
		};
	}

	get values() {
		return {
			breed: this.breed.value,
			colour: {
				primary: this.colour.primary.value,
				secondary: this.colour.secondary.value,
				tertiary: this.colour.tertiary.value
			},
			gene: {
				primary: this.gene.primary.value,
				secondary: this.gene.secondary.value,
				tertiary: this.gene.tertiary.value
			}
		};
	}

	set values(indices) {
		this.breed.value = indices.breed;

		this.colour.primary.value = indices.colour.primary;
		this.colour.secondary.value = indices.colour.secondary;
		this.colour.tertiary.value = indices.colour.tertiary;

		this.gene.primary.value = indices.gene.primary;
		this.gene.secondary.value = indices.gene.secondary;
		this.gene.tertiary.value = indices.gene.tertiary;
	}
}

/** Form fields representing a Goal dragon's traits. */
class GoalFields extends DragonFields {
	constructor(fieldsetID) {
		super(fieldsetID);
		const get = this.fieldset.querySelector.bind(this.fieldset);

		this.eye = get('[is="fr-eyes"]');
		this.gender = get('[is="fr-genders"]');
		this.useRanges = get("#use-ranges");

		this.colourRange = {
			primary: get(".primary.colour-range"),
			secondary: get(".secondary.colour-range"),
			tertiary: get(".tertiary.colour-range")
		};
	}

	get values() {
		return {
			...super.values,
			eye: this.eye.value,
			gender: this.gender.value,
			useRanges: this.useRanges.checked,
			colourRange: {
				primary: this.colourRange.primary.value,
				secondary: this.colourRange.secondary.value,
				tertiary: this.colourRange.tertiary.value
			}
		};
	}

	set values(indices) {
		super.values = indices;
		this.eye.value = indices.eye;
		this.gender.value = indices.gender;
	}
}


/////////////////////////////////////////////////////
// EXPORT FORM FIELDS
/////////////////////////////////////////////////////

/**
 * Form fields representing the first parent dragon.
 * @type {module:hatchcalc/view~DragonFields}
 */
const parent1 = new DragonFields("p1");
/**
 * Form fields representing the second parent dragon.
 * @type {module:hatchcalc/view~DragonFields}
 */
const parent2 = new DragonFields("p2");
/**
 * Form fields representing the goal hatchling.
 * @type {module:hatchcalc/view~GoalFields}
 */
const goal = new GoalFields("h");


/** The button that should cause the calculations to run and display results.
 * @type {HTMLButtonElement} */
const calcBtn = document.querySelector("#calc");

const resultElt = document.querySelector("#results");

/** The interface for the controller to communicate output to this view. Formats the results into human-readable HTML and displays them in the page's results section.
 * @param {Object} report */
function displayReport(report) {
	resultElt.innerHTML = formatHatchlingReport(report);
	resultElt.scrollIntoView({ behavior: "smooth" });
	document.location.hash = "hatchcalc-results";
}

function displayErrors(errors) {
	resultElt.innerHTML = `
	<div id="placeholder">
		<p>That hatchling is impossible with the given parents!</p>
		<ul>
			<li>${errors.join("</li>\n<li>")}</li>
		</ul>
	</div>`;
}


/////////////////////////////////////////////////////
// RESULTS FORMATTING
/////////////////////////////////////////////////////

/** Turns a chance table into rows for an HTML table
 * @param {number[][]} table
 * @private */
function chanceTableRows(table) {
	let out = "";
	for (let i = 0; i < table.length; i++) {
		out += `\n<tr><td>${table[i][0]}</td><td>${percent(table[i][1])}</td></tr>`;
	}
	return out.trim();
}

/** Convert a probability between 0 and 1 to a percentage, rounded to 2 decimal places.
 * @param {number} x
 * @private */
function percent(x) {
	if (x >= 0.9999) {
		return "~100%";
	} else if (x <= 0.0001) {
		return "~0%";
	}
	return `${round(x * 100)}%`;
}
/** Convert a probability between 0 and 1 to its inverse (ie 1/x), rounded to 2 decimal places.
 * @param {number} x
 * @private */
function inverse(x) {
	return round(1 / x);
}
/** Round a number to 2 decimal places.
 * @param {number} x
 * @private */
function round(x) {
	return x.toFixed(2);
}
/** Convert a number into a string with thousand separators.
 * @param {number} x
 * @private */
function thousandSeparator(x) {
	return x.replace(/(?<!,)\d{3,}\.?\d*/, (match, token) =>
		parseFloat(match) === 0
		? match
		: parseFloat(match).toLocaleString('en', {maximumFractionDigits:2}));
}

/**
 * Converts a probability report object into readable HTML.
 * @param {Object} report
 * @returns {string} */
function formatHatchlingReport(report) {
	return `
		<div id="overview">
			<p>Each egg from this pair will produce a Goal hatchling ${percent(report.perEgg)} of the time; that's 1 out of every ${thousandSeparator(inverse(report.perEgg))} eggs.</p>

			<p>Each nest from this pair will contain at least one Goal hatchling ${percent(report.perNest)} of the time; that's 1 out of every ${thousandSeparator(inverse(report.perNest))} nests.</p>

			<p>There will be an average of ${round(report.avgNestSize)} eggs per nest.</p>
		</div>

		<table id="egg-table">
			<caption>Chance of hatching Goal within X eggs:</caption>
			<tr><th>Eggs</th><th>Chance</th></tr>
			${chanceTableRows(report.eggTable)}
		</table>

		<table id="nest-table">
			<caption>Chance of hatching Goal within X nests:</caption>
			<tr><th>Nests</th><th>Chance</th></tr>
			${chanceTableRows(report.nestTable)}
		</table>

		<table id="attrs-table">
			<caption>Chances of a hatchling with desired X:</caption>
			<tr><th>Trait</th><th>Chance</th></tr>
			<tr><td>Breed</td><td>${percent(report.breed)}</td></tr>
			<tr><td>Eye type</td><td>${percent(report.eye)}</td></tr>
			<tr><td>Colours</td><td>${percent(report.colour)}</td></tr>
			<tr><td>Genes</td><td>${percent(report.gene)}</td></tr>
		</table>`;
}


/////////////////////////////////////////////////////
// ADD EVENT HANDLERS
/////////////////////////////////////////////////////

goal.useRanges.addEventListener("change", () => {
	goal.fieldset.classList.toggle("use-ranges-checked", goal.useRanges.checked);

	goal.colourRange.primary.disabled
	= goal.colourRange.secondary.disabled
	= goal.colourRange.tertiary.disabled = !goal.useRanges.checked;
});
triggerEvt(goal.useRanges, "change");

calcBtn.addEventListener("click", () => {
	const p1vals = parent1.values, p2vals = parent2.values, gVals = goal.values;

	const validationErrors = HCV.validateAll(p1vals, p2vals, gVals);
	console.log(validationErrors);
	if (validationErrors.length > 0) {
		displayErrors(validationErrors);
		return;
	}

	const report = HC.getHatchlingReport(p1vals, p2vals, gVals);
	console.log(report);
	displayReport(report);
});

for (const dragon of [parent1, parent2, goal]) {
	const fid = dragon.fieldset.id;
	dragon.fieldset.querySelector("button.scry-btn").addEventListener("click", () => {
		const input = dragon.fieldset.querySelector(`input#${fid}-scry`);
		const indices = DragonTraits.fromScrylink(input.value)?.indices;
		dragon.values = indices;
	});
	dragon.fieldset.querySelector("button.profile-btn").addEventListener("click", () => {
		const input = dragon.fieldset.querySelector(`textarea#${fid}-profile`);
		const indices = DragonTraits.fromProfile(input.value)?.indices;
		dragon.values = indices;
	});
}