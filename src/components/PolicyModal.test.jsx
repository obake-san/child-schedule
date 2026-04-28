import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PolicyModal from './PolicyModal';

test('モーダルに「プライバシー」または「利用規約」などの文言が表示される', () => {
  render(<PolicyModal open={true} onClose={() => {}} />);
  // どちらかの文言が表示されていればOK
  const found = [
    /プライバシー|ポリシー|privacy/i,
    /利用規約|terms/i
  ].some((regex) => {
    try {
      return !!screen.getByText(regex);
    } catch {
      return false;
    }
  });
  expect(found).toBe(true);
});
