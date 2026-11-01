import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** shadcn 模式的 Button(cva + cn;主题 tokens 循 T09) */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 ease-qi disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--gold)] text-[var(--primary-foreground)] border border-[var(--gold)] hover:bg-[var(--gold-bright)] hover:border-[var(--gold-bright)]',
        outline:
          'border border-[var(--gold-dim,var(--gold))] bg-transparent text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--primary-foreground)]',
        ghost:
          'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
        link: 'bg-transparent text-[var(--gold)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-6 tracking-[0.2em]',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-10 text-base tracking-[0.3em]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps): React.JSX.Element {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { Button, buttonVariants };
