import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('next/navigation', async () => {
  const actual =
    await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useRouter: () => ({
      refresh: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn()
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams()
  };
});

// jsdom lacks IntersectionObserver, which framer-motion's `whileInView`
// requires at mount. Provide a no-op stub so components that animate on
// scroll render in tests.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = '';
    thresholds = [];
  }
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

// jsdom lacks ResizeObserver, which Radix UI primitives (e.g. Popover via
// @radix-ui/react-use-size) require at mount.
if (typeof globalThis.ResizeObserver === 'undefined') {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;
}

// jsdom lacks Element.prototype.scrollIntoView, which cmdk (used by
// InputAutoComplete) calls on its active item via a layout effect.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
