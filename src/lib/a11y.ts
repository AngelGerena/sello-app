import type { HTMLAttributes } from 'react';

/** Spread onto the wrapper of any purely decorative card preview (landing gallery, design tiles, dashboard thumbnails).
    `inert` removes every sample link and button inside from the keyboard order and from screen readers, and
    `aria-hidden` hides the visual copy. Real, labelled controls (like "Open demo") sit next to the preview. */
export const decorative = { 'aria-hidden': true, inert: '' } as unknown as HTMLAttributes<HTMLElement>;
