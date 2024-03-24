/*
Dynamic import map for FRjs modules.

Changes the FRjs urls based on if the environment is dev or production. Loads
a polyfill for better import map support. IIFE is to avoid cluttering the
global namespace. Add names of FRjs modules to URL params to preload them.

Add as a regular script to the <head> of every page that uses FRjs.
*/

(function() {
	const preloadNames = document.currentScript.getAttribute("preloads").split(" ");
	const url = window.location;
	const isLocal = (url.hostname === "localhost");
	const cacheBuster = `?t=${Math.floor(Date.now() / 3600000)}`; // Unix timestamp of nearest hour

	const frjsUrl = isLocal
		? `http://${url.host}/FRjs/src/`
		: "https://cdn.jsdelivr.net/gh/egad13/FRjs@1/dist/";
	const suffix = isLocal
		? ".js"
		: `.min.js${cacheBuster}`;

	const importMap = { imports: { "FRjs/": frjsUrl } };
	for (const file of preloadNames) {
		importMap.imports[`FRjs/${file}`] = `${frjsUrl}${file}${suffix}`;
	}

	// the import map itself
	const mapScript = Object.assign(document.createElement("script"), {
		type: "importmap",
		textContent: JSON.stringify(importMap)
	});

	// polyfill for better import map support
	const mapPolyfill = Object.assign(document.createElement("script"), {
		type: "text/javascript",
		async: true,
		src: "https://unpkg.com/es-module-shims@1.8/dist/es-module-shims.js"
	});

	// preloads for FRjs
	const preloads = [];
	for (const n of preloadNames) {
		preloads.push(Object.assign(document.createElement("link"), {
			rel: "modulepreload",
			href: importMap.imports[`FRjs/${n}`]
		}));
	}

	// Add all to <head>. Separate statements or else chromium complains
	document.currentScript.after(mapPolyfill);
	mapPolyfill.after(mapScript);
	mapScript.after(...preloads);
})();
