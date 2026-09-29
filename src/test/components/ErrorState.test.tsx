/**
 * Testes do componente ErrorState.
 *
 * Cobertura:
 * - Exibição da mensagem de erro recebida
 * - Ação do botão "Tentar novamente"
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorState } from '../../components/ErrorState';

describe('ErrorState', () => {
  it('exibiu o título e a mensagem de erro', () => {
    render(<ErrorState message="Erro ao buscar países: 500" onRetry={vi.fn()} />);

    expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Erro ao buscar países: 500')).toBeInTheDocument();
  });

  it('executou onRetry ao clicar no botão', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Erro na busca: 503" onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
