import {
  httpMessagesToFieldErrors,
  zodIssuesToFieldErrors,
} from './field-errors.utils';

describe('field-errors.utils', () => {
  describe('httpMessagesToFieldErrors', () => {
    it('maps class-validator constraint objects to field errors', () => {
      expect(
        httpMessagesToFieldErrors([
          {
            property: 'username',
            constraints: {
              isNotEmpty: 'username should not be empty',
            },
          },
        ]),
      ).toEqual([
        {
          field: 'username',
          message: 'username should not be empty',
        },
      ]);
    });

    it('omits plain string messages without field metadata', () => {
      expect(httpMessagesToFieldErrors(['username is required'])).toEqual([]);
    });
  });

  describe('zodIssuesToFieldErrors', () => {
    it('maps zod issue paths to field names', () => {
      expect(
        zodIssuesToFieldErrors([
          {
            code: 'custom',
            message: 'Username is required',
            path: ['username'],
          },
        ]),
      ).toEqual([
        {
          field: 'username',
          message: 'Username is required',
        },
      ]);
    });
  });
});
