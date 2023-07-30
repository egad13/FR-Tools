
/** A number of generally useful functions. */
var Util = Util || (function(){

	// Some aliases/shorthands for basic dom searching/manipulation

	/** Gets a dom element using its id. */
	function get(id){ return document.getElementById(id); }

	/** Gets an array of dom elements with the given class. */
	function getClz(clz){ return document.getElementsByClassName(clz); }

	/** Gets a dom element using a query string */
	function query(str){ return document.querySelector(str); }

	/** Gets an array of dom elements using a query string */
	function queryAll(str){ return document.querySelectorAll(str); }

	/** Gets the selected <option> of the <select> with the given id. */
	function chosenOp(id){
		const e = get(id);
		return e.options[e.selectedIndex];
	}

	/** Creates a dom element and assigns to it all the properties in props*/
	function createElt(tag, props) {
		return Object.assign(document.createElement(tag), props);
	}

	// Other miscellaneous useful functions

	/** Like Array.map(), but for object literals; ie, performs the given function on all its properties. If the given object has child object literals, it will recursively apply the function to the children objects' properties too.
	 * @param {object} obj The object whose properties to perform the function on.
	 * @param {function} func The function to apply to the properties.*/
	// TODO the check to see if a value is itself an object literal returns true for functions. Figure out if there's a brief way to make it not do that.
	function mapObj(obj, func){
		return Object.fromEntries(
			Object.entries(obj).map(([k, v]) =>
				[k, (Object.is(v.constructor, Object)) ? mapObj(v, func) : func(v)]
			)
		);
	}

	/** Trigger a standard event on an element. */
	function triggerEvt(elt, evtName){
		const evt = new Event(evtName, { view: window, bubbles: true, cancelable: true });
		elt.dispatchEvent(evt);
	}

	/** Assign a standard event handler to an element. */
	function addEvt(elem, type, handler){
		elem.addEventListener(type, handler, ((type == 'touchstart' || type == 'mousewheel') ? { passive: true } : false));
	}

	/** Determines whether text displayed on the given (hex) background
	* colour should be white or black in order to be easiest to read. */
	function textColourForBg(color) {
		var r, g, b, hsp;

		// Convert to RGB
		color = +("0x" + color);
		r = color >> 16;
		g = color >> 8 & 255;
		b = color & 255;

		// HSP equation from http://alienryderflex.com/hsp.html
		hsp = Math.sqrt(
			0.299 * (r * r) +
			0.587 * (g * g) +
			0.114 * (b * b)
		);

		// Using the HSP value as the light/dark threshold, determine
		// whether text on this bg colour should be white or black.
		if (hsp>110) {
			return "#000";
		}
		return "#fff";
	}

	return {

		get: get,
		getClz: getClz,
		query: query,
		queryAll: queryAll,
		chosenOp: chosenOp,
		createElt: createElt,
		mapObj: mapObj,
		triggerEvt: triggerEvt,
		addEvt: addEvt,
		textColourForBg: textColourForBg

	};

}());
