import {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  forwardRef,
  ComponentPropsWithoutRef,
  MouseEventHandler,
} from "react";
import { Link } from "@/i18n/routing";

type ButtonVariant = "primary" | "secondary" | "subtle";

interface BaseButtonProps {
  variant?: ButtonVariant;
}

const BASE_STYLES =
  "inline-flex items-center justify-center font-semibold transition-all duration-300 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-yellow " +
  "disabled:opacity-50 disabled:pointer-events-none cursor-pointer tracking-wide uppercase " +
  "text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 border rounded-custom";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-primary-yellow to-primary-yellow-light text-black border-transparent hover:shadow-glow hover:brightness-105 active:scale-98",
  secondary:
    "bg-surface-elevated text-text-primary border-accent hover:border-accent-border-hover hover:bg-surface-elevated/85 active:scale-98",
  subtle:
    "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-surface/40 active:scale-98",
};

// ─── Button ───────────────────────────────────────────────────────────────────
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & BaseButtonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", children, ...props }, ref) => (
    <button
      ref={ref}
      className={`${BASE_STYLES} ${VARIANT_STYLES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

// ─── LinkButton ───────────────────────────────────────────────────────────────
type LocaleLinkProps = ComponentPropsWithoutRef<typeof Link>;

export type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  BaseButtonProps & {
    href: string;
    localeAware?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
  };

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    { className = "", variant = "primary", href, localeAware = true, children, onClick, ...props },
    ref
  ) => {
    const combinedClassName = `${BASE_STYLES} ${VARIANT_STYLES[variant]} ${className}`;
    const isExternal =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#");

    if (localeAware && !isExternal) {
      const linkProps: LocaleLinkProps = {
        href,
        className: combinedClassName,
        onClick: onClick as LocaleLinkProps["onClick"],
      };
      return <Link {...linkProps}>{children}</Link>;
    }

    return (
      <a
        href={href}
        ref={ref}
        className={combinedClassName}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }
);
LinkButton.displayName = "LinkButton";
