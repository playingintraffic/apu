--[[ 
    This file is part of APU (Animation & Prop Utility) and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don"t be that guy...
]]

--- @script core/client.lua
--- @description Handles playing animations, callback functions, prop attachments, and preview ped + camera.

--- @section Variables

local prop_utility_enabled = false
local preview_ped = nil
local preview_cam = nil
local props = {}

--- @section Functions

--- Plays an animation on a ped with optional prop attachments and callback.
---
--- Copied and slightly modified from PIT SDK GRAFT:
--- https://github.com/playingintraffic/graft/blob/main/lib/modules/player.lua
---
--- @param ped number The ped to animate.
--- @param options table Animation options.
--- @param callback function|nil Optional callback to run after the animation.
local function play_animation(ped, options, callback)
    if not ped then print("Ped is missing") return end
    if not options or not options.dict or not options.anim then
        return print("Missing animation dictionary or name")
    end

    if not HasAnimDictLoaded(options.dict) then
        RequestAnimDict(options.dict)
        while not HasAnimDictLoaded(options.dict) do Wait(0) end
    end

    if options.freeze then FreezeEntityPosition(ped, true) end

    local duration = options.duration or 2000
    props = {}

    if options.props then
        for _, prop in ipairs(options.props) do
            if not HasModelLoaded(prop.model) then
                RequestModel(prop.model)
                while not HasModelLoaded(prop.model) do Wait(0) end
            end

            local prop_entity = CreateObject(GetHashKey(prop.model), GetEntityCoords(ped), true, true, true)
            AttachEntityToEntity(prop_entity, ped, GetPedBoneIndex(ped, prop.bone), prop.coords.x or 0.0, prop.coords.y or 0.0, prop.coords.z or 0.0, prop.rotation.x or 0.0, prop.rotation.y or 0.0, prop.rotation.z or 0.0, true, prop.use_soft or false, prop.collision or false, prop.is_ped or true, prop.rot_order or 1, prop.sync_rot or true)
            table.insert(props, prop_entity)
        end
    end

    local flags = options.flags or 1
    local playback = options.playback or 0
    local blend_in = options.blend_in or 8.0
    local blend_out = options.blend_out or -8.0
    local lock_x = options.lock_x or 0
    local lock_y = options.lock_y or 0
    local lock_z = options.lock_z or 0

    if options.continuous then
        TaskPlayAnim(ped, options.dict, options.anim, blend_in, blend_out, -1, flags, playback, lock_x, lock_y, lock_z)
    else
        TaskPlayAnim(ped, options.dict, options.anim, blend_in, blend_out, duration, flags, playback, lock_x, lock_y, lock_z)
        Wait(duration)
        ClearPedTasks(ped)
        if options.freeze then FreezeEntityPosition(ped, false) end
        for _, prop_entity in ipairs(props) do DeleteObject(prop_entity) end
        if callback then callback() end
    end
end

--- Rotates the preview ped in a given direction.
--- @param direction string One of: "right", "left", "flip", "reset"
local function appearance_rotate_ped(direction)
    if not direction then return print("appearance_rotate_ped: missing direction") end
    if not preview_ped or not DoesEntityExist(preview_ped) then return print("appearance_rotate_ped: preview_ped missing") end

    local current_heading = GetEntityHeading(preview_ped)
    original_heading = original_heading or current_heading

    local rotations = {
        right = current_heading + 25,
        left = current_heading - 25,
        flip = current_heading + 180,
        reset = original_heading
    }

    local new_heading = rotations[direction]
    if not new_heading then return print("appearance_rotate_ped: invalid direction - use right, left, flip, reset") end

    if direction == "reset" then
        original_heading = nil
    end

    SetEntityHeading(preview_ped, new_heading)
end

--- Creates a cloned ped and a camera for previewing animations.
local function create_ped_preview()
    if preview_ped then return end

    local player_ped = PlayerPedId()
    local coords = GetEntityCoords(player_ped) + vector3(0, 3.0, 0)

    preview_ped = ClonePed(player_ped, false, false, true)
    SetEntityCoords(preview_ped, coords.x, coords.y, coords.z, false, false, false, false)
    SetEntityInvincible(preview_ped, true)
    SetEntityVisible(preview_ped, true)
    SetPedCanRagdoll(preview_ped, false)
    FreezeEntityPosition(preview_ped, true)
    ClearPedTasks(preview_ped)

    local cam_offset = vector3(-0.05, 1.7, 1.5)
    local cam_coords = coords + cam_offset

    preview_cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
    SetCamCoord(preview_cam, cam_coords.x, cam_coords.y, cam_coords.z)
    local heading = GetEntityHeading(preview_ped)
    SetCamRot(preview_cam, -15.0, 0.0, heading + 180.0, 2)

    SetCamActive(preview_cam, true)
    RenderScriptCams(true, false, 0, true, true)

    SetCamUseShallowDofMode(preview_cam, true)
    SetCamNearDof(preview_cam, 1.0)
    SetCamFarDof(preview_cam, 1.9)
    SetCamDofStrength(preview_cam, 1.2)

    CreateThread(function()
        while DoesCamExist(preview_cam) do
            SetUseHiDof()
            Wait(0)
        end
    end)
end

--- Destroys the preview ped and camera if they exist.
local function destroy_ped_preview()
    if preview_cam then
        RenderScriptCams(false, false, 0, true, true)
        DestroyCam(preview_cam, false)
        preview_cam = nil
    end

    if preview_ped then
        DeleteEntity(preview_ped)
        preview_ped = nil
    end
end

--- Opens the prop utility UI and sets up preview.
local function open_prop_util()
    SetNuiFocus(true, true)
    SendNUIMessage({ action = "open" })
    create_ped_preview()
end

--- Closes the prop utility UI and cleans up preview.
local function close_prop_util()
    SendNUIMessage({ action = "close" })
    SetNuiFocus(false, false)
    destroy_ped_preview()
    prop_utility_enabled = false
end

--- @section NUI Callbacks

--- Handles the play_animation NUI callback and runs the animation.
RegisterNUICallback("play_animation", function(data, cb)
    local options = data.options or {}

    for _, ent in ipairs(props) do
        if DoesEntityExist(ent) then DeleteObject(ent) end
    end
    props = {}

    if options.props then
        for _, prop in ipairs(options.props) do
            for _, axis in ipairs({ "x", "y", "z" }) do
                if prop.rotation and type(prop.rotation[axis]) == "number" then
                    prop.rotation[axis] = tonumber(("%.3f"):format(prop.rotation[axis]))
                end
                if prop.coords and type(prop.coords[axis]) == "number" then
                    prop.coords[axis] = tonumber(("%.3f"):format(prop.coords[axis]))
                end
            end
        end
    end

    play_animation(preview_ped, options)
end)

--- Handles the rotate_preview NUI callback.
RegisterNUICallback("rotate_preview", function(data, cb)
    local dir = data.direction
    appearance_rotate_ped(dir)
    cb({ status = "ok" })
end)

--- Releases NUI focus (called when closing the UI from Escape).
RegisterNUICallback("close_ui", function()
    close_prop_util()
end)

--- @section Commands

--- Toggles the prop utility on/off.
RegisterCommand("apu", function()
    prop_utility_enabled = not prop_utility_enabled
    if prop_utility_enabled then
        open_prop_util()
    else
        close_prop_util()
    end
end)