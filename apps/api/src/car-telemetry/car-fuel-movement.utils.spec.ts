import {
  decideFuelMovement,
  toTrackedTransactionId,
} from './car-fuel-movement.utils';

describe('car fuel movements', () => {
  it('records only when the transaction id increases during a load or dispense', () => {
    expect(
      decideFuelMovement({
        previousTransactionId: 4,
        transactionId: 5,
        mode: 'dispensing',
      }),
    ).toBe('record');
    expect(
      decideFuelMovement({
        previousTransactionId: 4,
        transactionId: 5,
        mode: 'loading',
      }),
    ).toBe('record');
    expect(
      decideFuelMovement({
        previousTransactionId: 5,
        transactionId: 5,
        mode: 'dispensing',
      }),
    ).toBe('skip');
  });

  it('moves the cursor without a row when an idle sample advances the transaction id', () => {
    expect(
      decideFuelMovement({
        previousTransactionId: 4,
        transactionId: 5,
        mode: 'idle',
      }),
    ).toBe('advance');
  });

  it('treats a drop, including a power-off reset to zero, as a cursor reset', () => {
    expect(
      decideFuelMovement({
        previousTransactionId: 18,
        transactionId: 0,
        mode: 'idle',
      }),
    ).toBe('reset');
    expect(
      decideFuelMovement({
        previousTransactionId: 0,
        transactionId: 1,
        mode: 'loading',
      }),
    ).toBe('record');
  });

  it('accepts a zero transaction id and rejects values the cursor cannot store', () => {
    expect(toTrackedTransactionId(0)).toBe(0);
    expect(toTrackedTransactionId(125)).toBe(125);
    expect(toTrackedTransactionId(undefined)).toBeNull();
    expect(toTrackedTransactionId(1.5)).toBeNull();
    expect(toTrackedTransactionId(-1)).toBeNull();
    expect(toTrackedTransactionId(2_147_483_648)).toBeNull();
  });
});
