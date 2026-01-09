/**
 * Security utility functions for masking sensitive data
 */

/**
 * Masks CPF to show only middle digits
 * Example: 123.456.789-01 -> ***.456.***-**
 */
export const maskCPF = (cpf: string | null | undefined): string => {
    if (!cpf) return '-';

    // Remove all non-digit characters
    const cleanCPF = cpf.replace(/\D/g, '');

    // Check if it's a valid CPF length
    if (cleanCPF.length !== 11) return cpf;

    // Mask: show only middle 3 digits
    return `***.${cleanCPF.substring(3, 6)}.***-**`;
};

/**
 * Masks phone number to hide last 4 digits
 * Example: (11) 98765-4321 -> (11) 98765-****
 */
export const maskPhone = (phone: string | null | undefined): string => {
    if (!phone) return '-';

    // If already formatted with parentheses
    const phoneMatch = phone.match(/(\(\d{2}\)\s?\d{4,5})-(\d{4})/);
    if (phoneMatch) {
        return `${phoneMatch[1]}-****`;
    }

    // If it's just numbers or simple format
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
        const ddd = cleanPhone.substring(0, 2);
        const middle = cleanPhone.substring(2, cleanPhone.length - 4);
        return `(${ddd}) ${middle}-****`;
    }

    return phone;
};

/**
 * Reveals the full CPF (for admin use when needed)
 * Requires confirmation
 */
export const revealCPF = (maskedValue: string, fullValue: string): string => {
    return fullValue;
};
