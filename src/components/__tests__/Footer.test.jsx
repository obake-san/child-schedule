beforeAll(() => {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    };
  };
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '../Footer2';

describe('Footer', () => {
  test('著作権表記が表示される', () => {
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  test('サービス名・バージョンが表示される', () => {
    render(<Footer />);
    expect(screen.getByText(/楽々キッズかれんだぁ/)).toBeInTheDocument();
    expect(screen.getByText(/Version/)).toBeInTheDocument();
  });

  test('リンクが正しいURLか', () => {
    render(<Footer />);
    expect(screen.getByText('利用ガイド').closest('a')).toHaveAttribute('href', '/guide.html');
    expect(screen.getByText('FAQ').closest('a')).toHaveAttribute('href', '/faq.html');
    expect(screen.getByText('プライバシーポリシー').closest('a')).toHaveAttribute('href', '/privacy.html');
    expect(screen.getByText('利用規約').closest('a')).toHaveAttribute('href', '/terms.html');
  });
});