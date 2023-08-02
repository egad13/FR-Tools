# FR Hatchling Probability Calculator

This is a tool to help expedite a tedious task for players of [Flight Rising](https://www1.flightrising.com/): planning out breeding projects.

Input the colours, genes, and other traits of a pair of parents and a hatchling you hope to get from them, and instantly receive a detailed report telling you how likely that pair is to produce that hatchling! Save yourself ages of difficult math trying to gauge if a pair of dragons will spit out the hatchling you want within your lifetime and get back to the fun stuff.

## Deployments

**The latest version of this project is live and usable on GitHub Pages! [Click here to try it](https://egad13.github.io/FR-Hatchling-Probability/).**




## Road Map

* *Colour ranges in the goal:* Pick a range for each of the Hatchling's colours and calculate the probability of getting any colour in that range instead.
* *Auto-fill:* Copy and paste the contents of a dragon's Physical Attributes tab into a box, hit a button, and have the associated parent section filled for you automatically.
* *Save your progress:* Generating a report will also generate a custom URL, which you can bookmark and return to to have all the same inputs filled for you already.

## For Developers

One of the main drivers behind this project is the `FRdata` module, which provides data on Flight Rising's colours, breeds, genes, and more, as well as a suite of useful functions for asking questions about and comparing that data. If you're making your own Flight Rising related tools, it may be especially useful to you. Check out the docs and use it however you like.

```js
// In an ES6 module:
import * as FRdata from "path/to/frdata.js";

// In vanilla JS:
import("path/to/frdata.js").then((FRdata) => {
	// do stuff with FRdata in here
});
```

Because this project uses ES6 Modules, you can't locally test just by opening the files in a browser. You'll need to run a local testing server. [MDN has a guide on several methods of doing this](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server).

One of the easiest ways, in my opinion, is to use Python's `http.server` module:
```bash
python -m http.server

# on windows, try:
python.exe -m http.server
```

## License

This project is licensed under the terms of the MIT License - see [LICENSE.md](https://github.com/egad13/FR-Hatchling-Probability/blob/main/LICENSE) file for details
