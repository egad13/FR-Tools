
/** The breeding probability calculator itself. Relies on the FRdata and Utils classes being available.*/
var HatchCalc = HatchCalc || (function(){
	
	/** Given a probability of an outcome and an array of numbers of attempts,
	* returns a table of the probability of getting at least one success in
	* each of the numbers of attempts. */
	function chanceTable(prob, steps){
		lossProb = 1-prob;
		result = [];
		for (var x of steps){
			result.push([x, 1-(lossProb**x)]);
		}
		return result;
	}
	
	/** TODO write this doc comment */
	// TODO split this into several dedicated functions for my own sanity, actually
	function hatchlingProbability(params){
		// TODO error checking for EVERYTHING
		
		var prob = {
			err: [],
			
			colours: 1,
			breed: 1,
			//genes: 1,
			eye: 1,
			overall: 1
		};
		
		// breed probability
		if ( !FRdata.areBreedsCompatible(params.p1.breed, params.p2.breed) ){
			prob.err.push("Incompatible parent breeds. Moderns can breed with any other modern; ancients can breed with the same species of ancient.");
		}
		if (params.h.breed !== "any"){
			if (params.h.breed !== params.p1.breed && params.h.breed !== params.p2.breed){
				prob.err.push("Hatchling breed is not one of the parents' breeds.");
			} else {
				prob.breed = FRdata.calcRarityProb(
					FRdata.breeds,
					params.p1.breed,
					params.p2.breed,
					params.h.breed
				);
				prob.overall *= prob.breed;
			}
		}
		
		// eye probability
		if (params.h.eye !== "any"){
			prob.eye = FRdata.eyes[params.h.eye].probability;
			prob.overall *= prob.eye;
		}
		
		// colour probability
		// TODO accept a colour RANGE from the hatchling
		var denominator = 1;
		for (const slot of Object.keys(params.h.colours)) {
			if (params.h.colours[slot] !== "any"){
				// error checking.
				if (!FRdata.isColourInRange(
						params.p1.colours[slot],
						params.p2.colours[slot],
						params.h.colours[slot]
					)){
					prob.err.push(`Hatchling's ${slot} colour is not within the range of the parents' ${slot} colours.`);
				} else {
					denominator *= FRdata.colourRangeLength(params.p1.colours[slot], params.p2.colours[slot]);
				}
			}
		}
		prob.colours = 1/denominator;
		prob.overall *= prob.colours;
		
		
		//genes probability
		prob.genes = 1;
		for (const slot of Object.keys(params.h.genes)) {
			if (params.h.genes[slot] !== "any"){
				if (params.h.genes[slot] !== params.p1.genes[slot] && params.h.genes[slot] !== params.p2.genes[slot]){
					prob.err.push(`Hatchling ${slot} gene is not one of the parents' ${slot} genes.`);
				} else {
					prob.genes *= FRdata.calcRarityProb(
						FRdata.genes[slot],
						params.p1.genes[slot],
						params.p2.genes[slot],
						params.h.genes[slot]
					);
				}
			}
		}
		prob.overall *= prob.genes;
		
		// table of the chance of hatching the goal within X eggs.
		prob.eggtable = chanceTable(prob.overall, [1, 5, 10, 20, 50, 100]);
		
		// TODO try to figure out a way of making a chance table for number of NESTS as well.
		//const nestSame = Math.ceil(colFrac / FRdata.avgEggsSameBreed);  // TODO incl. genes, breeds, eyes
		//const nestDiff = Math.ceil(colFrac / FRdata.avgEggsDiffBreed);  // TODO incl. genes, breeds, eyes
		
		//in prob:
			// nests: [nestSame, nestDiff]
		
		return prob;
	}


	return {
		
		hatchlingProbability: hatchlingProbability
		
	};

}());
