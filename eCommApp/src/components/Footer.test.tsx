import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
    it('renders the copyright text', () => {
        render(<Footer />);
        expect(screen.getByText(/The Daily Harvest/i)).toBeInTheDocument();
    });

    it('renders the "All rights reserved" text', () => {
        render(<Footer />);
        expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });

    it('renders as a <footer> element', () => {
        const { container } = render(<Footer />);
        expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('includes the year 2025 in the copyright notice', () => {
        render(<Footer />);
        expect(screen.getByText(/2025/)).toBeInTheDocument();
    });
});
