export type PathPoint = {
  latitude: number;
  longitude: number;
};

export function createSmoothedPath(
  pathPoints: readonly PathPoint[],
): [number, number][] {
  if (pathPoints.length <= 2) {
    return pathPoints.map(function toLatLng(point) {
      return [point.latitude, point.longitude];
    });
  }

  const smoothed: [number, number][] = [];

  for (let index = 0; index < pathPoints.length - 1; index += 1) {
    const previous = pathPoints[Math.max(0, index - 1)];
    const start = pathPoints[index];
    const end = pathPoints[index + 1];
    const next = pathPoints[Math.min(pathPoints.length - 1, index + 2)];

    for (let step = 0; step < 12; step += 1) {
      const t = step / 12;
      smoothed.push(
        interpolateCatmullRom({
          previous,
          start,
          end,
          next,
          t,
        }),
      );
    }
  }

  const lastPoint = pathPoints[pathPoints.length - 1];
  smoothed.push([lastPoint.latitude, lastPoint.longitude]);

  return smoothed;
}

function interpolateCatmullRom({
  previous,
  start,
  end,
  next,
  t,
}: {
  previous: PathPoint;
  start: PathPoint;
  end: PathPoint;
  next: PathPoint;
  t: number;
}): [number, number] {
  return [
    catmullRomValue({
      previous: previous.latitude,
      start: start.latitude,
      end: end.latitude,
      next: next.latitude,
      t,
    }),
    catmullRomValue({
      previous: previous.longitude,
      start: start.longitude,
      end: end.longitude,
      next: next.longitude,
      t,
    }),
  ];
}

function catmullRomValue({
  previous,
  start,
  end,
  next,
  t,
}: {
  previous: number;
  start: number;
  end: number;
  next: number;
  t: number;
}): number {
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 *
    (2 * start +
      (-previous + end) * t +
      (2 * previous - 5 * start + 4 * end - next) * t2 +
      (-previous + 3 * start - 3 * end + next) * t3)
  );
}

export function pointAlongPath({
  path,
  progress,
}: {
  path: [number, number][];
  progress: number;
}): PathPoint | null {
  if (path.length === 0) {
    return null;
  }

  if (path.length === 1) {
    return { latitude: path[0][0], longitude: path[0][1] };
  }

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const targetIndex = clampedProgress * (path.length - 1);
  const startIndex = Math.floor(targetIndex);
  const endIndex = Math.min(path.length - 1, startIndex + 1);
  const segmentProgress = targetIndex - startIndex;
  const start = path[startIndex];
  const end = path[endIndex];

  return {
    latitude: start[0] + (end[0] - start[0]) * segmentProgress,
    longitude: start[1] + (end[1] - start[1]) * segmentProgress,
  };
}
