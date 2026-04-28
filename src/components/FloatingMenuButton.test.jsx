beforeAll(() => {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    };
  };
});
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FloatingMenuButton from './FloatingMenuButton';

test('メニューボタンをクリックするとメニューが開く', () => {
  render(<FloatingMenuButton childrenCount={1} />);
  const menuButton = screen.getByLabelText('メニュー');
  fireEvent.click(menuButton);
  expect(screen.getAllByText(/やることリスト|カレンダー|利用ガイド/).length).toBeGreaterThan(0);
});
