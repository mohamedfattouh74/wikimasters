import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {showToast , ToastOptions} from 'nextjs-toast-notify';


const toastOptions: ToastOptions = {
  duration: 4000,
  progress: true,
  position: 'top-right',
  transition: "fadeIn",
  icon: '',
  sound: false,
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function isValidFile(file: File): boolean {

  const MAX_FILE_SIZE = 10* 1024 * 1024; // 10MB
  const allowedFileTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (file.size > MAX_FILE_SIZE) {
    return false;
  }

  if (!allowedFileTypes.includes(file.type)) {
    return false;
  }

  return true;
}


export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function showSuccessMessage(message: string) {
  showToast.success(message, toastOptions);
}

export function showErrorMessage(message: string) {
  showToast.error(message, toastOptions);
}
