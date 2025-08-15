# Play Animation Function

This project uses a custom `play_animation()` helper, built for GRAFT (PIT's internal script dev kit).

Forget raw native spaghetti the function handles everything you'd normally have to deal with manually:
- Loading animation dictionaries and models
- Playing timed or continuous animations
- Attaching one or more props to the ped
- Optional freeze states, flags, and playback settings
- Automatic cleanup
- Supports callbacks after the animation ends

---

## How To Use

Simple as 1, 2, 3:

1. **Copy the function** below into your script  
2. **Generate animation code** using the in-game prop utility  
3. **Paste the output** into your script where needed  

---

## Function

```lua
--- Plays an animation on a ped with optional prop attachments and callback.
---
--- Copied and slightly modified from PIT SDK GRAFT:
--- https://github.com/playingintraffic/graft/blob/main/lib/modules/player.lua
---
--- @param ped number The ped to animate.
--- @param options table Animation config.
--- @param callback function|nil Optional callback after animation ends.
function play_animation(ped, options, callback)
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
    local props = {}

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
```

---

## Notes

* The in-game generator will output the **complete** function, you can then extract parts of it if you want.
* You can attach multiple props, control their bone, offsets, rotation, and behavior.
* Currently in a BETA state, it can be improved on if people have suggestions, for now though it works and its much faster than doing things manually.

If you're using GRAFT in your project already, you can import the player module if not imported already and use the function via:

```lua
local player_mod <const> = exports.graft:get("lib.modules.player")
player_mod.play_animation(...)
```

Otherwise, just paste it directly in your script.