/**
 * The controller and entry point for the Hatchling Probability Calculator. Sets up event listeners for HatchCalcView and populates its form fields. Coordinates data transfer between the view and the models HatchCalcModel and FRdata.
 * @module HatchCalcController
 * @requires module:HatchCalcModel
 * @requires module:HatchCalcView
 * @requires module:FRdata
 * @requires module:DOMutils
 * @author egad13
 * @version 0.0.1
 */

import * as HC from "./model.js";
import * as V from "./view.js";
import { eyes, breeds, colours, areBreedsCompatible, genesForBreed } from "../frdata.js";
import { triggerEvt, createElt, textColourForBg } from "../domutils.js";


/////////////////////////////////////////////////////
// CLASSES
/////////////////////////////////////////////////////

/** Represents one dragon's traits. Used to translate {@link module:HatchCalcView.DragonSelects} objects into data that {@link module:HatchCalcModel.getHatchlingReport} understands. */
class DragonTraits {
	/** Convert a collection of select elements describing a dragon into a structured object containing their current values.
	 * @param {module:HatchCalcView.DragonSelects} selects A collection of form elements to convert. */
	constructor(selects) {
		/** The dragon's breed. Index of a breed in {@link module:FRdata.breeds}.
		 * @type {number} */
		this.breed = selects.breed.value;
		/** The dragon's eye type. Index of an eye type in {@link module:FRdata.eyes}.
		 * @type {number|undefined} */
		this.eye = selects.eye?.value;
		/** The dragon's gender. Either "m" for "male" or "f" for "female".
		 * @type {"m"|"f"|undefined} */
		this.gender = selects.gender?.value;

		/** The dragon's colours, organized by slot. Indexes in {@link module:FRdata.colours}. Object structure: `{ primary: number, secondary: number, tertiary: number }`
		 @type {{primary:number, secondary:number, tertiary:number}} */
		this.colour = {
			primary: selects.colour.primary.value,
			secondary: selects.colour.secondary.value,
			tertiary: selects.colour.tertiary.value
		};
		/** The dragon's genes, organized by slot. Indexes in {@link module:FRdata.genes.primary}, {@link module:FRdata.genes.secondary}, {@link module:FRdata.genes.tertiary}. Object structure: `{ primary: number, secondary: number, tertiary: number }`
		 * @type {{primary:number, secondary:number, tertiary:number}} */
		this.gene = {
			primary: selects.gene.primary.value,
			secondary: selects.gene.secondary.value,
			tertiary: selects.gene.tertiary.value
		};
	}
}


/////////////////////////////////////////////////////
// ADD EVENT HANDLERS
/////////////////////////////////////////////////////

V.calcBtn.addEventListener("click", () => {
	const report = HC.getHatchlingReport(
		new DragonTraits(V.parent1),
		new DragonTraits(V.parent2),
		new DragonTraits(V.goal)
	);
	console.log(report);
	V.resultElt.innerHTML = HC.formatHatchlingReport(report);
});

// Breed dropdowns - cause gene dropdowns to repopulate on change.
// Closure here because prevX variables and repopulateGenes aren't relevant anywhere else
(function () {
	let prevP1, prevP2, prevH;

	/** Repopulates a dragon's gene dropdowns based on its current breed.
	 * @param {V.DragonSelects} dragon
	 * @param {number} prevBreed */
	function repopulateGenes(dragon, prevBreed) {
		const breed = (dragon.breed.value !== "any" ? dragon.breed.value : undefined);
		if (breed && areBreedsCompatible(breed, prevBreed)) {
			return;
		}

		const isHatch = dragon.isHatchling();

		for (const [slot, dropdown] of Object.entries(dragon.gene)) {
			const oldGene = (dropdown.options.length === 0 ? -1 : dropdown.value);
			let oldGeneIdx = undefined, defaultIdx = 0;

			for (let i = dropdown.options.length - 1; i >= (isHatch ? 1 : 0); i--) {
				dropdown.remove(i);
			}

			for (const gene of genesForBreed(slot, breed)) {
				if (gene.index == oldGene) {
					oldGeneIdx = dropdown.length;
				}
				else if (!isHatch && gene.name === "Basic") {
					defaultIdx = dropdown.length;
				}
				dropdown.add(createElt("option", { value: gene.index, text: gene.name }));
			}
			dropdown.options[oldGeneIdx ?? defaultIdx].selected = true;
		}
	}

	V.parent1.breed.addEventListener("focus", (evt) => { prevP1 = evt.target.value });
	V.parent2.breed.addEventListener("focus", (evt) => { prevP2 = evt.target.value });
	V.goal.breed.addEventListener("focus", (evt) => { prevH = evt.target.value });

	V.parent1.breed.addEventListener("change", (evt) => {
		repopulateGenes(V.parent1, prevP1);
		prevP1 = evt.target.value;
	});
	V.parent2.breed.addEventListener("change", (evt) => {
		repopulateGenes(V.parent2, prevP2);
		prevP2 = evt.target.value;
	});
	V.goal.breed.addEventListener("change", (evt) => {
		repopulateGenes(V.goal, prevH);
		prevH = evt.target.value;
	});
})();


/////////////////////////////////////////////////////
// POPULATE DROPDOWNS
/////////////////////////////////////////////////////

// Hatchling eye type
for (let i = 0; i < eyes.length; i++) {
	V.goal.eye.add(createElt("option", { value: i, text: eyes[i].name }));
}

// Breeds
for (const elt of [V.parent1.breed, V.parent2.breed, V.goal.breed]) {
	const modern = createElt("optgroup", { label: "Modern" }),
		ancient = createElt("optgroup", { label: "Ancient" });

	for (let i = 0; i < breeds.length; i++) {
		const opt = createElt("option", { value: i, text: breeds[i].name });
		if (breeds[i].type === "M") {
			modern.append(opt);
		} else {
			ancient.append(opt);
		}
	}

	elt.append(modern, ancient);
}

// Colours
for (const elt of [...Object.values(V.parent1.colour), ...Object.values(V.parent2.colour), ...Object.values(V.goal.colour)]) {
	for (let i = 0; i < colours.length; i++) {
		elt.add(createElt("option", {
			value: i, text: colours[i].name,
			style: `background:#${colours[i].hex};color:#${textColourForBg(colours[i].hex)}`
		}));
	}
}

// Genes
triggerEvt(V.parent1.breed, "change");
triggerEvt(V.parent2.breed, "change");
triggerEvt(V.goal.breed, "change");
