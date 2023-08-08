/*
Adds HTML shared by all pages (header, navbar, footer) to the document, sets up the event
listener for toggling the site theme. IIFE is to avoid cluttering the global namespace.
Add as a regular script to the <head> of every page.

author: egad13
version: 0.0.2
*/

// Toggle site theme, if necessary
if (localStorage.getItem("darkmode") == "true") {
	document.querySelector("html").classList.toggle("dark");
}

// Set up and add common header, navbar, footer
(async function () {
	// A $ in the template will be replaced with the base url for this site
	const template = `
		<header>
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

	const prep_template = prepCommonHTML();
	var done = false;

	if (document.readyState !== "loading") {
		setupCommonHTML();
	} else {
		document.addEventListener("readystatechange", e => {
			if (document.readyState !== "loading") {
				setupCommonHTML();
			}
		});
	}

	function setupCommonHTML() {
		prep_template.then(html => {
			if (done) { return; }
			done = true;
			// add prepared template html
			document.body.prepend(...html.querySelectorAll("header,nav"));
			document.body.append(html.querySelector("footer"));
		})
		.catch(err => console.error(err));
	}

	async function prepCommonHTML() {
		const x = window.location;
		// So I don't have to change the link replacement when pushing remote / testing local
		const base_url =
			(x.hostname === "localhost") ? x.origin
			: x.origin + x.pathname.slice(0, x.pathname.indexOf("/", 1));
		const window_href = x.origin + x.pathname;

		let html = document.createElement("p");
		html.innerHTML = template.replace(/href="\$/g, `href="${base_url}/`);

		let currentPageName;
		for (const a of html.querySelectorAll("a")) {
			if (a.href === window_href || `${a.href}index.html` === window_href) {
				currentPageName = a.dataset.n ?? a.innerText;
				a.className = "current-page";
			}
			delete a.dataset.n
		}
		html.querySelector("h1").innerText = currentPageName;
		html.querySelector("#theme").addEventListener("click", e => {
			const el = document.querySelector("html");
			el.classList.toggle("dark");
			localStorage.setItem("darkmode", el.classList.contains("dark"));
		});

		return html;
	}

})();
