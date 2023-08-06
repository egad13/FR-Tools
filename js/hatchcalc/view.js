/**
 * The view for the Hatchling Probability Calculator. Collects the necessary form fields for each dragon into a structure hatchcalc/controller understands, and also tells it which element to treat as the "calculate" button and which element to dump results into.
 * @module hatchcalc/view
 * @requires module:domutils
 * @author egad13
 * @version 0.0.1
 */

import { triggerEvt } from "../domutils.js";

/////////////////////////////////////////////////////
// CLASSES
/////////////////////////////////////////////////////

/** Form fields representing a dragon's traits. */
export class DragonFields {
	constructor(fieldsetID) {
		this.fieldset = document.querySelector(`#${fieldsetID}`);

		/** @type {HTMLSelectElement} */
		this.breed = this.fieldset.querySelector(".breed");

		/** Object structure: `{ primary: HTMLSelectElement, secondary: HTMLSelectElement, tertiary: HTMLSelectElement }`
		 * @type {{primary:HTMLSelectElement, secondary:HTMLSelectElement, tertiary:HTMLSelectElement}} */
		this.colour = {
			primary: this.fieldset.querySelector(".primary.colour"),
			secondary: this.fieldset.querySelector(".secondary.colour"),
			tertiary: this.fieldset.querySelector(".tertiary.colour")
		};
		
		/** Object structure: `{ primary: HTMLSelectElement, secondary: HTMLSelectElement, tertiary: HTMLSelectElement }`
		 * @type {{primary:HTMLSelectElement, secondary:HTMLSelectElement, tertiary:HTMLSelectElement}} */
		this.gene = {
			primary: this.fieldset.querySelector(".primary.gene"),
			secondary: this.fieldset.querySelector(".secondary.gene"),
			tertiary: this.fieldset.querySelector(".tertiary.gene")
		};

	}

	getValues() {
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
}

/** Form fields representing a Goal dragon's traits. */
export class GoalFields extends DragonFields {
	constructor(fieldsetID) {
		super(fieldsetID);

		/** @type {HTMLSelectElement} */
		this.eye = this.fieldset.querySelector(".eye");
		/** @type {HTMLSelectElement} */
		this.gender = this.fieldset.querySelector(".gender");

		/** @type {HTMLInputElement} */
		this.use_ranges = this.fieldset.querySelector("#use-ranges");
		/** Structure of object is `{ primary: HTMLSelectElement, secondary: HTMLSelectElement, tertiary: HTMLSelectElement }`
		 * @type {{primary:HTMLSelectElement, secondary:HTMLSelectElement, tertiary:HTMLSelectElement}} */
		this.colour_range = {
			primary: this.fieldset.querySelector(".primary.colour-range"),
			secondary: this.fieldset.querySelector(".secondary.colour-range"),
			tertiary: this.fieldset.querySelector(".tertiary.colour-range")
		};
	}

	getValues() {
		return {
			...super.getValues(),
			eye: this.eye.value,
			gender: this.gender.value,
			use_ranges: this.use_ranges.checked,
			colour_range: {
				primary: this.colour_range.primary.value,
				secondary: this.colour_range.secondary.value,
				tertiary: this.colour_range.tertiary.value
			}
		}
	}
}


/////////////////////////////////////////////////////
// EXPORT FORM FIELDS
/////////////////////////////////////////////////////

/**
 * Form fields representing the first parent dragon.
 * @type {module:hatchcalc/view.DragonFields}
 */
export const parent1 = new DragonFields("parent1");
/**
 * Form fields representing the second parent dragon.
 * @type {module:hatchcalc/view.DragonFields}
 */
export const parent2 = new DragonFields("parent2");
/**
 * Form fields representing the goal hatchling.
 * @type {module:hatchcalc/view.GoalFields}
 */
export const goal = new GoalFields("hatchling");


/** The button that should cause the calculations to run and display results.
 * @type {HTMLButtonElement} */
export const calcBtn = document.querySelector("#calc");

const resultElt = document.querySelector("#results");

/** The interface for the controller to communicate output to this view. Formats the results into human-readable HTML and displays them in the page's results section.
 * @param {Object} report */
export function displayReport(report) {
	resultElt.innerHTML = formatHatchlingReport(report);
	resultElt.focus({ preventScroll: false, focusVisible: true });
	resultElt.scrollIntoView(true, { behavior: "smooth" });
	document.location.hash = "hatchcalc-results";
}



/////////////////////////////////////////////////////
// RESULTS FORMATTING
/////////////////////////////////////////////////////

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

/**
 * Converts a probability report object into readable HTML.
 * @param {Object} report
 * @returns {string} */
function formatHatchlingReport(report) {
	if (report.err) {
		return `
				<div id="placeholder">
					<p>That hatchling is impossible with the given parents!</p>
					<ul>
						<li>${report.err.join("</li>\n\t\t<li>")}</li>
					</ul>
				</div>`;
	}
	const percent = (x) => (x * 100).toFixed(2) + "%",
		inverse = (x) => (1 / x).toFixed(2),
		round = (x) => x.toFixed(2);
	return `
		<div id="overview">
			<p>Each egg from this pair will produce a Goal hatchling ${percent(report.per_egg)} of the time; that's 1 out of every ${inverse(report.per_egg)} eggs.</p>

			<p>Each nest from this pair will contain at least one Goal hatchling ${percent(report.per_nest)} of the time; that's 1 out of every ${inverse(report.per_nest)} nests.</p>

			<p>There will be an average of ${round(report.avg_nest_size)} eggs per nest.</p>
		</div>

		<table id="egg-table">
			<caption>Chance of hatching Goal within X eggs:</caption>
			<tr><th>Eggs</th><th>Chance</th></tr>
			${formatChanceTable(report.egg_table)}
		</table>

		<table id="nest-table">
			<caption>Chance of hatching Goal within X nests:</caption>
			<tr><th>Nests</th><th>Chance</th></tr>
			${formatChanceTable(report.nest_table)}
		</table>

		<table id="attrs-table">
			<caption>Chances of a hatchling with desired X:</caption>
			<tr><th>Trait</th><th>Chance</th></tr>
			<tr><td>Breed</td><td>${percent(report.breed)}</td></tr>
			<tr><td>Eye type</td><td>${percent(report.eye)}</td></tr>
			<tr><td>Colours</td><td>${percent(report.colour)}</td></tr>
			<tr><td>Genes</td><td>${percent(report.gene)}</td></tr>
		</table>`.replace(/\r|\n|\t|\s{2,}/g, "");
}


/////////////////////////////////////////////////////
// ADD EVENT HANDLERS
/////////////////////////////////////////////////////

goal.use_ranges.addEventListener("change", (evt) => {
	goal.fieldset.classList.toggle("use-ranges-checked", goal.use_ranges.checked);

	goal.colour_range.primary.disabled = 
	goal.colour_range.secondary.disabled = 
	goal.colour_range.tertiary.disabled = !goal.use_ranges.checked;
	
});
triggerEvt(goal.use_ranges, "change");


//TODO some kind of graceful error message if any of the necessary elements can't be found or the structure of the document is off? Not super critical, especially for such a small project, but may be useful to make sure I don't break anything later.
