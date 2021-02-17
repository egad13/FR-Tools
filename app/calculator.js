
/** The breeding probability calculator itself. Relies on the FRdata and Utils classes being available.*/
var Calc = Calc || (function(){

	/** Returns the length of the range between two colours on the FR
	* colour wheel - ie, the shortest distance between the two colours
	* on the circular colour array, including both input colours. */
	function colourRangeLength(one, two) {
		//find the positions of the colours in the array
		const first = FRdata.colours.findIndex((o) => o[0] === one);
		const last = FRdata.colours.findIndex((o) => o[0] === two);
		
		//absolute distance between the colours
		const absDist = Math.abs(first - last);
		
		// +1 bc the range is inclusive, and two of the same colour have a range of 1.
		return 1 + Math.min(FRdata.colours.length - absDist, absDist);
	}
	
	
	/* Given three attributes p1, p2, h which have standard rarities (genes and breeds), look up and return the probability of getting a hatchling with attribute h if you nest parents with attributes p1 and p2. */
	function tableProbability(p1, p2, h, arr){
		// TODO error checking for breeds
		// TODO error checking for genes
		if (p1 == p2 && p1 == h && p2 == h) {
			return 1;
		}
		var rarity1 = arr.rarities[p1],
			rarity2 = arr.rarities[p2];
		var idx = (h == p1) ? 0 : 1;
		return FRdata.rarity_table[rarity1][rarity2][idx];
	}
	//usage for breeds: tableProbability("bogsneak", "spiral", "spiral", FRdata.breeds)
	//usage for genes:  tableProbability("basic", "contour", "basic", FRdata.genes)

	/** TODO write this doc comment */
	function hatchlingProbability(params){
		// TODO error checking
		
		var temp;
		
		// correct colour probability
		// TODO find a way to do this that isn't dumb
		// TODO error check that the h colours are within the p1-p2 range
		// TODO acceptable colour RANGE from the hatchling
		var colProb = 1, colFrac = 1;
		for (var i = 0; i < 3; i++) {
			if (params["h"].colours[i] !== "any"){
				temp = colourRangeLength(params["p1"].colours[i], params["p2"].colours[i]);
				colFrac *= temp;
			}
		}
		colProb = 1/colFrac;
		
		// breed probability
		var breedProb = 1;
		if (params["h"].breed !== "any"){
			breedProb = tableProbability(
				params["p1"].breed,
				params["p2"].breed,
				params["h"].breed,
				FRdata.breeds
			);
		}
		
		//TODO genes, breeds, eyes
		
		const overallProb = 1 * colProb * breedProb; // * geneProb * eyeProb;
		//const nestSame = Math.ceil(colFrac / FRdata.avgEggsSameBreed);  // TODO incl. genes, breeds, eyes
		//const nestDiff = Math.ceil(colFrac / FRdata.avgEggsDiffBreed);  // TODO incl. genes, breeds, eyes
		
		return {
			colours: colProb,
			overall: overallProb
			// TODO expected number of nests
			// nests: [nestSame, nestDiff]
		};
	}

	// TODO eye type probability


	return {
		
		hatchlingProbability: hatchlingProbability
		
	};

}());
