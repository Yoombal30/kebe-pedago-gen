import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardProps } from '@/components/ui/card';
import { hoverLift, fadeIn } from '@/lib/animations';

interface AnimatedCardProps extends CardProps {
  delay?: number;
  hover?: boolean;
}

/**
 * Carte avec animations au chargement et au survol
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  delay = 0,
  hover = true,
  className,
  ...props
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      transition={{ ...fadeIn.transition, delay }}
      {...(hover ? hoverLift : {})}
    >
      <Card className={className} {...props}>
        {children}
      </Card>
    </motion.div>
  );
};
