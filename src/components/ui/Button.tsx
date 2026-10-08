'use client';

import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconOnly?: boolean;
  icon?: React.ComponentType<{ className?: string; }>;
  trailingIcon?: React.ComponentType<{ className?: string; }>;
}

const VARIANTS: Record<ButtonVariant, string> = {
  // Primary: solid brand blue, white text.
  primary:
    'bg-primary text-white border border-primary hover:bg-primary-hover hover:border-primary-hover',
  // Secondary: white/surface background with dark text and a border — the quiet
  // outline action that sits below the solid blue primary.
  secondary:
    'bg-surface text-ink border border-line-strong hover:bg-surface-2 hover:border-ink-subtle',
  // Ghost: minimal/transparent — for icon buttons, menus, low-emphasis actions.
  ghost: 'bg-transparent text-ink-muted border border-transparent hover:bg-surface-3 hover:text-ink',
  danger: 'bg-danger text-white border border-danger hover:brightness-110'
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 text-small px-2.5 gap-1.5',
  md: 'h-8 text-body px-3 gap-1.5',
  lg: 'h-10 text-body px-4 gap-2'
};

const ICON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10'
};

const GLYPH: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4'
};

/** Variants with a solid coloured fill must render white text, no matter what
 *  the cascade does. Enforced with an inline colour so nothing can override it.
 *  Secondary is a white/outline button, so it is NOT in this list. */
const SOLID_VARIANTS: ButtonVariant[] = ['primary', 'danger'];

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  iconOnly = false,
  icon: Icon,
  trailingIcon: TrailingIcon,
  className,
  children,
  disabled,
  type = 'button',
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const solidText = SOLID_VARIANTS.includes(variant) ? { color: '#ffffff' } : undefined;
  return (
    <button
      type={type}
      disabled={isDisabled}
      style={{ ...solidText, ...style }}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control font-medium',
        'transition-[background-color,border-color,color,transform] duration-fast ease-exit',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'active:scale-[0.985] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        iconOnly ? ICON_SIZES[size] : SIZES[size],
        className
      )}
      {...rest}>

      {loading ?
        <Loader2Icon className={cn(GLYPH[size], 'animate-spin')} aria-hidden /> :

        Icon && <Icon className={GLYPH[size]} aria-hidden />
      }
      {!iconOnly && children}
      {!iconOnly && !loading && TrailingIcon && <TrailingIcon className={GLYPH[size]} aria-hidden />}
    </button>);

}