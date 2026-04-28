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
import PolicyModal from '../PolicyModal';

describe('PolicyModal', () => {
  test('プライバシーポリシー文言が表示される', () => {
    render(<PolicyModal open={true} type="policy" onClose={() => {}} />);
      expect(screen.getAllByText(/プライバシーポリシー/).length).toBeGreaterThan(0);
  });

  test('利用規約文言が表示される', () => {
    render(<PolicyModal open={true} type="terms" onClose={() => {}} />);
    expect(screen.getByText(/利用規約/)).toBeInTheDocument();
  });

  test('閉じるボタンでonCloseが呼ばれる', () => {
    const handleClose = jest.fn();
    render(<PolicyModal open={true} type="policy" onClose={handleClose} />);
    fireEvent.click(screen.getByText('×'));
    expect(handleClose).toHaveBeenCalled();
  });
});