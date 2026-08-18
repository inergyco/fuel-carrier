import { useEffect, useState } from 'react';
import {
  createSmoothedPath,
  pointAlongPath,
  type PathPoint,
} from './path-smoothing';

const DEFAULT_PLAYBACK_MS = 12_000;

type TrajectoryPlaybackOptions = {
  points: readonly PathPoint[];
  enabled: boolean;
  durationMs?: number;
};

export function useTrajectoryPlayback({
  points,
  enabled,
  durationMs = DEFAULT_PLAYBACK_MS,
}: TrajectoryPlaybackOptions) {
  const [position, setPosition] = useState<PathPoint | null>(null);
  const playbackKey = points
    .map(function toSegment(point) {
      return `${point.latitude}:${point.longitude}`;
    })
    .join('|');

  useEffect(
    function animateTrajectory() {
      if (!enabled || points.length === 0) {
        setPosition(null);
        return;
      }

      const path = createSmoothedPath(points);

      if (path.length === 1) {
        setPosition({
          latitude: path[0][0],
          longitude: path[0][1],
        });
        return;
      }

      let frameId = 0;
      const startedAt = performance.now();

      function tick(now: number) {
        const elapsed = now - startedAt;
        const progress = Math.min(1, elapsed / durationMs);
        setPosition(
          pointAlongPath({
            path,
            progress,
          }),
        );

        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        }
      }

      setPosition(
        pointAlongPath({
          path,
          progress: 0,
        }),
      );
      frameId = requestAnimationFrame(tick);

      return function cancelPlayback() {
        cancelAnimationFrame(frameId);
      };
    },
    // playbackKey hashes `points` so the animation is not restarted on a new array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only when the path coordinates change
    [durationMs, enabled, playbackKey],
  );

  return position;
}
