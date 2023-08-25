/*
Adds HTML shared by all pages (header, navbar, footer) to the document, sets up the event
listener for toggling the site theme. IIFE is to avoid cluttering the global namespace.
Add as a regular script to the <head> of every page.

author: egad13
version: 0.0.2
*/

(function() {
	// A $ in the template will be replaced with the base url for this site
	const template = `
		<header>
			<a id="skip-to-content" href="#main">Skip to main content</a>
			<div>
				<span>Kay's Flight Rising Tools</span>
				<h1></h1>
			</div>
			<button id="theme" title="Toggle Colour Scheme">
				<span class="sr-only">Toggle Colour Scheme</span>
			</button>
		</header>
		<nav>
			<ul>
				<li><a href="$">About</a></li>
				<li><a href="$Hatchling-Calculator/" data-n="Hatchling Probability Calculator">Hatchling Calculator</a></li>
			</ul>
		</nav>
		<footer>
			<span><a href="https://github.com/egad13/FR-Tools">Source code</a></span>
			| <span><a href="$docs">Docs</a></span>
			| <span>Last updated: <time datetime="2023-08-3">5 August 2023</time></span>
		</footer>`;

	const prepTemplate = prepCommonHTML();

	// Toggle site theme, if necessary
	if (localStorageGet("darkmode") === "true") {
		document.querySelector("html").classList.toggle("dark");
	}

	// Add common header+footer
	if (document.readyState !== "loading") {
		setupCommonHTML();
	} else {
		document.addEventListener("readystatechange", () => {
			if (document.readyState !== "loading") {
				setupCommonHTML();
			}
		});
	}

	function setupCommonHTML() {
		// eslint-disable-next-line no-func-assign
		setupCommonHTML = ()=>{}; // prevent this function from running twice
		prepTemplate.then(html => {
			document.body.prepend(...html.querySelectorAll("header,nav"));
			document.body.append(html.querySelector("footer"));
		}).catch(err => console.error(err));
	}

	async function prepCommonHTML() {
		const x = window.location;
		// So I don't have to change the link replacement when pushing remote / testing local
		const baseUrl = (x.hostname === "localhost")
			? x.origin
			: x.origin + x.pathname.slice(0, x.pathname.indexOf("/", 1));
		const windowHref = x.origin + x.pathname;

		const html = document.createElement("p");
		html.innerHTML = template.replace(/href="\$/g, `href="${baseUrl}/`);

		let currentPageName;
		for (const a of html.querySelectorAll("a")) {
			if (a.href === windowHref || `${a.href}index.html` === windowHref) {
				currentPageName = a.dataset.n ?? a.innerText;
				a.className = "current-page";
			}
			delete a.dataset.n;
		}
		html.querySelector("h1").innerText = currentPageName || "Error 404";
		html.querySelector("#theme").addEventListener("click", () => {
			const el = document.querySelector("html");
			el.classList.toggle("dark");
			localStorageSet("darkmode", el.classList.contains("dark"));
		});

		return html;
	}

	// Catches errors when getting/setting localStorage, so that if the feature is
	// unavailable for any reason the script doesn't fail to add the common HTML. Useful,
	// for example, if a user is blocking all cookies in Safari, which disables
	// localStorage altogether.
	function localStorageGet(key) {
		try {
			return localStorage.getItem(key);
		} catch (e) {
			console.error(e);
			return null;
		}
	}
	function localStorageSet(key, val) {
		try {
			localStorage.setItem(key, val);
		} catch (e) {
			console.error(e);
		}
	}
})();
