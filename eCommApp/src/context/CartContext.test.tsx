import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { CartProvider, CartContext, CartItem } from './CartContext';
import { Product } from '../types';

// Helper component that exposes CartContext values for testing
const CartConsumer = () => {
    const ctx = useContext(CartContext);
    if (!ctx) return <div>No context</div>;
    return (
        <div>
            <div data-testid="item-count">{ctx.cartItems.length}</div>
            {ctx.cartItems.map(item => (
                <div key={item.id} data-testid={`item-${item.id}`}>
                    {item.name}: {item.quantity}
                </div>
            ))}
            <button onClick={() => ctx.addToCart(testProduct)} data-testid="add-apple">
                Add Apple
            </button>
            <button onClick={() => ctx.addToCart(testProduct2)} data-testid="add-grapes">
                Add Grapes
            </button>
            <button onClick={() => ctx.clearCart()} data-testid="clear">
                Clear
            </button>
        </div>
    );
};

const testProduct: Product = {
    id: 'apple-1',
    name: 'Apple',
    price: 1.99,
    reviews: [],
    inStock: true,
};

const testProduct2: Product = {
    id: 'grapes-1',
    name: 'Grapes',
    price: 3.49,
    reviews: [],
    inStock: true,
};

const renderWithProvider = () =>
    render(
        <CartProvider>
            <CartConsumer />
        </CartProvider>
    );

describe('CartProvider', () => {
    it('renders children', () => {
        render(
            <CartProvider>
                <div data-testid="child">child</div>
            </CartProvider>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('starts with an empty cart', () => {
        renderWithProvider();
        expect(screen.getByTestId('item-count').textContent).toBe('0');
    });
});

describe('addToCart', () => {
    it('adds a new product to the cart with quantity 1', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByTestId('add-apple'));

        expect(screen.getByTestId('item-count').textContent).toBe('1');
        expect(screen.getByTestId('item-apple-1').textContent).toBe('Apple: 1');
    });

    it('increments quantity when the same product is added again', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByTestId('add-apple'));
        await user.click(screen.getByTestId('add-apple'));

        expect(screen.getByTestId('item-count').textContent).toBe('1');
        expect(screen.getByTestId('item-apple-1').textContent).toBe('Apple: 2');
    });

    it('increments quantity multiple times for the same product', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByTestId('add-apple'));
        await user.click(screen.getByTestId('add-apple'));
        await user.click(screen.getByTestId('add-apple'));

        expect(screen.getByTestId('item-apple-1').textContent).toBe('Apple: 3');
    });

    it('adds a second distinct product as a separate cart entry', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByTestId('add-apple'));
        await user.click(screen.getByTestId('add-grapes'));

        expect(screen.getByTestId('item-count').textContent).toBe('2');
        expect(screen.getByTestId('item-apple-1').textContent).toBe('Apple: 1');
        expect(screen.getByTestId('item-grapes-1').textContent).toBe('Grapes: 1');
    });

    it('does not affect other items when incrementing one product', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByTestId('add-apple'));
        await user.click(screen.getByTestId('add-grapes'));
        await user.click(screen.getByTestId('add-apple'));

        expect(screen.getByTestId('item-apple-1').textContent).toBe('Apple: 2');
        expect(screen.getByTestId('item-grapes-1').textContent).toBe('Grapes: 1');
    });
});

describe('clearCart', () => {
    it('removes all items from the cart', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByTestId('add-apple'));
        await user.click(screen.getByTestId('add-grapes'));
        await user.click(screen.getByTestId('clear'));

        expect(screen.getByTestId('item-count').textContent).toBe('0');
    });

    it('does nothing when cart is already empty', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByTestId('clear'));

        expect(screen.getByTestId('item-count').textContent).toBe('0');
    });

    it('allows adding items again after clearing', async () => {
        const user = userEvent.setup();
        renderWithProvider();

        await user.click(screen.getByTestId('add-apple'));
        await user.click(screen.getByTestId('clear'));
        await user.click(screen.getByTestId('add-apple'));

        expect(screen.getByTestId('item-count').textContent).toBe('1');
        expect(screen.getByTestId('item-apple-1').textContent).toBe('Apple: 1');
    });
});
