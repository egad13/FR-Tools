/**
 * The view for the Hatchling Probability Calculator. Collects the necessary form fields for each dragon into a structure HatchCalcController understands, and also tells it which element to treat as the "calculate" button and which element to dump results into.
 * @module HatchCalcView
 * @author egad13
 * @version 0.0.1
 */

/** Form fields representing one dragon's traits. */
export class DragonSelects {
	constructor(fieldsetID) {
		/** @type {HTMLSelectElement} */
		this.breed = document.querySelector(`#${fieldsetID} .breed`);
		/** @type {HTMLSelectElement|undefined} */
		this.eye = document.querySelector(`#${fieldsetID} .eye`);
		/** @type {HTMLSelectElement|undefined} */
		this.gender = document.querySelector(`#${fieldsetID} .gender`);

		/** Structure of object is `{ primary: HTMLSelectElement, secondary: HTMLSelectElement, tertiary: HTMLSelectElement }`
		 * @type {{primary:HTMLSelectElement, secondary:HTMLSelectElement, tertiary:HTMLSelectElement}} */
		this.colour = {
			primary: document.querySelector(`#${fieldsetID} .primary.colour`),
			secondary: document.querySelector(`#${fieldsetID} .secondary.colour`),
			tertiary: document.querySelector(`#${fieldsetID} .tertiary.colour`)
		};
		
		/** Structure of object is `{ primary: HTMLSelectElement, secondary: HTMLSelectElement, tertiary: HTMLSelectElement }`
		 * @type {{primary:HTMLSelectElement, secondary:HTMLSelectElement, tertiary:HTMLSelectElement}} */
		this.gene = {
			primary: document.querySelector(`#${fieldsetID} .primary.gene`),
			secondary: document.querySelector(`#${fieldsetID} .secondary.gene`),
			tertiary: document.querySelector(`#${fieldsetID} .tertiary.gene`)
		};

	}

	/** Checks if this object rerpresents the goal hatchling or not.
	 * @returns {boolean} */
	isHatchling() {
		return this.breed.closest("fieldset").id === "hatchling";
	}
}

/** Form fields representing the first parent dragon.
 * @type {DragonSelects} */
export const parent1 = new DragonSelects("parent1");
/** Form fields representing the second parent dragon.
 * @type {DragonSelects} */
export const parent2 = new DragonSelects("parent2");
/** Form fields representing the goal hatchling.
 * @type {DragonSelects} */
export const goal = new DragonSelects("hatchling");


/** The button that (should) cause the calculations to run and display results.
 * @type {HTMLButtonElement} */
export const calcBtn = document.getElementById("calc");
/** The element in which results should be displayed.
 * @type {HTMLElement} */
export const resultElt = document.getElementById("results");

//TODO some kind of graceful error message if any of the necessary elements can't be found or the structure of the document is off? Not super critical, especially for such a small project, but may be useful to make sure I don't break anything later.
