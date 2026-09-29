/**
 * Testes do componente LoadingState.
 *
 * Cobertura:
 * - Mensagem padrão de carregamento
 * - Mensagem personalizada
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingState } from '../../components/LoadingState';

describe('LoadingState', () => {
  it('exibiu a mensagem padrão', () => {
    render(<LoadingState />);

    expect(screen.getByText('Carregando países...')).toBeInTheDocument();
  });

  it('exibiu a mensagem personalizada', () => {
    render(<LoadingState message="Buscando dados..." />);

    expect(screen.getByText('Buscando dados...')).toBeInTheDocument();
  });
});
