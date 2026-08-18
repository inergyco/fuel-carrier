export type LatLng = {
  latitude: number;
  longitude: number;
};

const STEPS_PER_SEGMENT = 10;

/**
 * Street-following demo routes for seeded cars.
 * Coordinates follow major urban corridors so replay looks like a real city drive.
 */
const CITY_ROUTE_WAYPOINTS: Record<string, Array<[number, number]>> = {
  // Tehran — Vanak → Valiasr → Parkway → Fatemi
  '۱۲ب۳۴۵-۶۷': [
    [35.7575, 51.4097],
    [35.7532, 51.4103],
    [35.7486, 51.4108],
    [35.7434, 51.4112],
    [35.7378, 51.411],
    [35.7324, 51.4102],
    [35.7271, 51.4074],
    [35.7226, 51.4021],
    [35.7188, 51.3964],
    [35.7152, 51.3908],
    [35.7116, 51.3864],
    [35.7079, 51.3918],
    [35.7048, 51.3986],
    [35.7021, 51.4054],
  ],
  // Tehran — Azadi → Enghelab → Ferdowsi → Baharestan
  '۴۵ج۷۸۹-۲۱': [
    [35.6997, 51.3377],
    [35.7004, 51.3486],
    [35.7009, 51.3594],
    [35.7013, 51.3708],
    [35.7015, 51.3816],
    [35.7014, 51.3908],
    [35.7012, 51.3994],
    [35.7015, 51.4088],
    [35.7018, 51.4182],
    [35.6996, 51.4256],
    [35.6968, 51.4328],
    [35.6934, 51.4384],
  ],
  // Tehran — Tajrish → Shariati → Sadr → Resalat
  '۷۸د۱۲۳-۴۵': [
    [35.8044, 51.4335],
    [35.7978, 51.4362],
    [35.7906, 51.4384],
    [35.7834, 51.4418],
    [35.7772, 51.4456],
    [35.7714, 51.4502],
    [35.7658, 51.4548],
    [35.7586, 51.4576],
    [35.7512, 51.4554],
    [35.7448, 51.4508],
    [35.7392, 51.4442],
  ],
  // Tehran — Sadeghiyeh → Hemmat → Modarres → Vanak
  '۳۴س۵۶۷-۸۹': [
    [35.7248, 51.3342],
    [35.7306, 51.3418],
    [35.7364, 51.3496],
    [35.7422, 51.3584],
    [35.7478, 51.3682],
    [35.7526, 51.3786],
    [35.7564, 51.3888],
    [35.7588, 51.3984],
    [35.7596, 51.4072],
    [35.7575, 51.4097],
  ],
  // Isfahan — Naqsh-e Jahan → Chahar Bagh → Si-o-se-pol
  '۲۳ب۴۵۶-۷۸': [
    [32.6577, 51.6778],
    [32.6558, 51.6752],
    [32.6534, 51.6724],
    [32.6512, 51.6696],
    [32.6486, 51.6672],
    [32.6458, 51.6658],
    [32.6432, 51.6684],
    [32.6408, 51.6726],
    [32.6386, 51.6772],
    [32.6372, 51.6824],
  ],
  // Isfahan — Khaju → riverside → Atigh
  '۵۶ج۷۸۹-۱۲': [
    [32.6348, 51.6886],
    [32.6374, 51.6842],
    [32.6406, 51.6804],
    [32.6442, 51.6778],
    [32.6484, 51.6762],
    [32.6526, 51.6754],
    [32.6568, 51.6768],
    [32.6604, 51.6802],
    [32.6632, 51.6856],
    [32.6648, 51.6918],
  ],
  // Isfahan — Kaveh → Imam Khomeini → Hasht Behesht
  '۸۹د۰۱۲-۳۴': [
    [32.6846, 51.6672],
    [32.6788, 51.6684],
    [32.6724, 51.6692],
    [32.6662, 51.6698],
    [32.6604, 51.6706],
    [32.6548, 51.6718],
    [32.6496, 51.6742],
    [32.6454, 51.6786],
    [32.6428, 51.6842],
  ],
  // Isfahan — east ring toward Malekshahr then south
  '۱۱س۲۳۴-۵۶': [
    [32.7012, 51.7014],
    [32.6946, 51.6988],
    [32.6874, 51.6962],
    [32.6802, 51.6944],
    [32.6728, 51.6936],
    [32.6656, 51.6948],
    [32.6588, 51.6976],
    [32.6532, 51.7018],
    [32.6486, 51.7064],
  ],
  // Shiraz — Quran Gate → Eram → Chamran
  '۶۷ب۸۹۰-۱۲': [
    [29.6398, 52.5526],
    [29.6364, 52.5482],
    [29.6328, 52.5436],
    [29.6286, 52.5394],
    [29.6242, 52.5368],
    [29.6194, 52.5352],
    [29.6146, 52.5348],
    [29.6098, 52.5364],
    [29.6056, 52.5398],
  ],
  // Shiraz — Zand → Vakil → Azadi
  '۹۰ج۱۲۳-۴۵': [
    [29.6194, 52.5386],
    [29.6178, 52.5432],
    [29.6164, 52.5486],
    [29.6152, 52.5542],
    [29.6146, 52.5604],
    [29.6158, 52.5662],
    [29.6184, 52.5714],
    [29.6222, 52.5756],
    [29.6268, 52.5782],
  ],
  // Shiraz — Maaliabad → Ghasrodasht → Namazi
  '۱۳د۴۵۶-۷۸': [
    [29.6524, 52.5128],
    [29.6476, 52.5184],
    [29.6428, 52.5236],
    [29.6378, 52.5284],
    [29.6326, 52.5322],
    [29.6274, 52.5348],
    [29.6222, 52.5362],
    [29.6168, 52.5368],
    [29.6116, 52.5384],
  ],
  // Shiraz — south loop around Sattar Khan / Modarres
  '۴۶س۷۸۹-۰۱': [
    [29.5984, 52.5382],
    [29.6018, 52.5446],
    [29.6054, 52.5508],
    [29.6092, 52.5564],
    [29.6136, 52.5608],
    [29.6184, 52.5636],
    [29.6232, 52.5644],
    [29.6278, 52.5618],
    [29.6312, 52.5566],
    [29.6326, 52.5498],
  ],
};

export function getCityRoute(licensePlate: string): LatLng[] | null {
  const waypoints = CITY_ROUTE_WAYPOINTS[licensePlate];
  if (!waypoints) {
    return null;
  }

  return interpolateWaypoints({
    waypoints,
    stepsPerSegment: STEPS_PER_SEGMENT,
  });
}

export function interpolateWaypoints({
  waypoints,
  stepsPerSegment,
}: {
  waypoints: Array<[number, number]>;
  stepsPerSegment: number;
}): LatLng[] {
  if (waypoints.length === 0) {
    return [];
  }

  const path: LatLng[] = [];

  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const [startLat, startLng] = waypoints[index];
    const [endLat, endLng] = waypoints[index + 1];

    for (let step = 0; step < stepsPerSegment; step += 1) {
      const t = step / stepsPerSegment;
      path.push({
        latitude: startLat + (endLat - startLat) * t,
        longitude: startLng + (endLng - startLng) * t,
      });
    }
  }

  const last = waypoints[waypoints.length - 1];
  path.push({ latitude: last[0], longitude: last[1] });

  return path;
}
