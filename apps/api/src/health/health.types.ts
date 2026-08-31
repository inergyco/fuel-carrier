export type DependencyStatus = 'up' | 'down';

export type DependencyCheck = {
  status: DependencyStatus;
  message?: string;
};

export type ReadinessChecks = {
  postgres: DependencyCheck;
  redis: DependencyCheck;
};

export type ReadinessResult = {
  status: 'ok' | 'error';
  checks: ReadinessChecks;
};
