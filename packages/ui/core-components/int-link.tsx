'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function IntLink({ href, ...props }: React.ComponentProps<typeof Link>) {
  const router = useRouter();
  return (
    <Link
      href={href}
      onMouseEnter={() => {
        router.prefetch(href.toString());
      }}
      {...props}
    />
  );
}
