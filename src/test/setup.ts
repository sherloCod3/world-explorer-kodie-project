/**
 * Configuração do ambiente de teste.
 * Fornecido pelo Vitest com configuração globals: true e environment: jsdom.
 */
import '@testing-library/jest-dom/vitest';

/** Mock de window.matchMedia para suportar testes de tema escuro/claro no jsdom. */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = function (query: string) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return false;
      },
    };
  };
}
