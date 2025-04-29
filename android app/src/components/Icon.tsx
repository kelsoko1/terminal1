import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react-native';

interface IconProps extends Omit<LucideProps, 'color'> {
  icon: LucideIcon;
  color?: string;
  size?: number;
}

export default function Icon({ icon: IconComponent, color, size = 24, ...props }: IconProps) {
  return (
    <IconComponent
      {...props}
      size={size}
      color={color}
    />
  );
} 