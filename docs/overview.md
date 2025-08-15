![pit_apu_thumb](https://playingintraffic.site/site/public/assets/images/resource_thumbnails/pit_apu_thumb.jpg)

# APU - Animation & Prop Utility

## What is it?

A simple in-game tool for testing and exporting ped animations with prop attachments.

It spawns a preview ped, opens a UI, and lets you apply animations, attach props, tweak offsets, and export clean Lua code using a reusable `play_animation()` function.

Useful for setting up animations inside scripts without needing to manually test flag values, bone indexes, or guess prop rotations.

---

## Why use APU?

- Live preview system  
- Attach multiple props at once  
- Supports continuous and timed animations  
- Fine-tune bone, position, and rotation  
- Outputs clean, ready-to-use code  
- Uses a reusable `play_animation()` helper  
- Fully standalone - no dependencies

---

## What is APU?

**APU** = **Animation & Prop Utility**

It exists to save time when scripting animations.  
It does one thing: lets you visually test animation setups and export the results.

---

## Quick Install

1. Drop it into your servers resources 
2. Add `ensure apu` to your `server.cfg`  
3. Run `/apu` in-game  
4. Use the UI  
5. Copy the output and use it wherever you need

The `play_animation()` function is included in the UI output, or available from the [GRAFT SDK](https://github.com/playingintraffic/graft).