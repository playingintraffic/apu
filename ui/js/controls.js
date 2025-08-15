/*
    This file is part of APU (Animation & Prop Utility) and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don"t be that guy...
*/

/**
 * Handles the hotbar buttons for rotating the prop preview.
 */
export class Controls {
    /**
     * @param {Object} menu_instance - The menu system this links to.
     */
    constructor(menu_instance) {
        this.menu_instance = menu_instance;
        this.build_hotbar();
        this._bind_listeners();
    }

    /**
     * Adds the rotate buttons to the page.
     */
    build_hotbar() {
        const content = `
            <div id="hotbar_controls">
                <button id="hotbar_btn" class="hotbar_btn" data-rotate="left">Rotate Left</button>
                <button class="hotbar_btn" data-rotate="right">Rotate Right</button>
                <button class="hotbar_btn" data-rotate="flip">Flip Rotation</button>
                <button class="hotbar_btn" data-rotate="reset">Reset Rotation</button>
            </div>
        `;
        $("#hotbar_container").html(content);
    }

    /**
     * Binds all event listeners.
     * @private
     */
    _bind_listeners() {
        $(document).on('click', '.hotbar_btn', (e) => {
            const direction = $(e.currentTarget).data('rotate');
            if (direction) {
                $.post(`https://${GetParentResourceName()}/rotate_preview`, JSON.stringify({ direction }));
            }
        });
    }
}
