import { render, screen } from '../test/test-utils';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header', () => {
    it('renders the site title', () => {
        render(<Header />);
        expect(screen.getByRole('heading', { name: 'The Daily Harvest' })).toBeInTheDocument();
    });

    it('renders a Home navigation link', () => {
        render(<Header />);
        expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    });

    it('links Home to /', () => {
        render(<Header />);
        expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    });

    it('renders a Products navigation link', () => {
        render(<Header />);
        expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    });

    it('links Products to /products', () => {
        render(<Header />);
        expect(screen.getByRole('link', { name: /products/i })).toHaveAttribute('href', '/products');
    });

    it('renders a Cart navigation link', () => {
        render(<Header />);
        expect(screen.getByRole('link', { name: /cart/i })).toBeInTheDocument();
    });

    it('links Cart to /cart', () => {
        render(<Header />);
        expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', '/cart');
    });

    it('renders an Admin Login button', () => {
        render(<Header />);
        expect(screen.getByRole('button', { name: /admin login/i })).toBeInTheDocument();
    });

    it('wraps the Admin Login button in a link to /login', () => {
        render(<Header />);
        expect(screen.getByRole('link', { name: /admin login/i })).toHaveAttribute('href', '/login');
    });

    it('renders inside a <header> element', () => {
        const { container } = render(<Header />);
        expect(container.querySelector('header')).toBeInTheDocument();
    });
});
