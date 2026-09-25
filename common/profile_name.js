// ============================================================
// The name shown for a Profile: its folder name, or for Guest its name in
// the player's language (Guest's folder name is never shown).
// ============================================================

import lang from "./i18n.js";

export function displayNameOf(profile) {
    return profile.isGuest ? lang.profiles.guestName : profile.name;
}
