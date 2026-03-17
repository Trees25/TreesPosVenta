import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Outfit', sans-serif;
  }

  body {
    background: ${({ theme }) => theme.bg};
    color: ${({ theme }) => theme.text};
    transition: all 0.3s ease-in-out;
    min-height: 100vh;
    overflow-x: hidden;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease;
    &:active {
      transform: scale(0.95);
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
  }

  input, select, textarea {
    outline: none;
    font-family: inherit;
  }

  /* Animations */
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  .animate-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
  .animate-scale { animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

  /* Glassmorphism Classes */
  .glass {
    background: ${({ theme }) => theme.bgAlpha};
    backdrop-filter: blur(12px);
    border: 1px solid ${({ theme }) => theme.borderColor};
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  }

  .premium-shadow {
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.4);
  }

  /* Utilidad global para tablas responsivas */
  .responsive-table-container {
    overflow-x: auto;
    overflow-y: auto;
    max-height: 70vh;
    -webkit-overflow-scrolling: touch; /* Suavidad en iOS */

    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background-color: ${({ theme }) => theme.primary}44;
        border-radius: 20px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background-color: ${({ theme }) => theme.primary};
    }
    
    /* Encabezados pegajosos para las tablas dentro de este contenedor */
    table th {
        position: sticky;
        top: 0;
        z-index: 10;
        background: ${({ theme }) => theme.softBg};
    }
  }

  /* Clases auxiliares de impresión */
  .only-print {
    display: none !important;
  }

  @media print {
    @page {
      margin: 0;
      size: auto;
    }
    
    /* Ocultar absolutamente todo en la pantalla */
    html, body {
      height: auto !important;
      overflow: visible !important;
      background: white !important;
    }

    /* Ocultar el root de React para que no genere scroll ni páginas extras */
    #root {
      display: none !important;
    }

    /* Solo mostrar lo que está en los portales o contenedores de impresión fuera del root */
    #comprobante-print-container, 
    #reporte-cierre-container {
      display: block !important;
      position: absolute;
      top: 0;
      left: 0;
      width: 80mm;
      margin: 0 !important;
      padding: 0 !important;
      visibility: visible !important;
    }

    /* Asegurar que el contenido interno sea visible */
    #comprobante-print-container *,
    #reporte-cierre-container * {
      visibility: visible !important;
    }

    /* Clases de emergencia */
    .no-print { display: none !important; }
  }
`;
