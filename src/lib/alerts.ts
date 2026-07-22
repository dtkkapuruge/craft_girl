import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

/**
 * Shows a dark-themed confirmation dialog with a red delete button.
 * Matches the admin dashboard design system.
 */
export const showConfirmDelete = (
  title: string,
  text: string,
  onConfirm: () => void
) => {
  Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626', // Tailwind red-600
    cancelButtonColor: '#4b5563',  // Tailwind gray-600
    confirmButtonText: 'Yes, delete',
    cancelButtonText: 'Cancel',
    background: '#160b24',         // Dark purple background from admin layout
    color: '#f3f4f6',              // Light text color
    iconColor: '#ef4444',          // Red icon
    customClass: {
      popup: 'rounded-2xl border border-[#2d1b46]/60 shadow-2xl font-sans',
      title: 'text-lg font-bold text-white',
      htmlContainer: 'text-sm text-gray-300',
      confirmButton: 'rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50',
      cancelButton: 'rounded-xl px-4 py-2.5 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/50',
    },
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
};

/**
 * Shows a success toast notification.
 */
export const showSuccessToast = (message: string) => {
  toast.success(message);
};

/**
 * Shows an error toast notification.
 */
export const showErrorToast = (message: string) => {
  toast.error(message);
};
