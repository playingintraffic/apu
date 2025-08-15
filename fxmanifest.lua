--[[ 
    This file is part of APU (Animation & Prop Utility) and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don"t be that guy...
]]

--[[
#########################################################
#  ____  _        _ __   _____ _   _  ____   ___ _   _  #
# |  _ \| |      / \\ \ / /_ _| \ | |/ ___| |_ _| \ | | #
# | |_) | |     / _ \\ V / | ||  \| | |  _   | ||  \| | #
# |  __/| |___ / ___ \| |  | || |\  | |_| |  | || |\  | #
# |_|   |_____/_/   \_\_| |___|_| \_|\____| |___|_| \_| #
#  _____ ____      _    _____ _____ ___ ____            #
# |_   _|  _ \    / \  |  ___|  ___|_ _/ ___|           #
#   | | | |_) |  / _ \ | |_  | |_   | | |               #
#   | | |  _ <  / ___ \|  _| |  _|  | | |___            #
#   |_| |_| \_\/_/   \_\_|   |_|   |___\____|           #              
#########################################################
]]

fx_version "cerulean"
games { "gta5" }

name "apu"
version "0.1.0"
description "A animation & prop utility built to be straight forward."
author "PlayingInTraffic"
lua54 "yes"

ui_page "ui/index.html"

files {
    "**"
}

client_scripts {
    "core/client.lua",
}