// ============================================================
// Shared language selection for all project-owned UI text.
// Translation can be disabled globally, in which case English is used.
// ============================================================

import de from "../lang/de.js";
import en from "../lang/en.js";
import es from "../lang/es.js";
import fr from "../lang/fr.js";
import it from "../lang/it.js";
import pt from "../lang/pt.js";
import config from "./config.js";

const AVAILABLE_LANGUAGES = {
    de,
    en,
    es,
    fr,
    it,
    pt,
};

const DEFAULT_LANGUAGE_CODE = "en";

const configuredLanguage = String(config.translation.language || DEFAULT_LANGUAGE_CODE).toLowerCase();
const activeLanguageCode = config.translation.enabled ? configuredLanguage : DEFAULT_LANGUAGE_CODE;

export const activeLanguage = AVAILABLE_LANGUAGES[activeLanguageCode] || AVAILABLE_LANGUAGES[DEFAULT_LANGUAGE_CODE];
export const activeLanguageCodeResolved = AVAILABLE_LANGUAGES[activeLanguageCode]
    ? activeLanguageCode
    : DEFAULT_LANGUAGE_CODE;

export default activeLanguage;