import { render, screen } from '../test/test-utils';
import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';
import HomePage from './HomePage';

vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

describe('HomePage', () => {
    it('renders the header', () => {
        render(<HomePage />);
        expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('renders the footer', () => {
        render(<HomePage />);
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders the welcome heading', () => {
        render(<HomePage />);
        expect(screen.getByRole('heading', { name: /Welcome to the The Daily Harvest/i })).toBeInTheDocument();
    });

    it('renders the products page prompt text', () => {
        render(<HomePage />);
        expect(screen.getByText(/Check out our products page for some great deals/i)).toBeInTheDocument();
    });
});
