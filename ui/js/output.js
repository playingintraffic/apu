/*
    This file is part of APU (Animation & Prop Utility) and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don"t be that guy...
*/

/**
 * Handles generating, displaying, copying, and testing animation code.
 */
export class Output {
    /**
     * @param {HTMLElement} container - Where to show the output.
     * @param {Object} menu_instance - Menu instance used to get form data.
     */
    constructor(container, menu_instance) {
        this.$container = $(container);
        this.menu_instance = menu_instance;
        this._bind_listeners();
    }

    /**
     * Binds all event listeners.
     * @private
     */
    _bind_listeners() {
        $(document).on('click', '#generate_btn', () => {
            const form_data = this.menu_instance.get_form_data();
            const code = this.build_code(form_data);
            this.display(code, form_data);
        });

        $(document).on("click", "#copy_code_btn", function () {
            const text = $(`#${$(this).data("target")}`).text();
            const el = document.createElement('textarea');
            el.value = text;
            el.setAttribute('readonly', '');
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        });

        $(document).on("click", "#test_code_btn", () => {
            const form_data = this.menu_instance.get_form_data();
            const options = this.build_options_object(form_data);
            $.post(`https://${GetParentResourceName()}/play_animation`, JSON.stringify({ options }));
        });
    }

    /**
     * Turns form data into a usable JS object for testing the animation.
     * @param {Object} data - Raw form data.
     * @returns {Object} - Structured options object.
     */
    build_options_object(data) {
        const num = (v, fallback = 0.0) => {
            const n = parseFloat(v);
            return isNaN(n) ? fallback : n;
        };
        const bool = (v) => v === true || v === "true";

        const options = {
            dict: data.dict || undefined,
            anim: data.anim || undefined,
        };

        const fields = ["flags", "duration", "blend_in", "blend_out", "playback"];
        fields.forEach(key => {
            if (data[key] !== "") options[key] = num(data[key]);
        });

        ["freeze", "continuous", "lock_x", "lock_y", "lock_z"].forEach(k => {
            if (bool(data[k])) options[k] = true;
        });

        if (Array.isArray(data.props) && data.props.length > 0) {
            options.props = data.props.map((prop) => ({
                model: prop.model,
                bone: num(prop.bone, 57005),
                coords: {
                    x: num(prop.coords_x),
                    y: num(prop.coords_y),
                    z: num(prop.coords_z)
                },
                rotation: {
                    x: num(prop.rotation_x),
                    y: num(prop.rotation_y),
                    z: num(prop.rotation_z)
                },
                ...(bool(prop.use_soft) && { use_soft: true }),
                ...(bool(prop.is_ped) && { is_ped: true }),
                ...(prop.rot_order && { rot_order: parseInt(prop.rot_order) }),
                ...(bool(prop.sync_rot) && { sync_rot: true }),
            }));
        }

        return options;
    }

    /**
     * Converts form data into a final Lua snippet.
     * @param {Object} data - Raw form data.
     * @returns {{ valid: boolean, code?: string, errors?: string[] }}
     */
    build_code(data) {
        const missing = [];
        if (!data.dict) missing.push("Animation Dictionary (dict)");
        if (!data.anim) missing.push("Animation Name (anim)");
        if (missing.length > 0) return { valid: false, errors: missing };

        const num = (v, def = 0, float = true) => {
            const n = parseFloat(v);
            if (isNaN(n)) return def;
            return float ? parseFloat(n.toFixed(3)) : Math.round(n);
        };
        const bool = (v) => v === true || v === "true";

        const defaults = {
            flags: 49,
            duration: 5000,
            freeze: false,
            continuous: false,
            blend_in: 8.0,
            blend_out: 8.0,
            playback: 0,
            lock_x: false,
            lock_y: false,
            lock_z: false
        };

        const raw_options = {
            dict: `"${data.dict}"`,
            anim: `"${data.anim}"`,
            flags: num(data.flags, 49),
            duration: num(data.duration, 5000),
            freeze: bool(data.freeze),
            continuous: bool(data.continuous),
            blend_in: num(data.blend_in, 8.0, true),
            blend_out: num(data.blend_out, 8.0, true),
            playback: num(data.playback, 0),
            lock_x: bool(data.lock_x),
            lock_y: bool(data.lock_y),
            lock_z: bool(data.lock_z)
        };

        const filtered_options = Object.entries(raw_options).filter(([k, v]) => {
            if (k === 'dict' || k === 'anim') return true;
            return v !== defaults[k];
        });

        const lua_options = filtered_options.map(([k, v]) => `    ${k} = ${typeof v === "string" ? v : JSON.stringify(v)},`).join('\n');

        const props = data.props.map((prop) => {
            const lines = [
                `model = "${prop.model}",`,
                `bone = ${num(prop.bone, 57005)},`,
                `coords = vector3(${num(prop.coords_x)}, ${num(prop.coords_y)}, ${num(prop.coords_z)}),`,
                `rotation = vector3(${num(prop.rotation_x)}, ${num(prop.rotation_y)}, ${num(prop.rotation_z)})`
            ];

            if (bool(prop.use_soft)) lines.push(`use_soft = true`);
            if (bool(prop.is_ped)) lines.push(`is_ped = true`);
            if (prop.rot_order && parseInt(prop.rot_order) !== 1) lines.push(`rot_order = ${parseInt(prop.rot_order)}`);
            if (bool(prop.sync_rot)) lines.push(`sync_rot = true`);

            return `        {\n            ${lines.join('\n            ')}\n        }`;
        });

        const lua_props = props.length > 0 ? `    props = {\n${props.join(',\n')}\n    },` : '';
        const callback = data.callback_code?.trim();
        const lua_callback = callback ? `, function()\n    ${callback}\nend` : '';

        const all_lines = [lua_options];
        if (lua_props) all_lines.push(lua_props);

        return {
            valid: true,
            code: `play_animation(PlayerPedId(), {\n${all_lines.join('\n')}\n}${lua_callback})`
        };
    }

    /**
     * Outputs the generated code to the DOM.
     * @param {{ valid: boolean, code?: string, errors?: string[] }} result
     */
    display(result) {
        if (!result.valid) {
            this.$container.html(`<div class="code_block"><h2>Missing Required Fields</h2><ul>${result.errors.map(e => `<li>${e}</li>`).join("")}</ul></div>`);
            return;
        }

        this.$container.html(`
            <div class="code_block">
                <div class="code_header">OUTPUT</div>
                <pre><code id="final_output">${result.code}</code></pre>
                <div style="display: flex; justify-content: flex-end; gap: 0.5vh;">
                    <button id="test_code_btn" class="code_block_btn" data-target="final_output">Test Code</button>
                    <button id="copy_code_btn" class="code_block_btn" data-target="final_output">Copy Code</button>
                </div>
            </div>
        `);
    }
}
