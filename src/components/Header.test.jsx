import '@testing-library/jest-dom';
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
import { render, screen } from '@testing-library/react';
import Header from './Header';

test('ヘッダーにアプリ名が表示される', () => {
  render(<Header />);
  // 例: "子どもスケジュール管理" など、実際のアプリ名に合わせて修正してください
  expect(screen.getByText(/楽々キッズかれんだぁ/)).toBeInTheDocument();
});
