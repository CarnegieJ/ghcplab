import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import CheckoutModal from './CheckoutModal';

describe('CheckoutModal', () => {
    it('renders the confirmation heading', () => {
        render(<CheckoutModal onConfirm={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByRole('heading', { name: 'Are you sure?' })).toBeInTheDocument();
    });

    it('renders the confirmation prompt text', () => {
        render(<CheckoutModal onConfirm={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByText(/Do you want to proceed with the checkout/i)).toBeInTheDocument();
    });

    it('renders the "Continue Checkout" button', () => {
        render(<CheckoutModal onConfirm={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByRole('button', { name: /Continue Checkout/i })).toBeInTheDocument();
    });

    it('renders the "Return to cart" button', () => {
        render(<CheckoutModal onConfirm={vi.fn()} onCancel={vi.fn()} />);
        expect(screen.getByRole('button', { name: /Return to cart/i })).toBeInTheDocument();
    });

    it('calls onConfirm when "Continue Checkout" is clicked', async () => {
        const onConfirm = vi.fn();
        const user = userEvent.setup();
        render(<CheckoutModal onConfirm={onConfirm} onCancel={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /Continue Checkout/i }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when "Return to cart" is clicked', async () => {
        const onCancel = vi.fn();
        const user = userEvent.setup();
        render(<CheckoutModal onConfirm={vi.fn()} onCancel={onCancel} />);

        await user.click(screen.getByRole('button', { name: /Return to cart/i }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when "Continue Checkout" is clicked', async () => {
        const onCancel = vi.fn();
        const user = userEvent.setup();
        render(<CheckoutModal onConfirm={vi.fn()} onCancel={onCancel} />);

        await user.click(screen.getByRole('button', { name: /Continue Checkout/i }));

        expect(onCancel).not.toHaveBeenCalled();
    });

    it('does not call onConfirm when "Return to cart" is clicked', async () => {
        const onConfirm = vi.fn();
        const user = userEvent.setup();
        render(<CheckoutModal onConfirm={onConfirm} onCancel={vi.fn()} />);

        await user.click(screen.getByRole('button', { name: /Return to cart/i }));

        expect(onConfirm).not.toHaveBeenCalled();
    });
});
