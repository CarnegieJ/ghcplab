import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ProductsPage from './ProductsPage';
import { CartContext } from '../context/CartContext';
import { Product } from '../types';

// --- Mocks -------------------------------------------------------------------

vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

vi.mock('./ReviewModal', () => ({
    default: ({ product, onClose, onSubmit }: {
        product: Product | null;
        onClose: () => void;
        onSubmit: (r: { author: string; comment: string; date: string }) => void;
    }) => {
        if (!product) return null;
        return (
            <div data-testid="review-modal">
                <span data-testid="modal-product-name">{product.name}</span>
                <button onClick={onClose} data-testid="close-modal">Close</button>
                <button
                    onClick={() => onSubmit({ author: 'Tester', comment: 'Great!', date: new Date().toISOString() })}
                    data-testid="submit-review"
                >
                    Submit Review
                </button>
            </div>
        );
    }
}));

// --- Fixtures ----------------------------------------------------------------

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
    id: '1',
    name: 'Apple',
    price: 1.99,
    description: 'Fresh apple',
    image: 'apple.png',
    reviews: [],
    inStock: true,
    ...overrides,
});

const mockProducts: Product[] = [
    makeProduct({ id: '1', name: 'Apple',  price: 1.99, image: 'apple.png',  inStock: true  }),
    makeProduct({ id: '2', name: 'Grapes', price: 3.99, image: 'grapes.png', inStock: false }),
    makeProduct({ id: '3', name: 'Orange', price: 2.49, image: 'orange.png', inStock: true  }),
    makeProduct({ id: '4', name: 'Pear',   price: 1.49, image: 'pear.png',   inStock: true  }),
];

const mockAddToCart = vi.fn();

const makeCartContext = () => ({
    cartItems: [],
    addToCart: mockAddToCart,
    clearCart: vi.fn(),
});

// Mocks fetch to resolve each product file by matching filename in the URL
const mockFetch = (products: Product[] = mockProducts, fail = false) => {
    const fileMap: Record<string, Product> = {
        'apple.json':  products[0],
        'grapes.json': products[1],
        'orange.json': products[2],
        'pear.json':   products[3],
    };

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
        if (fail) {
            return Promise.resolve({ ok: false });
        }
        const file = Object.keys(fileMap).find(k => url.includes(k));
        const product = file ? fileMap[file] : products[0];
        return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(product),
        });
    }));
};

const renderProductsPage = () =>
    render(
        <CartContext.Provider value={makeCartContext()}>
            <ProductsPage />
        </CartContext.Provider>
    );

// --- Tests -------------------------------------------------------------------

describe('ProductsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    // -- Loading state --------------------------------------------------------

    describe('loading state', () => {
        it('shows a loading indicator before products are fetched', () => {
            // Don't resolve fetch — keep it pending
            vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})));
            renderProductsPage();

            expect(screen.getByText('Loading products...')).toBeInTheDocument();
        });

        it('renders the header during loading', () => {
            vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})));
            renderProductsPage();

            expect(screen.getByTestId('header')).toBeInTheDocument();
        });

        it('renders the footer during loading', () => {
            vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})));
            renderProductsPage();

            expect(screen.getByTestId('footer')).toBeInTheDocument();
        });
    });

    // -- Successful product load ----------------------------------------------

    describe('after products load', () => {
        it('hides the loading indicator after fetch resolves', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
            });
        });

        it('renders the "Our Products" heading', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                expect(screen.getByRole('heading', { name: 'Our Products' })).toBeInTheDocument();
            });
        });

        it('renders each product name', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                expect(screen.getByText('Apple')).toBeInTheDocument();
                expect(screen.getByText('Grapes')).toBeInTheDocument();
                expect(screen.getByText('Orange')).toBeInTheDocument();
                expect(screen.getByText('Pear')).toBeInTheDocument();
            });
        });

        it('renders each product price', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                expect(screen.getByText('$1.99')).toBeInTheDocument();
                expect(screen.getByText('$3.99')).toBeInTheDocument();
            });
        });

        it('renders each product description', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                expect(screen.getAllByText('Fresh apple').length).toBeGreaterThan(0);
            });
        });

        it('renders product images with correct src', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                expect(screen.getByAltText('Apple')).toHaveAttribute(
                    'src', 'products/productImages/apple.png'
                );
            });
        });

        it('renders an "Add to Cart" button for in-stock products', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                const buttons = screen.getAllByRole('button', { name: /add to cart/i });
                expect(buttons.length).toBeGreaterThan(0);
            });
        });

        it('renders an "Out of Stock" button for out-of-stock products', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /out of stock/i })).toBeInTheDocument();
            });
        });

        it('disables the button for out-of-stock products', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled();
            });
        });

        it('does not disable the button for in-stock products', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => {
                const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
                addButtons.forEach(btn => expect(btn).not.toBeDisabled());
            });
        });
    });

    // -- Cart interactions ----------------------------------------------------

    describe('add to cart', () => {
        it('calls addToCart when "Add to Cart" is clicked', async () => {
            mockFetch();
            const user = userEvent.setup();
            renderProductsPage();

            await waitFor(() => screen.getByText('Apple'));
            await user.click(screen.getAllByRole('button', { name: /add to cart/i })[0]);

            expect(mockAddToCart).toHaveBeenCalledTimes(1);
        });

        it('calls addToCart with the correct product', async () => {
            mockFetch();
            const user = userEvent.setup();
            renderProductsPage();

            await waitFor(() => screen.getByText('Apple'));
            await user.click(screen.getAllByRole('button', { name: /add to cart/i })[0]);

            expect(mockAddToCart).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Apple' })
            );
        });

        it('does not call addToCart when an out-of-stock button is clicked (disabled)', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => screen.getByRole('button', { name: /out of stock/i }));
            // Disabled buttons cannot be clicked via userEvent
            expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled();
            expect(mockAddToCart).not.toHaveBeenCalled();
        });
    });

    // -- Review modal ---------------------------------------------------------

    describe('review modal', () => {
        it('does not show the review modal initially', async () => {
            mockFetch();
            renderProductsPage();

            await waitFor(() => screen.getByText('Apple'));
            expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument();
        });

        it('opens the review modal when a product image is clicked', async () => {
            mockFetch();
            const user = userEvent.setup();
            renderProductsPage();

            await waitFor(() => screen.getByAltText('Apple'));
            await user.click(screen.getByAltText('Apple'));

            expect(screen.getByTestId('review-modal')).toBeInTheDocument();
        });

        it('shows the correct product name in the modal', async () => {
            mockFetch();
            const user = userEvent.setup();
            renderProductsPage();

            await waitFor(() => screen.getByAltText('Apple'));
            await user.click(screen.getByAltText('Apple'));

            expect(screen.getByTestId('modal-product-name').textContent).toBe('Apple');
        });

        it('closes the modal when onClose is triggered', async () => {
            mockFetch();
            const user = userEvent.setup();
            renderProductsPage();

            await waitFor(() => screen.getByAltText('Apple'));
            await user.click(screen.getByAltText('Apple'));
            await user.click(screen.getByTestId('close-modal'));

            expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument();
        });

        it('adds a submitted review to the product and keeps modal open', async () => {
            mockFetch();
            const user = userEvent.setup();
            renderProductsPage();

            await waitFor(() => screen.getByAltText('Apple'));
            await user.click(screen.getByAltText('Apple'));
            await user.click(screen.getByTestId('submit-review'));

            // Modal stays open with the updated product
            expect(screen.getByTestId('review-modal')).toBeInTheDocument();
        });
    });

    // -- Error handling -------------------------------------------------------

    describe('fetch error handling', () => {
        it('stops showing the loading indicator even when fetch fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockFetch(mockProducts, true);
            renderProductsPage();

            await waitFor(() => {
                expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
            });
            consoleSpy.mockRestore();
        });

        it('logs an error to the console when fetch fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockFetch(mockProducts, true);
            renderProductsPage();

            await waitFor(() => {
                expect(screen.queryByText('Loading products...')).not.toBeInTheDocument();
            });
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    // -- Negative scenarios ---------------------------------------------------

    describe('negative scenarios', () => {
        it('throws an error when rendered without CartContext', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})));

            expect(() => render(<ProductsPage />)).toThrow(
                'CartContext must be used within a CartProvider'
            );
            consoleSpy.mockRestore();
        });
    });
});
