/*
Adds HTML shared by all pages (header, navbar, footer) to the document, sets up
the event listener for toggling the site theme. IIFE is to avoid cluttering the
global namespace.

Add as a regular script to the <head> of every page.
*/

(function() {
	const url = window.location;
	const baseUrl = (url.hostname === "localhost")
		? `http://${url.host}/FR-Tools/src`
		: url.origin + url.pathname.slice(0, url.pathname.indexOf("/", 1));
	const pageUrl = url.origin + url.pathname;

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
			| <span>Last updated: <time>?</time></span>
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
			try {
				insertLastCommitDate();
			} catch {}
		}).catch(err => console.error(err));
	}

	async function prepCommonHTML() {
		const html = document.createElement("p");
		html.innerHTML = template.replace(/href="\$/g, `href="${baseUrl}/`);

		let currentPageName;
		for (const a of html.querySelectorAll("a")) {
			if (a.href === pageUrl || `${a.href}index.html` === pageUrl) {
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

	// Sets the "last updated" section of the footer to be the date + time of
	// the last commit to either this website's repository, or the FRjs repo.
	async function insertLastCommitDate() {
		const dateRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/;
		const urls = [
			"https://api.github.com/repos/egad13/FR-Tools/commits/main",
			"https://api.github.com/repos/egad13/FRjs/commits/main"
		]
		const dates = [];

		for (const url of urls) {
			const request = await fetch(url),
				json = await request.json();
			[, year, month, day, hours, minutes, seconds] = dateRegex.exec(json.commit.author.date);
			dates.push(new Date(year, month-1, day, hours, minutes, seconds));
		}

		const recent = (dates[0].getTime() > dates[1].getTime())
			? dates[0] : dates[1];

		const timeElt = document.querySelector("footer time");
		timeElt.setAttribute("datetime", `${recent.getFullYear()}-${recent.getMonth()+1}-${recent.getDate()} ${recent.getHours()}:${recent.getMinutes()}`);
		timeElt.innerHTML = recent.toLocaleString("en-CA", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
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
