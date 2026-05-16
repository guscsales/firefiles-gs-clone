import { Geist, Geist_Mono, Source_Serif_4 } from 'next/font/google';

export const fontSans = Geist({
  variable: '--font-sans',
  subsets: ['latin']
});

export const fontHeading = Source_Serif_4({
  variable: '--font-heading',
  subsets: ['latin']
});

export const fontMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin']
});
