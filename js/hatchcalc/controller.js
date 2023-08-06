/**
 * The controller and entry point for the Hatchling Probability Calculator. Sets up event listeners for the view and populates its form fields. Coordinates data transfer between the view and the model.
 * @module hatchcalc
 * @requires module:hatchcalc/model
 * @requires module:hatchcalc/view
 * @requires module:frdata
 * @requires module:domutils
 * @author egad13
 * @version 0.0.1
 */

import * as V from "./view.js";
import * as HC from "./model.js";
import * as FR from "../frdata.js";
import { triggerEvt, createElt, textColourForBg } from "../domutils.js";


/////////////////////////////////////////////////////
// ADD EVENT HANDLERS
/////////////////////////////////////////////////////

V.calcBtn.addEventListener("click", () => {
	const report = HC.getHatchlingReport(
		V.parent1.getValues(), V.parent2.getValues(), V.goal.getValues()
	);
	console.log(report);
	V.displayReport(report);
});

// Breed dropdowns - cause gene dropdowns to repopulate on change
// Closure here because prevX variables and repopulateGenes aren't relevant anywhere else
(function () {
	let prevP1, prevP2, prevH;

	/** Repopulates a dragon's gene dropdowns based on its current breed.
	 * @param {module:hatchcalc/view~DragonFields} dragon
	 * @param {number} prevBreed */
	function repopulateGenes(dragon, prevBreed) {
		const breed = (dragon.breed.value !== "any" ? dragon.breed.value : undefined);
		if (breed && FR.areBreedsCompatible(breed, prevBreed)) {
			return;
		}

		const isHatch = dragon instanceof V.GoalFields;

		for (const [slot, dropdown] of Object.entries(dragon.gene)) {
			const oldGene = (dropdown.options.length === 0 ? -1 : dropdown.value);
			let oldGeneIdx = undefined, defaultIdx = 0;

			for (let i = dropdown.options.length - 1; i >= (isHatch ? 1 : 0); i--) {
				dropdown.remove(i);
			}

			for (const gene of FR.genesForBreed(slot, breed)) {
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
for (let i = 0; i < FR.eyes.length; i++) {
	V.goal.eye.add(createElt("option", { value: i, text: FR.eyes[i].name }));
}

// Breeds
for (const elt of [V.parent1.breed, V.parent2.breed, V.goal.breed]) {
	const modern = createElt("optgroup", { label: "Modern" }),
		ancient = createElt("optgroup", { label: "Ancient" });

	for (let i = 0; i < FR.breeds.length; i++) {
		const opt = createElt("option", { value: i, text: FR.breeds[i].name });
		if (FR.breeds[i].type === "M") {
			modern.append(opt);
		} else {
			ancient.append(opt);
		}
	}

	elt.append(modern, ancient);
}

// Colours
for (const elt of [...Object.values(V.parent1.colour), ...Object.values(V.parent2.colour), ...Object.values(V.goal.colour), ...Object.values(V.goal.colour_range)]) {
	for (let i = 0; i < FR.colours.length; i++) {
		elt.add(createElt("option", {
			value: i, text: FR.colours[i].name,
			style: `background:#${FR.colours[i].hex};color:#${textColourForBg(FR.colours[i].hex)}`
		}));
	}
}

// Genes
triggerEvt(V.parent1.breed, "change");
triggerEvt(V.parent2.breed, "change");
triggerEvt(V.goal.breed, "change");
