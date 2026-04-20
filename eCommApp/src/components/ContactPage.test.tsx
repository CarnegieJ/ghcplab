import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import ContactPage from './ContactPage';

vi.mock('./Header', () => ({
    default: () => <div data-testid="header">Header</div>
}));

vi.mock('./Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));

describe('ContactPage', () => {
    it('renders the contact form', () => {
        render(<ContactPage />);

        expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/your request/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('updates form fields on input', () => {
        render(<ContactPage />);

        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '555-1234' } });
        fireEvent.change(screen.getByLabelText(/your request/i), { target: { value: 'Hello there!' } });

        expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
        expect(screen.getByLabelText(/email address/i)).toHaveValue('jane@example.com');
        expect(screen.getByLabelText(/phone number/i)).toHaveValue('555-1234');
        expect(screen.getByLabelText(/your request/i)).toHaveValue('Hello there!');
    });

    it('shows thank-you modal with personalised message after submit', () => {
        render(<ContactPage />);

        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/your request/i), { target: { value: 'I need help.' } });

        fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/thank you, jane/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('clears the form and closes the modal when Continue is clicked', () => {
        render(<ContactPage />);

        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/your request/i), { target: { value: 'I need help.' } });

        fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);
        fireEvent.click(screen.getByRole('button', { name: /continue/i }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toHaveValue('');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email address/i)).toHaveValue('');
        expect(screen.getByLabelText(/your request/i)).toHaveValue('');
    });

    it('enforces max 300 character limit on the request field', () => {
        render(<ContactPage />);

        const longText = 'a'.repeat(350);
        const requestField = screen.getByLabelText(/your request/i);
        fireEvent.change(requestField, { target: { value: longText } });

        // The component caps at 300 characters
        expect((requestField as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(300);
    });

    it('shows the character count for the request field', () => {
        render(<ContactPage />);

        expect(screen.getByText('0/300')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/your request/i), { target: { value: 'Hello' } });

        expect(screen.getByText('5/300')).toBeInTheDocument();
    });
});
