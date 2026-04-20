import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminPage from './AdminPage';

vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

describe('AdminPage', () => {
    describe('initial render', () => {
        it('renders the admin portal heading', () => {
            render(<AdminPage />);
            expect(screen.getByRole('heading', { name: /welcome to the admin portal/i })).toBeInTheDocument();
        });

        it('renders the sale percent input', () => {
            render(<AdminPage />);
            expect(screen.getByLabelText(/Set Sale Percent/i)).toBeInTheDocument();
        });

        it('renders the input with a default value of 0', () => {
            render(<AdminPage />);
            expect((screen.getByLabelText(/Set Sale Percent/i) as HTMLInputElement).value).toBe('0');
        });

        it('renders the Submit button', () => {
            render(<AdminPage />);
            expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
        });

        it('renders the End Sale button', () => {
            render(<AdminPage />);
            expect(screen.getByRole('button', { name: /end sale/i })).toBeInTheDocument();
        });

        it('shows "No sale active." initially', () => {
            render(<AdminPage />);
            expect(screen.getByText('No sale active.')).toBeInTheDocument();
        });

        it('renders the Back to Storefront button', () => {
            render(<AdminPage />);
            expect(screen.getByRole('button', { name: /back to storefront/i })).toBeInTheDocument();
        });

        it('does not show an error message initially', () => {
            render(<AdminPage />);
            expect(screen.queryByText(/Invalid input/i)).not.toBeInTheDocument();
        });
    });

    describe('setting a sale', () => {
        it('shows the sale active message after submitting a valid number', async () => {
            const user = userEvent.setup();
            render(<AdminPage />);

            await user.clear(screen.getByLabelText(/Set Sale Percent/i));
            await user.type(screen.getByLabelText(/Set Sale Percent/i), '20');
            await user.click(screen.getByRole('button', { name: /submit/i }));

            expect(screen.getByText('All products are 20% off!')).toBeInTheDocument();
        });

        it('hides "No sale active." after a valid sale is set', async () => {
            const user = userEvent.setup();
            render(<AdminPage />);

            await user.clear(screen.getByLabelText(/Set Sale Percent/i));
            await user.type(screen.getByLabelText(/Set Sale Percent/i), '10');
            await user.click(screen.getByRole('button', { name: /submit/i }));

            expect(screen.queryByText('No sale active.')).not.toBeInTheDocument();
        });

        it('accepts a decimal sale percentage', async () => {
            const user = userEvent.setup();
            render(<AdminPage />);

            await user.clear(screen.getByLabelText(/Set Sale Percent/i));
            await user.type(screen.getByLabelText(/Set Sale Percent/i), '5.5');
            await user.click(screen.getByRole('button', { name: /submit/i }));

            expect(screen.getByText('All products are 5.5% off!')).toBeInTheDocument();
        });
    });

    describe('ending a sale', () => {
        it('resets to "No sale active." when End Sale is clicked', async () => {
            const user = userEvent.setup();
            render(<AdminPage />);

            await user.clear(screen.getByLabelText(/Set Sale Percent/i));
            await user.type(screen.getByLabelText(/Set Sale Percent/i), '15');
            await user.click(screen.getByRole('button', { name: /submit/i }));
            await user.click(screen.getByRole('button', { name: /end sale/i }));

            expect(screen.getByText('No sale active.')).toBeInTheDocument();
        });

        it('resets the input value to 0 when End Sale is clicked', async () => {
            const user = userEvent.setup();
            render(<AdminPage />);

            await user.clear(screen.getByLabelText(/Set Sale Percent/i));
            await user.type(screen.getByLabelText(/Set Sale Percent/i), '25');
            await user.click(screen.getByRole('button', { name: /end sale/i }));

            expect((screen.getByLabelText(/Set Sale Percent/i) as HTMLInputElement).value).toBe('0');
        });
    });

    describe('invalid input handling', () => {
        it('shows an error message when a non-numeric value is submitted', async () => {
            const user = userEvent.setup();
            render(<AdminPage />);

            await user.clear(screen.getByLabelText(/Set Sale Percent/i));
            await user.type(screen.getByLabelText(/Set Sale Percent/i), 'abc');
            await user.click(screen.getByRole('button', { name: /submit/i }));

            expect(screen.getByText(/Invalid input/i)).toBeInTheDocument();
        });

        it('does not update the sale percent when input is invalid', async () => {
            const user = userEvent.setup();
            render(<AdminPage />);

            await user.clear(screen.getByLabelText(/Set Sale Percent/i));
            await user.type(screen.getByLabelText(/Set Sale Percent/i), 'xyz');
            await user.click(screen.getByRole('button', { name: /submit/i }));

            expect(screen.getByText('No sale active.')).toBeInTheDocument();
        });

        it('does not show an error for a valid numeric submission', async () => {
            const user = userEvent.setup();
            render(<AdminPage />);

            await user.clear(screen.getByLabelText(/Set Sale Percent/i));
            await user.type(screen.getByLabelText(/Set Sale Percent/i), '10');
            await user.click(screen.getByRole('button', { name: /submit/i }));

            expect(screen.queryByText(/Invalid input/i)).not.toBeInTheDocument();
        });
    });
});
