import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ReviewModal from './ReviewModal';
import { Product } from '../types';

const mockProduct: Product = {
    id: '1',
    name: 'Apple',
    price: 1.99,
    image: 'apple.png',
    reviews: [],
    inStock: true,
};

const productWithReviews: Product = {
    ...mockProduct,
    reviews: [
        { author: 'Alice', comment: 'Great apple!', date: '2024-01-15T00:00:00.000Z' },
        { author: 'Bob', comment: 'Very fresh', date: '2024-02-20T00:00:00.000Z' },
    ],
};

describe('ReviewModal', () => {
    describe('when product is null', () => {
        it('renders nothing', () => {
            const { container } = render(
                <ReviewModal product={null} onClose={vi.fn()} onSubmit={vi.fn()} />
            );
            expect(container).toBeEmptyDOMElement();
        });
    });

    describe('when a product is provided', () => {
        it('renders the product name in the heading', () => {
            render(<ReviewModal product={mockProduct} onClose={vi.fn()} onSubmit={vi.fn()} />);
            expect(screen.getByRole('heading', { name: /Reviews for Apple/i })).toBeInTheDocument();
        });

        it('shows "No reviews yet." when there are no reviews', () => {
            render(<ReviewModal product={mockProduct} onClose={vi.fn()} onSubmit={vi.fn()} />);
            expect(screen.getByText('No reviews yet.')).toBeInTheDocument();
        });

        it('renders each existing review author', () => {
            render(<ReviewModal product={productWithReviews} onClose={vi.fn()} onSubmit={vi.fn()} />);
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Bob')).toBeInTheDocument();
        });

        it('renders each existing review comment', () => {
            render(<ReviewModal product={productWithReviews} onClose={vi.fn()} onSubmit={vi.fn()} />);
            expect(screen.getByText('Great apple!')).toBeInTheDocument();
            expect(screen.getByText('Very fresh')).toBeInTheDocument();
        });

        it('renders the review form with a name input', () => {
            render(<ReviewModal product={mockProduct} onClose={vi.fn()} onSubmit={vi.fn()} />);
            expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
        });

        it('renders the review form with a comment textarea', () => {
            render(<ReviewModal product={mockProduct} onClose={vi.fn()} onSubmit={vi.fn()} />);
            expect(screen.getByPlaceholderText('Your review')).toBeInTheDocument();
        });

        it('renders a Submit button', () => {
            render(<ReviewModal product={mockProduct} onClose={vi.fn()} onSubmit={vi.fn()} />);
            expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
        });

        it('renders a Close button', () => {
            render(<ReviewModal product={mockProduct} onClose={vi.fn()} onSubmit={vi.fn()} />);
            expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
        });
    });

    describe('submitting a review', () => {
        it('calls onSubmit with author, comment, and a date string', async () => {
            const onSubmit = vi.fn();
            const user = userEvent.setup();
            render(<ReviewModal product={mockProduct} onClose={vi.fn()} onSubmit={onSubmit} />);

            await user.type(screen.getByPlaceholderText('Your name'), 'Charlie');
            await user.type(screen.getByPlaceholderText('Your review'), 'Delicious!');
            await user.click(screen.getByRole('button', { name: /submit/i }));

            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ author: 'Charlie', comment: 'Delicious!' })
            );
        });

        it('includes a date ISO string in the submitted review', async () => {
            const onSubmit = vi.fn();
            const user = userEvent.setup();
            render(<ReviewModal product={mockProduct} onClose={vi.fn()} onSubmit={onSubmit} />);

            await user.type(screen.getByPlaceholderText('Your name'), 'Dana');
            await user.type(screen.getByPlaceholderText('Your review'), 'Lovely!');
            await user.click(screen.getByRole('button', { name: /submit/i }));

            const submittedReview = onSubmit.mock.calls[0][0];
            expect(submittedReview.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        });

        it('resets the form after submission', async () => {
            const user = userEvent.setup();
            render(<ReviewModal product={mockProduct} onClose={vi.fn()} onSubmit={vi.fn()} />);

            await user.type(screen.getByPlaceholderText('Your name'), 'Eve');
            await user.type(screen.getByPlaceholderText('Your review'), 'Nice!');
            await user.click(screen.getByRole('button', { name: /submit/i }));

            expect((screen.getByPlaceholderText('Your name') as HTMLInputElement).value).toBe('');
            expect((screen.getByPlaceholderText('Your review') as HTMLTextAreaElement).value).toBe('');
        });
    });

    describe('closing the modal', () => {
        it('calls onClose when the Close button is clicked', async () => {
            const onClose = vi.fn();
            const user = userEvent.setup();
            render(<ReviewModal product={mockProduct} onClose={onClose} onSubmit={vi.fn()} />);

            await user.click(screen.getByRole('button', { name: /close/i }));

            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when the backdrop is clicked', async () => {
            const onClose = vi.fn();
            const user = userEvent.setup();
            const { container } = render(
                <ReviewModal product={mockProduct} onClose={onClose} onSubmit={vi.fn()} />
            );

            const backdrop = container.querySelector('.modal-backdrop') as HTMLElement;
            await user.click(backdrop);

            expect(onClose).toHaveBeenCalled();
        });

        it('does not call onClose when the modal content is clicked', async () => {
            const onClose = vi.fn();
            const user = userEvent.setup();
            const { container } = render(
                <ReviewModal product={mockProduct} onClose={onClose} onSubmit={vi.fn()} />
            );

            const modalContent = container.querySelector('.modal-content') as HTMLElement;
            await user.click(modalContent);

            expect(onClose).not.toHaveBeenCalled();
        });
    });
});
