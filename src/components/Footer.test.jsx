import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from './Footer';

test('フッターに著作権表記が表示される', () => {
  render(<Footer />);
  expect(screen.getByText(/copyright|©|コピ/)).toBeInTheDocument();
});
