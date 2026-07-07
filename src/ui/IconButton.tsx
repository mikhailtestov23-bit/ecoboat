import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, children, className = "", ...props }: IconButtonProps) {
  return (
    <button {...props} className={`icon-button ${className}`.trim()} aria-label={label} title={label}>
      {children}
    </button>
  );
}
