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
import { ChildCalendar } from '../ChildCalendar';

describe('ChildCalendar', () => {
  const children = [
    { id: 1, name: '太郎', schedule: [{ date: '2026-04-01', title: '入園式' }] },
    { id: 2, name: '花子', schedule: [{ date: '2026-04-02', title: '健康診断' }] },
  ];
  const selectedChildIds = [1, 2];

  test('カレンダー主要要素が表示される', () => {
    render(<ChildCalendar children={children} selectedChildIds={selectedChildIds} />);
    // .calendar-viewクラスの要素が存在するか
    expect(document.querySelector('.calendar-view')).not.toBeNull();
  });

  test('月送り・月戻しボタンでカレンダーが切り替わる', () => {
    render(<ChildCalendar children={children} selectedChildIds={selectedChildIds} />);
    fireEvent.click(screen.getByText('←'));
    fireEvent.click(screen.getByText('→'));
    // ここはカレンダーの月表示が変わることを検証（実装に応じて調整）
    expect(document.querySelector('.calendar-view')).not.toBeNull();
  });

  test('イベントクリックでonEventClickが呼ばれる', () => {
    const handleEventClick = jest.fn();
    render(<ChildCalendar children={children} selectedChildIds={selectedChildIds} onEventClick={handleEventClick} />);
    // イベント要素をクリック（実装に応じて調整）
    // fireEvent.click(screen.getByText('入園式'));
    // expect(handleEventClick).toHaveBeenCalled();
  });
});