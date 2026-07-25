import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
