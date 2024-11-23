import { registerComponents } from './lib/customElementsLoader.js'

function main() {
    // Register components on page load
    window.addEventListener('DOMContentLoaded', () => {
        registerComponents()
    });
}


main()