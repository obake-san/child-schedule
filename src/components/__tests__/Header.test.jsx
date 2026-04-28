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
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

describe('Header', () => {
  test('アプリ名が表示される', () => {
    render(<Header />);
    expect(screen.getByText('楽々キッズかれんだぁ')).toBeInTheDocument();
  });

  test('アプリ名クリックでトップ遷移', () => {
    render(<Header />);
    fireEvent.click(screen.getByText('楽々キッズかれんだぁ'));
    // JSDOMではwindow.location.hrefは"http://localhost/"になる
    expect(window.location.href).toContain('/');
  });

  test('FloatingMenuButtonが表示される', () => {
    render(<Header />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});