declare module 'liveline' {
  import { FC } from 'react';

  interface LivelineProps {
    data: { time: number; value: number }[];
    value: number;
    color?: string;
    width?: number;
    height?: number;
    showGrid?: boolean;
    showTooltip?: boolean;
    animate?: boolean;
    // Add other props as needed based on library documentation
  }

  export const Liveline: FC<LivelineProps>;
}
