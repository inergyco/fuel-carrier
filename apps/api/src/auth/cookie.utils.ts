function parseExpiresInToMs(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) {
    throw new Error(
      `JWT_EXPIRES_IN must match "<number>[s|m|h|d]". Got: ${expiresIn}`,
    );
  }

  const value = Number(match[1]);
  const unit = match[2];

  const seconds = (() => {
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  })();

  return seconds * 1000;
}

export function getAuthCookieMaxAgeMs(expiresIn: string): number {
  return parseExpiresInToMs(expiresIn);
}
