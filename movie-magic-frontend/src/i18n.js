// src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      "Movie Magic": "Movie Magic",
      "Search": "Search",
      "Favorites": "Favorites",
      "Watchlist": "Watchlist",
      "Login": "Login",
      "Logout": "Logout",
      "Google": "Google",
      "Home": "Home",
      "Results for": "Results for",
      "No results found": "No results found",
      "Loading": "Loading",
      "Details": "Details",
      "Reviews": "Reviews",
      "Write a Review": "Write a Review",
      "Submit Review": "Submit Review",
      "Add to Favorites": "Add to Favorites",
      "Trailers": "Trailers",
      "Gallery": "Gallery",
      "You Might Also Like": "You Might Also Like",
      "Rate": "Rate",
      "Comment": "Comment",
      "Post": "Post",
      "Remove": "Remove",
      "Want to Watch": "Want to Watch",
      "Watching": "Watching",
      "Watched": "Watched",
      "Toggle Dark Mode": "Toggle Dark Mode"
    }
  },
  es: {
    translation: {
      "Movie Magic": "Magia del Cine",
      "Search": "Buscar",
      "Favorites": "Favoritos",
      "Watchlist": "Lista",
      "Login": "Iniciar sesión",
      "Logout": "Cerrar sesión",
      "Google": "Google",
      "Home": "Inicio",
      "Results for": "Resultados de",
      "No results found": "No se encontraron resultados",
      "Loading": "Cargando",
      "Details": "Detalles",
      "Reviews": "Reseñas",
      "Write a Review": "Escribir una reseña",
      "Submit Review": "Enviar reseña",
      "Add to Favorites": "Agregar a favoritos",
      "Trailers": "Videos",
      "Gallery": "Galería",
      "You Might Also Like": "También te puede gustar",
      "Rate": "Calificar",
      "Comment": "Comentario",
      "Post": "Publicar",
      "Remove": "Eliminar",
      "Want to Watch": "Quiero ver",
      "Watching": "Viendo",
      "Watched": "Visto",
      "Toggle Dark Mode": "Modo oscuro"
    }
  }
};

i18n
  .use(LanguageDetector)      // detect browser language
  .use(initReactI18next)      // bind to React
  .init({
    resources,
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;