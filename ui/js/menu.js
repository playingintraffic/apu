/*
    This file is part of APU (Animation & Prop Utility) and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don’t be that guy...
*/

/**
 * Handles the UI menu for entering animation and prop data.
 * Builds the form, handles input, and collects all values for output.
 */
export class Menu {
    /**
     * Static list of animation input fields.
     * @type {Array<{ id: string, label: string, data_type: string, placeholder?: string }>}
     */
    static animation_params = [
        { id: 'dict', label: 'Dictionary:', data_type: 'string', placeholder: 'anim_dictionary' },
        { id: 'anim', label: 'Animation:', data_type: 'string', placeholder: 'anim_name' },
        { id: 'flags', label: 'Flags:', data_type: 'number', placeholder: '49' },
        { id: 'duration', label: 'Duration:', data_type: 'number', placeholder: '5000' },
        { id: 'freeze', label: 'Freeze:', data_type: 'boolean' },
        { id: 'continuous', label: 'Continuous:', data_type: 'boolean' },
        { id: 'blend_in', label: 'Blend In Speed:', data_type: 'number', placeholder: '8.0' },
        { id: 'blend_out', label: 'Blend Out Speed:', data_type: 'number', placeholder: '8.0' },
        { id: 'playback', label: 'Playback Rate:', data_type: 'number', placeholder: '0' },
        { id: 'lock_x', label: 'Lock X:', data_type: 'boolean' },
        { id: 'lock_y', label: 'Lock Y:', data_type: 'boolean' },
        { id: 'lock_z', label: 'Lock Z:', data_type: 'boolean' }
    ];

    /**
     * Static list of prop input fields.
     * @type {Array<{ id: string, label: string, data_type: string, placeholder?: string }>}
     */
    static prop_params = [
        { id: 'model', label: 'Model Hash:', data_type: 'string', placeholder: 'prop_model' },
        { id: 'bone', label: 'Bone Index:', data_type: 'number', placeholder: '57005' },
        { id: 'coords_x', label: 'X Pos:', data_type: 'number', placeholder: '0.0' },
        { id: 'coords_y', label: 'Y Pos:', data_type: 'number', placeholder: '0.0' },
        { id: 'coords_z', label: 'Z Pos:', data_type: 'number', placeholder: '0.0' },
        { id: 'rotation_x', label: 'X Rot:', data_type: 'number', placeholder: '0.0' },
        { id: 'rotation_y', label: 'Y Rot:', data_type: 'number', placeholder: '0.0' },
        { id: 'rotation_z', label: 'Z Rot:', data_type: 'number', placeholder: '0.0' },
        { id: 'use_soft', label: 'Use Soft Pinning:', data_type: 'boolean' },
        { id: 'is_ped', label: 'Is Ped Attached:', data_type: 'boolean' },
        { id: 'rot_order', label: 'Rotation Order:', data_type: 'number', placeholder: '1' },
        { id: 'sync_rot', label: 'Sync Rotation:', data_type: 'boolean' }
    ];

    /**
     * Creates a new menu instance and initializes the UI.
     * @param {HTMLElement|string} container - The DOM element or selector to render the menu into.
     */
    constructor(container) {
        this.$container = $(container);
        this.build();
        this._bind_listeners();
    }

    /**
     * Builds the main menu structure and injects it into the container.
     */
    build() {
        const anim_fields = Menu.animation_params.map(param => this.build_input(param)).join("");

        const html = `
            <div class="menu_section">
                <div class="menu_header" data-target="#anim_fields">Animation Settings</div>
                <div class="form_group hidden" id="anim_fields">${anim_fields}</div>
            </div>

            <div class="menu_section">
                <div class="menu_header" data-target="#prop_fields_container">Prop Settings</div>
                <button id="add_prop_btn" class="hidden" style="margin-left: 1vh; margin-bottom: 0.5vh;">+ Add Prop</button>
                <div id="prop_fields_container" class="hidden"></div>
            </div>

            <div class="menu_section">
                <div class="menu_header" data-target="#callback_field">Callback Function</div>
                <div class="form_group hidden no_margin" id="callback_field">
                    <label>
                        <span>Callback Lua Code:</span>
                        <textarea id="callback_code" placeholder='print("animation finished")' rows="6"></textarea>
                    </label>
                </div>
            </div>

            <div class="form_actions">
                <button id="generate_btn">Generate Code</button>
            </div>
        `;

        this.$container.html(html);
    }

    /**
     * Builds an individual input field.
     * @param {{ id: string, label: string, data_type: string, placeholder?: string }} param - Field config object.
     * @param {string} [prefix=""] - Optional ID prefix (used for props).
     * @returns {string} - HTML string representing the input.
     */
    build_input({ id, label, data_type, placeholder }, prefix = "") {
        const full_id = prefix + id;
        if (data_type === 'boolean') {
            return `<label><span>${label}</span><input type="checkbox" id="${full_id}" /></label>`;
        } else {
            return `<label><span>${label}</span><input type="${data_type}" id="${full_id}" placeholder="${placeholder || ''}" /></label>`;
        }
    }

    /**
     * Adds a new prop block to the form.
     */
    add_prop() {
        const index = this.$container.find('.prop_block').length;
        const prop_html = `
            <div class="prop_block form_group" data-index="${index}">
                ${Menu.prop_params.map(param => this.build_input(param, `prop_${index}_`)).join("")}
                <button class="remove_prop_btn">Remove</button>
            </div>
        `;
        this.$container.find('#prop_fields_container').append(prop_html);
    }

    /**
     * Binds all menu-related DOM event listeners.
     * @private
     */
    _bind_listeners() {
        $(document).off("keydown.apu");
        $(document).on("keydown.apu", (e) => {
            if (e.key === "Escape") {
                $("#menu_container").empty();
                $("#hotbar_container").empty();
                $("#output_container").empty();
                $.post(`https://${GetParentResourceName()}/close_ui`);
            }
        });

        this.$container.off("click");

        this.$container.on("click", ".menu_header", (e) => {
            const target = $(e.currentTarget).data("target");
            const $target = $(target);
            $target.toggleClass("hidden");

            if (target === "#prop_fields_container") {
                $("#add_prop_btn").toggleClass("hidden");
            }
        });

        this.$container.on("click", "#add_prop_btn", () => this.add_prop());

        this.$container.on("click", ".remove_prop_btn", function () {
            $(this).closest(".prop_block").remove();
        });
    }

    /**
     * Reads all form fields and returns the data in structured format.
     * @returns {Object} - All entered data.
     */
    get_form_data() {
        const data = {};

        Menu.animation_params.forEach(param => {
            const $el = this.$container.find(`#${param.id}`);
            data[param.id] = (param.data_type === 'boolean') ? $el.is(':checked') : $el.val();
        });

        data.props = [];

        this.$container.find(".prop_block").each((i, el) => {
            const $el = $(el);
            const prop = {};
            Menu.prop_params.forEach(param => {
                const $input = $el.find(`#prop_${i}_${param.id}`);
                prop[param.id] = (param.data_type === 'boolean') ? $input.is(':checked') : $input.val();
            });
            data.props.push(prop);
        });

        data.callback_code = this.$container.find(`#callback_code`).val() || '';
        return data;
    }
}
