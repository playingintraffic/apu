/*
    This file is part of APU (Animation & Prop Utility) and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don’t be that guy...
*/

import { Menu } from './js/menu.js';
import { Controls } from './js/controls.js';
import { Output } from './js/output.js';

let menu, controls, output;

/**
 * Handles incoming NUI messages to open or close the utility.
 * @param {MessageEvent} event - The message event from NUI.
 */
window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || !data.action) return;

    /**
     * Initializes the menu, output display, and controls when opened.
     */
    if (data.action === "open") {
        $("#menu_container").empty();
        $("#output_container").empty();
        $("#hotbar_container").empty();

        menu = new Menu("#menu_container");
        output = new Output("#output_container", menu);
        controls = new Controls(menu);
    }

    /**
     * Destroys instances and clears containers when closed.
     */
    if (data.action === "close") {
        menu = null;
        controls = null;
        output = null;

        $("#menu_container").empty();
        $("#output_container").empty();
        $("#hotbar_container").empty();

        $(document).off("keydown.apu");
    }
});
