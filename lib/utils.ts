import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}/${
    (d.getMonth() + 1).toString().padStart(2, "0")
  }/${d.getFullYear()}`;
};
