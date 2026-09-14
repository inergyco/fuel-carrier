import { toPaginatedResult, getPaginationOffset } from './pagination.utils';

describe('pagination.utils', () => {
  it('builds paginated envelopes from an options object', () => {
    expect(
      toPaginatedResult({
        items: ['a', 'b'],
        page: 2,
        limit: 2,
        totalItems: 5,
      }),
    ).toEqual({
      items: ['a', 'b'],
      page: 2,
      limit: 2,
      totalItems: 5,
      totalPages: 3,
    });
  });

  it('computes offset from page/limit', () => {
    expect(getPaginationOffset({ page: 1, limit: 10 })).toBe(0);
    expect(getPaginationOffset({ page: 3, limit: 20 })).toBe(40);
  });
});
