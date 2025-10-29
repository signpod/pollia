'use client';

import { TYPE_LABELS } from '@/constants/survey';
import { SurveyQuestionType } from '@prisma/client';
import { Typo } from '@repo/ui/components';
import { cn } from '@repo/ui/lib';
import { cva } from 'class-variance-authority';
import { ComponentPropsWithoutRef, ElementType } from 'react';

type TypeTagOwnProps<C extends ElementType> = {
  as?: C;
  type: SurveyQuestionType;
  selected?: boolean;
};

type TypeTagProps<C extends ElementType = 'div'> = TypeTagOwnProps<C> &
  Omit<ComponentPropsWithoutRef<C>, keyof TypeTagOwnProps<C>>;

export function TypeTag<C extends ElementType = 'div'>({
  as,
  type,
  selected = false,
  className,
  ...props
}: TypeTagProps<C>) {
  const Component = as || 'div';
  const isButton = as === 'button';

  const typeVariants = cva(
    cn(
      'px-2 py-1 rounded-full text-center ring-1 ring-transparent',
      isButton && 'transition-all duration-200 ease-in-out',
      isButton && 'active:scale-95 hover:scale-105'
    ),
    {
      variants: {
        type: {
          EITHER_OR: `bg-amber-50 text-amber-600 ${selected && 'bg-amber-100 text-amber-700 ring-1 ring-amber-400 hover:ring-amber-300'}`,
          SCALE: `bg-green-50 text-green-700 ${selected && 'bg-green-100 text-green-800 ring-1 ring-green-400 hover:ring-green-300'}`,
          MULTIPLE_CHOICE: `bg-sky-50 text-sky-600 ${selected && 'bg-sky-100 text-sky-700 ring-1 ring-sky-400 hover:ring-sky-300'}`,
          SUBJECTIVE: `bg-rose-50 text-rose-600 ${selected && 'bg-rose-100 text-rose-700 ring-1 ring-rose-400 hover:ring-rose-300'}`,
        },
      },
    }
  );

  if (!TYPE_LABELS[type]) {
    return null;
  }

  return (
    <Component {...props}>
      <Typo.Body size="small" className={cn(typeVariants({ type }), className)}>
        {TYPE_LABELS[type]}
      </Typo.Body>
    </Component>
  );
}
