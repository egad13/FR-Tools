
/** A number of generally useful functions. */
var Util = Util || (function(){
	
	/** Gets a dom element using its id. */
	function get(id){ return document.getElementById(id); }

	/** Gets an array of dom elements with the given class. */
	function getClz(clz){ return document.getElementsByClassName(clz); }

	/** Gets the selected <option> of the <select> with the given id. */
	function chosenOp(id){
		const e = get(id);
		return e.options[e.selectedIndex];
	}

	function createElt(tag, attrs) {
		return Object.assign(document.createElement(tag), attrs);
	}

	/** A cross-browser compatible method to assign an event to an element.
	* Supports all standard events. */
	function addEvt(elem, type, handler){
		if (supportsPassive == undefined){
			var supportsPassive = false;
			try {
				var opts = Object.defineProperty({}, 'passive', {
					get: function() {
						supportsPassive = true;
					}
				});
				window.addEventListener("testPassive", null, opts);
				window.removeEventListener("testPassive", null, opts);
			} catch (e) {}
		}
		
		var ontype = "on" + type;
		
		if(elem.addEventListener){
			elem.addEventListener(type, handler, ((type == 'touchstart' || type == 'mousewheel') && supportsPassive ? { passive: true } : false));
		}
		else if(elem.attachEvent)
			elem.attachEvent(ontype, handler);
		else {
			if (elem[ontype]) {
				var prevHandler = elem[ontype];
				elem[ontype] = function() { prevHandler(); handler(); };
			}
			else
				elem[ontype] = handler;
		}
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
		chosenOp: chosenOp,
		createElt: createElt,
		addEvt: addEvt,
		textColourForBg: textColourForBg
		
	};
	
}());


