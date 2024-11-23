export async function registerComponents() {
	const componentFiles = await _fetchComponentList(); // List of component files
	for (const componentPath of componentFiles) {
		// Extract the path and filename
		const pathSegments = componentPath.split("/");
		const filenameWithExt = pathSegments.pop(); // Get the last segment (e.g., button.html)
		const filename = filenameWithExt.replace(".html", ""); // Remove .html extension
		const path = pathSegments.length > 0 ? pathSegments.join("-") : ""; // Join the path segments with '-'

		// Construct the custom element name
		const customElementName = path
			? `my-${path}-${filename}`
			: `my-${filename}`;

		// Fetch the component HTML
		const response = await fetch(`../components/${componentPath}.html`);
		if (!response.ok) {
			console.error(`Failed to fetch component: ${componentPath}`);
			continue;
		}
		const htmlText = await response.text();

		// Parse the HTML file and append styles
		// Dynamically calculate relative paths for stylesheets
		const relativeDepth = pathSegments.length; // Number of subfolders
		const relativePrefix = "../".repeat(relativeDepth + 1); // Adjust relative paths
		console.log(relativePrefix);
		// Parse the HTML file and append dynamically adjusted styles
		const template = document.createElement("template");
		template.innerHTML = `
            <link rel="stylesheet" href="${relativePrefix}css-reset.css" />
            <link rel="stylesheet" href="${relativePrefix}vanilla-tailwind.css" />
            <link rel="stylesheet" href="${relativePrefix}globals.css" />
            ${htmlText}
        `;
		console.log(template.innerHTML);

		// Define the custom element class
		class CustomElement extends HTMLElement {
			constructor() {
				super();
				this.attachShadow({ mode: "open" });
				this.shadowRoot.appendChild(template.content.cloneNode(true));
			}
		}

		// Define the custom element
		customElements.define(customElementName, CustomElement);
	}
}

async function _fetchComponentList() {
	try {
		// Fetch the JSON file
		const response = await fetch("../components/index.json"); // Adjust the path as needed
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Parse the JSON
		const data = await response.json();
		console.log("Fetched components:", data.components);
		return data.components;
	} catch (error) {
		console.error("Error fetching components:", error);
		return [];
	}
}
