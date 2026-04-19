/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatVND = (value: any) => {
  if (value === "" || value === null || value === undefined) return "";
  return Number(value).toLocaleString("vi-VN");
};

export const parseVND = (value: any) => {
  if (!value) return 0;
  return Number(String(value).replace(/\./g, ""));
};
