import { FLEET_TOTAL_CAPACITY_LITERS } from '@fuel-carrier/shared-types';
import { isLowFuel, listHighResistanceProbes } from './car-condition-alert.utils';

describe('car-condition-alert.utils', () => {
  it('lists only probes above the alert threshold', () => {
    expect(
      listHighResistanceProbes({
        tankToGround: 10,
        tankToNozzle: 10.1,
        groundToVehicle: 4,
      }),
    ).toEqual([{ probe: 'tankToNozzle', ohms: 10.1 }]);
  });

  it('treats fuel under 25% of fleet capacity as low', () => {
    const quarter = FLEET_TOTAL_CAPACITY_LITERS * 0.25;

    expect(isLowFuel(quarter)).toBe(false);
    expect(isLowFuel(quarter - 0.1)).toBe(true);
    expect(isLowFuel(0)).toBe(true);
  });
});
