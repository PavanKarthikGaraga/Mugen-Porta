import { toast } from 'sonner';

export const handleApiError = async (response) => {
    if (response.status === 401) {
        // JWT expired or unauthorized
        toast.error('Session expired. Please login again.');
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = '/auth/login';
        }, 2000);
        return true; // Indicates auth error was handled
    }
    
    if (!response.ok) {
        try {
            const errorData = await response.json();
            toast.error(errorData.error || 'An error occurred');
        } catch {
            toast.error('An unexpected error occurred');
        }
        return true; // Indicates error was handled
    }
    
    return false; // No error
};

export const handleApiSuccess = (message) => {
    toast.success(message);
};
