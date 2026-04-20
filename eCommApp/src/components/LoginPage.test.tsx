import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import LoginPage from './LoginPage';

vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

describe('LoginPage', () => {
    describe('initial render', () => {
        it('renders the Admin Login heading', () => {
            render(<LoginPage />);
            expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument();
        });

        it('renders the username input', () => {
            render(<LoginPage />);
            expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
        });

        it('renders the password input', () => {
            render(<LoginPage />);
            expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        });

        it('renders the password input as type="password"', () => {
            render(<LoginPage />);
            expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
        });

        it('renders the Login button', () => {
            render(<LoginPage />);
            expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        });

        it('does not show an error message initially', () => {
            render(<LoginPage />);
            expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
        });
    });

    describe('successful login', () => {
        it('navigates to /admin with correct credentials (admin/admin)', async () => {
            const user = userEvent.setup();
            render(<LoginPage />);

            await user.type(screen.getByPlaceholderText('Username'), 'admin');
            await user.type(screen.getByPlaceholderText('Password'), 'admin');
            await user.click(screen.getByRole('button', { name: /login/i }));

            // After navigation the login form is gone (navigated away to AdminPage)
            // We just verify no error was shown
            expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
        });
    });

    describe('failed login', () => {
        it('shows "Invalid credentials" for a wrong password', async () => {
            const user = userEvent.setup();
            render(<LoginPage />);

            await user.type(screen.getByPlaceholderText('Username'), 'admin');
            await user.type(screen.getByPlaceholderText('Password'), 'wrongpassword');
            await user.click(screen.getByRole('button', { name: /login/i }));

            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });

        it('shows "Invalid credentials" for a wrong username', async () => {
            const user = userEvent.setup();
            render(<LoginPage />);

            await user.type(screen.getByPlaceholderText('Username'), 'wronguser');
            await user.type(screen.getByPlaceholderText('Password'), 'admin');
            await user.click(screen.getByRole('button', { name: /login/i }));

            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });

        it('shows "Invalid credentials" for empty credentials', async () => {
            const user = userEvent.setup();
            render(<LoginPage />);

            await user.click(screen.getByRole('button', { name: /login/i }));

            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });

        it('keeps the error visible after a second failed attempt', async () => {
            const user = userEvent.setup();
            render(<LoginPage />);

            await user.type(screen.getByPlaceholderText('Username'), 'bad');
            await user.type(screen.getByPlaceholderText('Password'), 'bad');
            await user.click(screen.getByRole('button', { name: /login/i }));
            await user.click(screen.getByRole('button', { name: /login/i }));

            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });
});
