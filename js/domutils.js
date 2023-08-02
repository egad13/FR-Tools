/**
 * Some handy general functions and shorthands for DOM manipulation.
 * @module DOMutils
 * @author egad13
 * @version 0.0.1
 */

/////////////////////////////////////////////////////
// SHORTHANDS
/////////////////////////////////////////////////////

/** Creates a DOM element with the given `tag` and assigns to it all the properties in `props`,
 * @param {string} tag Tag name of element to create.
 * @param {Object} props Properties to assign to new element.
 * @returns {HTMLElement} */
export function createElt(tag, props) {
	return Object.assign(document.createElement(tag), props);
}

/** Trigger a standard event on an element.
 * @param {HTMLElement} element
 * @param {string} eventName */
export function triggerEvt(element, eventName) {
	const evt = new Event(eventName, { view: window, bubbles: true, cancelable: true });
	element.dispatchEvent(evt);
}


/////////////////////////////////////////////////////
// MISC FUNCTIONS
/////////////////////////////////////////////////////

/** Determines whether text placed on the given background colour should be black or
 * white for the best readability.
 * @param {string} bgHex Background colour. A non-prefixed 6-digit hex colour code.
 * @returns {string} Whichever of the hex colour codes "000" or "fff" is the easier to
 * read text colour when placed on the given background colour. */
export function textColourForBg(bgHex) {
	// Convert to RGB
	bgHex = +("0x" + bgHex);
	const r = bgHex >> 16,
		g = bgHex >> 8 & 255,
		b = bgHex & 255;

	// Perceived brightness equation from http://alienryderflex.com/hsp.html
	const perceivedBrightness = Math.sqrt(
		0.299 * (r * r) +
		0.587 * (g * g) +
		0.114 * (b * b)
	);

	if (perceivedBrightness > 110) {
		return "000";
	}
	return "fff";
}
