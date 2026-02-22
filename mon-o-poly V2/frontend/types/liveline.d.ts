declare module 'liveline' {
  import { FC } from 'react';

  interface LivelineProps {
    data: { time: number; value: number }[];
    value: number;
    color?: string;
    theme?: 'light' | 'dark';
    formatValue?: (v: number) => string;
    formatTime?: (t: number) => string;
    showValue?: boolean;
    valueMomentumColor?: boolean;
    exaggerate?: boolean;
    referenceLine?: { value: number; label?: string };
    windows?: { label: string; secs: number }[];
    windowStyle?: 'default' | 'rounded' | 'text';
    onWindowChange?: (secs: number) => void;
    badgeVariant?: 'default' | 'minimal';
    badge?: boolean;
    emptyText?: string;
    loading?: boolean;
    momentum?: boolean | 'up' | 'down' | 'flat';
    scrub?: boolean;
    fill?: boolean;
    pulse?: boolean;
    grid?: boolean;
  }

  export const Liveline: FC<LivelineProps>;
}
