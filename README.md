# FR Hatchling Probability Calculator

This is a tool to help expedite a tedious task for players of [Flight Rising](https://www1.flightrising.com/): planning out breeding projects.

Input the colours, genes, and other traits of a pair of parents and a hatchling you hope to get from them, and instantly receive a detailed report telling you how likely that pair is to produce that hatchling! Save yourself ages of difficult math trying to gauge if a pair of dragons will spit out the hatchling you want within your lifetime and get back to the fun stuff.

## Usage

**The latest version of this project is live and usable on GitHub Pages! [Click here to try it](https://egad13.github.io/FR-Hatchling-Probability/).**

## Road Map

* *Code refactoring:* Re-organize the modules for the hatchling calculator and how they function for better semantics and efficiency. Decide on a set of best practices and follow them. Figure out a better directory structure. 
* *Auto-fill:* Copy and paste the contents of a dragon's Physical Attributes tab into a box, hit a button, and have the associated parent section filled for you automatically.
* *Hatchling Auto-fill:* Provide a link to a scry, hit a button, and have the hatchling section of the form filled for you automatically.
* *Save your progress:* Generating a report will also generate a custom URL, which you can bookmark and return to to have all the same inputs filled for you already.

## For Developers

Code documentation can be viewed [Here](https://egad13.github.io/FR-Hatchling-Probability/docs/).

Keep in mind that the code for these tools is currently a ***working prototype, and will undergo major changes*** in the future.

The main driver behind this tool is the [`frdata`](https://github.com/egad13/FR-Hatchling-Probability/blob/main/js/frdata.js) module, which provides data on Flight Rising's colours, breeds, genes, and more, as well as a suite of useful functions for asking questions about and comparing that data. If you're making your own Flight Rising related tools, it may be especially useful to you. Check out the docs and use it however you like.

```js
// In an ES6 module:
import * as FRdata from "path/to/frdata.js";

// In vanilla JS:
import("path/to/frdata.js").then((FRdata) => {
	// do stuff with FRdata in here
});
```

Because this project uses ES6 Modules, you can't locally test it just by opening the files in a browser. You'll need to run a local HTTP server. [MDN has a guide on several methods of doing this](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server).

One of the easiest ways is to use Python's `http.server` module right from the command line:

```bash
python -m http.server

# on windows, try:
python.exe -m http.server
```

Or, to test without having to deal with browser caching, you could run [this python script I wrote that serves a non-caching HTTP server](https://gist.github.com/egad13/456511ef2cd80e2fa60baee6da41f8ce).

## License

This project is licensed under the terms of the MIT License - see [LICENSE](https://github.com/egad13/FR-Hatchling-Probability/blob/main/LICENSE) file for details
