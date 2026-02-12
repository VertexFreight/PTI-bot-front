export const API_URL = "https://pti-bot-839184709762.europe-west1.run.app";

export const TEST_PHOTO_MAP: Record<string, string> = {
  'front': 'frontview.jpg',
  'left_side': 'leftview.jpg',
  'right_side': 'rightview.jpg',
  'rear_drive_axle': 'rareview.jpg',
  'engine': 'enginecompartment.jpg',
  'driver_wheels_brakes': 'driverbrakes.jpg',
  'passenger_wheels_brakes': 'passengerbrakes.jpg',
  'interior': 'interior.jpg',
  'dashboard': 'dashboard.jpg',
  'fifth_wheel': 'enginecompartment.jpg',
  'air_lines': 'enginecompartment.jpg',
};

export const testImages = import.meta.glob('../../photos/*', {
  eager: true,
  as: 'url',
}) as Record<string, string>;

export const getTestImageUrl = (filename: string): string | undefined => {
  const key = Object.keys(testImages).find(k => k.endsWith(filename));
  return key ? testImages[key] : undefined;
};