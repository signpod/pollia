'use client';

import { cn } from '@/lib/utils';
import { PlusIcon } from 'lucide-react';
import { PointIcon } from '../common/PointIcon';
import { Typo } from '@repo/ui/components';
import { motion } from 'framer-motion';

interface FloatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'icon-only' | 'with-text';
}

export default function FloatingButton({
  variant = 'icon-only',
  title,
  className,
  ...props
}: FloatingButtonProps) {
  const showText = variant === 'with-text';

  return (
    <button
      className={cn(
        'relative rounded-full shadow-lg bg-zinc-800',
        'flex items-center justify-center overflow-hidden',
        'active:scale-95 transition-all duration-200',
        className
      )}
      aria-label={title}
      {...props}
    >
      <motion.div
        className="flex items-center justify-center gap-3 p-4"
        animate={{
          gap: showText ? '12px' : '0px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <PointIcon className="size-6 text-white shrink-0">
          <PlusIcon className="size-4.5 text-zinc-950" strokeWidth={2.8} />
        </PointIcon>

        <motion.div
          className="overflow-hidden"
          animate={{
            width: showText ? '74px' : '0px',
            opacity: showText ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Typo.ButtonText
            size="large"
            className="text-white whitespace-nowrap"
          >
            {title}
          </Typo.ButtonText>
        </motion.div>
      </motion.div>
    </button>
  );
}
