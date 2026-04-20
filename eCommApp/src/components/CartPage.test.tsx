import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CartPage from './CartPage';
import { CartContext, CartItem } from '../context/CartContext';

// --- Mocks -------------------------------------------------------------------

vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./CheckoutModal', () => ({
    default: ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
        <div data-testid="checkout-modal">
            <button onClick={onConfirm} data-testid="confirm-checkout">Confirm</button>
            <button onClick={onCancel} data-testid="cancel-checkout">Cancel</button>
        </div>
    )
}));

// --- Fixtures ----------------------------------------------------------------

const makeItem = (overrides: Partial<CartItem> = {}): CartItem => ({
    id: '1',
    name: 'Test Product',
    price: 29.99,
    quantity: 1,
    image: 'test.jpg',
    reviews: [],
    inStock: true,
    ...overrides,
});

const mockClearCart = vi.fn();
const mockAddToCart = vi.fn();

const makeContext = (cartItems: CartItem[] = [makeItem()]) => ({
    cartItems,
    addToCart: mockAddToCart,
    clearCart: mockClearCart,
});

const renderCart = (cartItems: CartItem[] = [makeItem()]) =>
    render(
        <CartContext.Provider value={makeContext(cartItems)}>
            <CartPage />
        </CartContext.Provider>
    );

// --- Tests -------------------------------------------------------------------

describe('CartPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -- Layout ----------------------------------------------------------------

    describe('layout', () => {
        it('always renders the header', () => {
            renderCart();
            expect(screen.getByTestId('header'), 'Header should always be present').toBeInTheDocument();
        });

        it('always renders the footer', () => {
            renderCart();
            expect(screen.getByTestId('footer'), 'Footer should always be present').toBeInTheDocument();
        });

        it('always renders the "Your Cart" heading', () => {
            renderCart();
            expect(
                screen.getByRole('heading', { name: 'Your Cart' }),
                '"Your Cart" heading should be present on initial render'
            ).toBeInTheDocument();
        });
    });

    // -- Empty cart ------------------------------------------------------------

    describe('empty cart', () => {
        it('displays the empty cart message', () => {
            renderCart([]);
            expect(
                screen.getByText('Your cart is empty.'),
                'Should show empty cart message when no items are present'
            ).toBeInTheDocument();
        });

        it('renders the empty cart message as a <p> element', () => {
            renderCart([]);
            expect(
                screen.getByText('Your cart is empty.').tagName,
                'Empty cart message should be a paragraph element'
            ).toBe('P');
        });

        it('does not render a Checkout button', () => {
            renderCart([]);
            expect(
                screen.queryByRole('button', { name: /checkout/i }),
                'Checkout button should not appear when cart is empty'
            ).not.toBeInTheDocument();
        });

        it('does not render product images', () => {
            renderCart([]);
            expect(
                screen.queryByRole('img'),
                'No product images should render in an empty cart'
            ).not.toBeInTheDocument();
        });

        it('does not render any price labels', () => {
            renderCart([]);
            expect(
                screen.queryByText(/Price:/i),
                'No price labels should render in an empty cart'
            ).not.toBeInTheDocument();
        });

        it('does not render any quantity labels', () => {
            renderCart([]);
            expect(
                screen.queryByText(/Quantity:/i),
                'No quantity labels should render in an empty cart'
            ).not.toBeInTheDocument();
        });

        it('does not show the checkout modal', () => {
            renderCart([]);
            expect(
                screen.queryByTestId('checkout-modal'),
                'Checkout modal should not appear in an empty cart'
            ).not.toBeInTheDocument();
        });
    });

    // -- Items in cart ---------------------------------------------------------

    describe('with items in the cart', () => {
        it('renders each item name', () => {
            renderCart([
                makeItem({ id: '1', name: 'Apple' }),
                makeItem({ id: '2', name: 'Grapes' }),
            ]);
            expect(screen.getByText('Apple')).toBeInTheDocument();
            expect(screen.getByText('Grapes')).toBeInTheDocument();
        });

        it('renders each item price formatted to 2 decimal places', () => {
            renderCart([
                makeItem({ id: '1', price: 1.5 }),
                makeItem({ id: '2', price: 100 }),
            ]);
            expect(screen.getByText('Price: $1.50')).toBeInTheDocument();
            expect(screen.getByText('Price: $100.00')).toBeInTheDocument();
        });

        it('renders each item quantity', () => {
            renderCart([
                makeItem({ id: '1', quantity: 3 }),
                makeItem({ id: '2', name: 'Other', quantity: 7 }),
            ]);
            expect(screen.getByText('Quantity: 3')).toBeInTheDocument();
            expect(screen.getByText('Quantity: 7')).toBeInTheDocument();
        });

        it('renders product images with correct src paths', () => {
            renderCart([makeItem({ image: 'apple.png' })]);
            expect(
                screen.getByRole('img'),
                'Product image src should point to the products/productImages directory'
            ).toHaveAttribute('src', 'products/productImages/apple.png');
        });

        it('renders product images with the item name as alt text', () => {
            renderCart([makeItem({ name: 'Fresh Apple', image: 'apple.png' })]);
            expect(
                screen.getByAltText('Fresh Apple'),
                'Product image alt text should match the item name for accessibility'
            ).toBeInTheDocument();
        });

        it('does not show the empty cart message', () => {
            renderCart([makeItem()]);
            expect(
                screen.queryByText('Your cart is empty.'),
                'Empty cart message should not appear when cart has items'
            ).not.toBeInTheDocument();
        });

        it('renders a Checkout button', () => {
            renderCart([makeItem()]);
            expect(
                screen.getByRole('button', { name: /checkout/i }),
                'Checkout button should be present when cart has items'
            ).toBeInTheDocument();
        });

        it('does not show the checkout modal on initial render', () => {
            renderCart([makeItem()]);
            expect(
                screen.queryByTestId('checkout-modal'),
                'Checkout modal should not appear until the Checkout button is clicked'
            ).not.toBeInTheDocument();
        });
    });

    // -- Checkout flow ---------------------------------------------------------

    describe('checkout flow', () => {
        it('opens the checkout modal when Checkout is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderCart();

            // Act
            await user.click(screen.getByRole('button', { name: /checkout/i }));

            // Assert
            expect(
                screen.getByTestId('checkout-modal'),
                'Checkout modal should appear after clicking the Checkout button'
            ).toBeInTheDocument();
        });

        it('closes the checkout modal when cancel is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));

            // Act
            await user.click(screen.getByTestId('cancel-checkout'));

            // Assert
            expect(
                screen.queryByTestId('checkout-modal'),
                'Checkout modal should be dismissed after clicking Cancel'
            ).not.toBeInTheDocument();
        });

        it('does not call clearCart when checkout is cancelled', async () => {
            // Arrange
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));

            // Act
            await user.click(screen.getByTestId('cancel-checkout'));

            // Assert
            expect(mockClearCart, 'Cart should not be cleared when checkout is cancelled').not.toHaveBeenCalled();
        });

        it('calls clearCart exactly once when checkout is confirmed', async () => {
            // Arrange
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));

            // Act
            await user.click(screen.getByTestId('confirm-checkout'));

            // Assert
            expect(mockClearCart, 'clearCart should be called exactly once on confirmation').toHaveBeenCalledTimes(1);
        });

        it('shows the order confirmation heading after checkout is confirmed', async () => {
            // Arrange
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));

            // Act
            await user.click(screen.getByTestId('confirm-checkout'));

            // Assert
            expect(screen.getByText('Your order has been processed!')).toBeInTheDocument();
        });

        it('hides the checkout modal after confirming', async () => {
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('confirm-checkout'));

            expect(screen.queryByTestId('checkout-modal')).not.toBeInTheDocument();
        });

        it('hides the Checkout button after confirming', async () => {
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('confirm-checkout'));

            expect(screen.queryByRole('button', { name: /checkout/i })).not.toBeInTheDocument();
        });

        it('hides the "Your Cart" heading after confirming', async () => {
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('confirm-checkout'));

            expect(screen.queryByRole('heading', { name: 'Your Cart' })).not.toBeInTheDocument();
        });
    });

    // -- Order confirmation ----------------------------------------------------

    describe('order confirmation screen', () => {
        const appleItem = makeItem({ id: '1', name: 'Apple', price: 1.99, quantity: 2, image: 'apple.png' });
        const grapesItem = makeItem({ id: '2', name: 'Grapes', price: 3.49, quantity: 1, image: 'grapes.png' });

        const confirmCheckout = async () => {
            const user = userEvent.setup();
            renderCart([appleItem, grapesItem]);
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('confirm-checkout'));
        };

        it('displays the name of each processed item', async () => {
            await confirmCheckout();
            expect(screen.getByText('Apple')).toBeInTheDocument();
            expect(screen.getByText('Grapes')).toBeInTheDocument();
        });

        it('displays the price of each processed item', async () => {
            await confirmCheckout();
            expect(screen.getByText('Price: $1.99')).toBeInTheDocument();
            expect(screen.getByText('Price: $3.49')).toBeInTheDocument();
        });

        it('displays the quantity of each processed item', async () => {
            await confirmCheckout();
            expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
            expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
        });

        it('displays images for each processed item with the correct src', async () => {
            await confirmCheckout();
            expect(screen.getByAltText('Apple')).toHaveAttribute('src', 'products/productImages/apple.png');
            expect(screen.getByAltText('Grapes')).toHaveAttribute('src', 'products/productImages/grapes.png');
        });

        it('preserves item snapshot so items display even after clearCart is called', async () => {
            // clearCart wipes the live context -- the confirmation screen must use
            // a snapshot taken at the moment of confirmation, not the live cart.
            await confirmCheckout();
            expect(mockClearCart).toHaveBeenCalled();
            expect(screen.getByText('Apple')).toBeInTheDocument();
            expect(screen.getByText('Grapes')).toBeInTheDocument();
        });

        it('still renders the header on the confirmation screen', async () => {
            await confirmCheckout();
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });

        it('still renders the footer on the confirmation screen', async () => {
            await confirmCheckout();
            expect(screen.getByTestId('footer')).toBeInTheDocument();
        });
    });

    // -- Edge cases ------------------------------------------------------------

    describe('edge cases', () => {
        it('renders a single cart item name', () => {
            renderCart([makeItem({ name: 'Only Item' })]);
            expect(screen.getByText('Only Item')).toBeInTheDocument();
        });

        it('renders a single cart item price', () => {
            renderCart([makeItem({ price: 9.99 })]);
            expect(screen.getByText('Price: $9.99')).toBeInTheDocument();
        });

        it('renders a single cart item quantity', () => {
            renderCart([makeItem({ quantity: 1 })]);
            expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
        });

        it('formats a zero price as $0.00', () => {
            renderCart([makeItem({ price: 0 })]);
            expect(screen.getByText('Price: $0.00')).toBeInTheDocument();
        });

        it('formats a price with more than 2 decimal places to 2dp', () => {
            renderCart([makeItem({ price: 1.999 })]);
            expect(screen.getByText('Price: $2.00')).toBeInTheDocument();
        });

        it('renders a large quantity without error', () => {
            renderCart([makeItem({ quantity: 9999 })]);
            expect(screen.getByText('Quantity: 9999')).toBeInTheDocument();
        });

        it('renders a very long product name without error', () => {
            const longName = 'A'.repeat(200);
            renderCart([makeItem({ name: longName })]);
            expect(screen.getByText(longName)).toBeInTheDocument();
        });

        it('renders a large number of cart items without error', () => {
            const items = Array.from({ length: 50 }, (_, i) =>
                makeItem({ id: String(i), name: `Product ${i}` })
            );
            renderCart(items);
            expect(screen.getAllByText(/Product \d+/).length).toBe(50);
        });

        it('renders an item with an undefined image without crashing', () => {
            renderCart([makeItem({ image: undefined })]);
            // image is optional -- component renders but src will contain "undefined"
            expect(screen.getByRole('img')).toHaveAttribute('src', 'products/productImages/undefined');
        });

        it('does not call clearCart when checkout is cancelled once', async () => {
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('cancel-checkout'));
            expect(mockClearCart).not.toHaveBeenCalled();
        });

        it('does not call clearCart when checkout is cancelled a second time', async () => {
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('cancel-checkout'));
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('cancel-checkout'));
            expect(mockClearCart).not.toHaveBeenCalled();
        });
    });

    // -- Negative scenarios ----------------------------------------------------

    describe('negative scenarios', () => {
        it('throws an error when rendered without a CartContext provider', () => {
            // Suppress expected React error boundary console output
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
            expect(() => render(<CartPage />)).toThrow(
                'CartContext must be used within a CartProvider'
            );
            consoleError.mockRestore();
        });

        it('does not show order confirmation before checkout is completed', () => {
            renderCart();
            expect(screen.queryByText('Your order has been processed!')).not.toBeInTheDocument();
        });

        it('does not show order confirmation after opening then cancelling the modal', async () => {
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('cancel-checkout'));
            expect(screen.queryByText('Your order has been processed!')).not.toBeInTheDocument();
        });

        it('does not call clearCart more than once on checkout confirmation', async () => {
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('confirm-checkout'));
            expect(mockClearCart, 'clearCart should only be called once -- not on every render').toHaveBeenCalledTimes(1);
        });

        it('does not call addToCart at any point during the checkout flow', async () => {
            const user = userEvent.setup();
            renderCart();
            await user.click(screen.getByRole('button', { name: /checkout/i }));
            await user.click(screen.getByTestId('confirm-checkout'));
            expect(mockAddToCart, 'addToCart should never be called from CartPage').not.toHaveBeenCalled();
        });
    });
});
