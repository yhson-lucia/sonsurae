/**
 * ThemeToggle 핵심 동작 검증.
 *
 * 시스템(아무것도 저장 X) → 라이트 → 다크 → 시스템 순환 + localStorage 저장 + data-theme 갱신.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ThemeToggle } from './ThemeToggle';

function setSystemPrefersDark(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: prefersDark && query.includes('dark'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

describe('ThemeToggle', () => {
  it('마운트 후 초기 모드는 system 이고, localStorage 가 비어있다', async () => {
    setSystemPrefersDark(false);
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /테마/ });
    expect(button.getAttribute('aria-label')).toContain('시스템 설정 따라가기');
    expect(window.localStorage.getItem('theme')).toBeNull();
  });

  it('첫 클릭하면 라이트 모드가 되고 localStorage 에 light 가 저장된다', async () => {
    setSystemPrefersDark(true);
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /테마/ });
    await user.click(button);

    expect(button.getAttribute('aria-label')).toContain('라이트 모드');
    expect(window.localStorage.getItem('theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('두 번째 클릭하면 다크 모드가 된다', async () => {
    setSystemPrefersDark(false);
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /테마/ });
    await user.click(button); // → light
    await user.click(button); // → dark

    expect(button.getAttribute('aria-label')).toContain('다크 모드');
    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('세 번째 클릭하면 system 으로 돌아오고 localStorage 가 비워진다', async () => {
    setSystemPrefersDark(false); // 시스템은 라이트 선호
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /테마/ });
    await user.click(button); // → light
    await user.click(button); // → dark
    await user.click(button); // → system

    expect(button.getAttribute('aria-label')).toContain('시스템 설정 따라가기');
    expect(window.localStorage.getItem('theme')).toBeNull();
    // system 모드 + 시스템이 라이트 선호 → data-theme 은 'light'
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('초기에 localStorage 에 dark 가 저장돼 있으면 다크 모드로 시작한다', async () => {
    setSystemPrefersDark(false);
    window.localStorage.setItem('theme', 'dark');
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: /테마/ });
    expect(button.getAttribute('aria-label')).toContain('다크 모드');
  });
});
