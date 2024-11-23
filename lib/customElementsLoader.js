async function registerComponents() {
    const componentFiles = await _fetchComponentList(); // List of component files
    // console.log(componentFiles)
    // console.log('Current Path:', window.location.href);
    // console.log("components")
    for (const componentName of componentFiles) {
        const response = await fetch(`../components/${componentName}.html`);
        const htmlText = await response.text();
        // Parse the HTML file
        const template = document.createElement('template');
        template.innerHTML = htmlText;
        class CustomElement extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
                this.shadowRoot.appendChild(template.content.cloneNode(true));
            }

        }

        // Define the custom element
        customElements.define(`my-${componentName}`, CustomElement);
    }
}

async function _fetchComponentList() {
    try {
        // Fetch the JSON file
        const response = await fetch('../components/index.json'); // Adjust the path as needed
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the JSON
        const data = await response.json();
        console.log('Fetched components:', data.components);
        return data.components;
    } catch (error) {
        console.error('Error fetching components:', error);
        return [];
    }
}

// Register components on page load
window.addEventListener('DOMContentLoaded', registerComponents);

