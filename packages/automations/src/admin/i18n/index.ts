import en from "./en.json"
import es from "./es.json"

export const translations = { en, es } as const

export default {
  en: { translation: en },
  es: { translation: es },
}
