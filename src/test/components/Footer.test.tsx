/**
 * Testes do componente Footer.
 *
 * Cobertura:
 * - Nome da aplicação
 * - Link para a API utilizada (countries.dev)
 * - Segurança do link externo (nova aba com noopener noreferrer)
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '../../components/Footer';

describe('Footer', () => {
  it('exibiu o nome da aplicação', () => {
    render(<Footer />);

    expect(screen.getByText('World Explorer')).toBeInTheDocument();
  });

  it('apontou o link para a API countries.dev', () => {
    render(<Footer />);

    const link = screen.getByRole('link', { name: 'Countries.dev API' });
    expect(link).toHaveAttribute('href', 'https://countries.dev');
  });

  it('abriu o link externo com rel seguro', () => {
    render(<Footer />);

    const link = screen.getByRole('link', { name: 'Countries.dev API' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
