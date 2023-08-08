/**
 * Some handy general functions and shorthands for DOM manipulation.
 * @module domutils
 * @author egad13
 * @version 0.0.1
 */

/////////////////////////////////////////////////////
// SHORTHANDS
/////////////////////////////////////////////////////

/** Creates a DOM element with the given `tag` and assigns to it all the properties in `props`.
 * @param {string} tag Tag name of the element to create.
 * @param {Object} props Properties to assign to the new element.
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


