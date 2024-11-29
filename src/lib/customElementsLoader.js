let componentsPath = "./components/";

export async function registerComponents() {
	const componentFiles = await _fetchComponentList(); // List of component files
	for (const componentPath of componentFiles) {
		// Extract the path and filename
		const pathSegments = componentPath.split("/");
		const filenameWithExt = pathSegments.pop(); // Get the last segment (e.g., navbar.html)
		const filename = filenameWithExt.replace(".html", ""); // Remove .html extension
		const path = pathSegments.length > 0 ? pathSegments.join("-") : ""; // Join the path segments with '-'

		// Logic to handle foldername == filename
		let customElementName;

		if (
			pathSegments.length > 0 &&
			pathSegments[pathSegments.length - 1] === filename
		) {
			// If the last folder name matches the filename, use only the folder name
			customElementName = `my-${pathSegments.join("-")}`;
		} else if (path) {
			// Otherwise, include both path and filename
			customElementName = `my-${path}-${filename}`;
		} else {
			// For files without folders
			customElementName = `my-${filename}`;
		}

		// Fetch the component HTML
		const response = await fetch(`${componentsPath}${componentPath}.html`);
		if (!response.ok) {
			console.error(`Failed to fetch component: ${componentPath}`);
			continue;
		}
		const htmlText = await response.text();

		// Parse the HTML file and append dynamically adjusted styles
		// const relativeDepth = pathSegments.length; // Number of subfolders
		// const relativePrefix = "../".repeat(relativeDepth + 1); // Adjust relative paths

		// Define the custom element class
		class CustomElement extends HTMLElement {
			constructor() {
				super(); // Always call the parent class constructor
			}

			async connectedCallback() {
				// Grab all children with a `slot` attribute
				// Parse the HTML and inject it into the element
				const template = document.createElement("template");
				template.innerHTML = `${htmlText}`;
				const content = template.content.cloneNode(true);

				// Replace <slot> elements with children that have matching slot attributes
				const slots = content.querySelectorAll("slot");
				slots.forEach((slot) => {
					const slotName = slot.getAttribute("name");
					const replacement = this.querySelector(`[slot="${slotName}"]`);
					// console.log(replacement);
					if (replacement) {
						// Use parentNode.replaceChild for compatibility
						slot.parentNode.replaceChild(replacement.cloneNode(true), slot);
						replacement.remove();
					} else {
						// Keep default content if no replacement is provided
						const defaultText = document.createTextNode(slot.innerHTML || "");
						slot.parentNode.replaceChild(defaultText, slot);
					}
				});

				// Append the processed content to the element
				this.appendChild(content);
			}

			disconnectedCallback() {
				// Cleanup logic if needed (e.g., removing event listeners)
				// console.log(`${customElementName} removed from the DOM`);
			}
		}

		// Define the custom element
		customElements.define(customElementName, CustomElement);
		console.log(`Defined component in customElements as: ${customElementName}`);
	}
}

async function _fetchComponentList() {
	// Fetch the JSON file
	componentsPath = "./components/";
	let response = await fetch(`${componentsPath}index.json`); // Adjust the path as needed
	if (!response.ok) {
		// console.log("FUCK");
		componentsPath = "../components/";
		response = await fetch(`${componentsPath}index.json`);
	}

	// Parse the JSON
	const data = await response.json();
	console.log("Fetched component directories:", data.components);
	return data.components;
}
