
/** The breeding probability calculator itself. Relies on the FRdata and Utils classes being available.*/
var Calc = Calc || (function(){

	/** Returns the length of the range between two colours on the FR
	* colour wheel - ie, the shortest distance between the two colours
	* on the circular colour array, including both input colours. */
	function colourRange(one, two) {
		//find the positions of the colours in the array
		const first = FRdata.colours.findIndex((o) => o[0] === one);
		const last = FRdata.colours.findIndex((o) => o[0] === two);
		
		//absolute distance between the colours
		const absDist = Math.abs(first - last);
		
		// +1 bc the range is inclusive, and two of the same colour have a range of 1.
		return 1 + Math.min(FRdata.colours.length - absDist, absDist);
	}

	/** Takes an object of the following format:

	{ colours: [["c1","c2"], ["c1","c2"], ["c1","c2"]],
	genes: [["g1","g2"], ["g1","g2"], ["g1","g2"]],
	breeds: ["b1", "b2"],
	eye: "type" }

	And spits out various probabilities for hatching the desired hatchling in the following format:

	{ colours: prob,
	genes: ???
	breed: ???
	eye: ???
	overall: prob,
	nests: [same, diff] }

	*/
	function hatchlingProbability(params){
		var temp;
		
		// correct colour probability
		var colProb = 1, colFrac = 1;
		for (var i of params["colours"]){
			temp = colourRange(i[0],i[1]);
			colFrac *= temp;
			colProb *= 1/temp;
		}
		
		//TODO genes, breeds, eyes
		
		const overallProb = 1 * colProb; // * geneProb * breedProb * eyeProb;
		const nestSame = Math.ceil(colFrac / FRdata.avgEggsSameBreed);  // TODO incl. genes, breeds, eyes
		const nestDiff = Math.ceil(colFrac / FRdata.avgEggsDiffBreed);  // TODO incl. genes, breeds, eyes
		
		return {
			colours: colProb,
			overall: overallProb,
			nests: [nestSame, nestDiff]
		};
	}


	// TODO lookup table for the probability of genes in a pair

	// TODO lookup table for the probability of breeds in a pair

	// TODO eye type probability


	return {
		
		hatchlingProbability: hatchlingProbability
		
	};

}());
