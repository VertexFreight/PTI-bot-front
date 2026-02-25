export interface PhotoShot {
  id: string;
  label: string;
  description: string;
  required: boolean;
  category: 'tractor' | 'coupling' | 'trailer';
  tips: string[];
}

export const TRACTOR_PHOTOS: PhotoShot[] = [
  {
    id: 'front',
    label: 'Front View',
    description: 'Full front: lights, windshield, mirrors, bumper',
    required: true,
    category: 'tractor',
    tips: [
      'All lights visible (headlights, turn signals, clearance)',
      'Full windshield in frame',
      'Both mirrors visible',
      'License plate visible',
    ],
  },
  {
    id: 'left_side',
    label: 'Left Side',
    description: 'Driver side: body, fuel tank, door, steps',
    required: true,
    category: 'tractor',
    tips: [
      'Full side of truck',
      'Fuel tank and cap visible',
      'Door, steps, grab handles',
      'Marker lights visible',
    ],
  },
  {
    id: 'right_side',
    label: 'Right Side',
    description: 'Passenger side: body, DEF tank, door, steps',
    required: true,
    category: 'tractor',
    tips: [
      'Full side of truck',
      'DEF tank and cap visible',
      'Door, steps, grab handles',
      'Air tanks visible',
    ],
  },
  {
    id: 'rear_drive_axle',
    label: 'Rear & Drive Axle',
    description: 'Back of tractor: dual tires, frame, mud flaps',
    required: true,
    category: 'tractor',
    tips: [
      'Both dual tires visible',
      'Frame and mud flaps',
      'Tail lights (if no trailer)',
      'Suspension visible',
    ],
  },
  {
    id: 'engine',
    label: 'Engine Compartment',
    description: 'Under hood: belts, hoses, fluids, battery',
    required: true,
    category: 'tractor',
    tips: [
      'Hood fully open',
      'Belts and hoses visible',
      'Battery area visible',
      'Check for leaks',
    ],
  },
  {
    id: 'driver_wheels_brakes',
    label: 'Driver Wheels & Brakes',
    description: 'Driver side: steer tire, brake drum, chamber',
    required: true,
    category: 'tractor',
    tips: [
      'Steer tire tread and sidewall',
      'Lug nuts visible',
      'Brake drum and chamber',
      'Slack adjuster area',
    ],
  },
  {
    id: 'passenger_wheels_brakes',
    label: 'Passenger Wheels & Brakes',
    description: 'Passenger side: steer tire, brake drum, chamber',
    required: true,
    category: 'tractor',
    tips: [
      'Steer tire tread and sidewall',
      'Lug nuts visible',
      'Brake drum and chamber',
      'Slack adjuster area',
    ],
  },
  {
    id: 'interior',
    label: 'Interior/Cab',
    description: 'Inside cab: seat belt, fire extinguisher, safety equipment',
    required: true,
    category: 'tractor',
    tips: [
      'Seat belt visible',
      'Fire extinguisher mounted and visible',
      'Safety triangles location',
      'Registration/insurance visible',
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard Gauges',
    description: 'Dashboard with engine running showing all gauges',
    required: true,
    category: 'tractor',
    tips: [
      'Engine must be running',
      'All gauges visible',
      'No warning lights on',
      'Air pressure gauges showing',
    ],
  },
];

export const COUPLING_PHOTOS: PhotoShot[] = [
  {
    id: 'air_lines',
    label: 'Air Lines & Electrical',
    description: 'Glad hands, air lines, electrical cord connection',
    required: true,
    category: 'coupling',
    tips: [
      'Glad hands fully connected',
      'Air lines not kinked/cut',
      'Electrical cord connected',
      'Lines not dragging',
    ],
  },
];


export const TRAILER_PHOTOS: PhotoShot[] = [
  {
    id: 'trailer_front',
    label: 'Trailer Front',
    description: 'Photo of the front of the trailer',
    required: true,
    category: 'trailer',
    tips: [
      'Entire front of trailer visible',
      'No obstructions',
      'License plate clearly visible',
    ],
  },
  {
    id: 'trailer_back',
    label: 'Trailer Back',
    description: 'Photo of the rear of the trailer',
    required: true,
    category: 'trailer',
    tips: [
      'Rear doors fully visible',
      'License plate clearly visible',
      'No obstructions or damage hiding details',
    ],
  },
  {
    id: 'trailer_left',
    label: 'Trailer Left Side',
    description: 'Photo of the left side of the trailer',
    required: true,
    category: 'trailer',
    tips: [
      'Show wheels and side panels',
      'No missing parts',
      'No damage or scratches',
    ],
  },
  {
    id: 'trailer_right',
    label: 'Trailer Right Side',
    description: 'Photo of the right side of the trailer',
    required: true,
    category: 'trailer',
    tips: [
      'Show wheels and side panels',
      'No missing parts',
      'No damage or scratches',
    ],
  },
];



export interface ManualCheck {
  id: string;
  label: string;
  description: string;
  category: 'lights' | 'brakes' | 'steering' | 'safety' | 'trailer';
  critical: boolean;
}

export const MANUAL_CHECKS: ManualCheck[] = [
  {
    id: 'headlights_work',
    label: 'Headlights Working',
    description: 'High and low beams functional',
    category: 'lights',
    critical: true,
  },
  {
    id: 'turn_signals_work',
    label: 'Turn Signals Working',
    description: 'Left and right turn signals functional',
    category: 'lights',
    critical: true,
  },
  {
    id: 'brake_lights_work',
    label: 'Brake Lights Working',
    description: 'Brake lights activate when pedal pressed',
    category: 'lights',
    critical: true,
  },
  {
    id: 'clearance_lights_work',
    label: 'Clearance Lights Working',
    description: 'All marker/clearance lights functional',
    category: 'lights',
    critical: true,
  },
  {
    id: 'hazards_work',
    label: '4-Way Hazards Working',
    description: 'Hazard lights flash correctly',
    category: 'lights',
    critical: true,
  },
  {
    id: 'air_brake_test',
    label: 'Air Brake Test Passed',
    description: 'Governor cut-out, low air warning, spring brake pop-out',
    category: 'brakes',
    critical: true,
  },
  {
    id: 'parking_brake_holds',
    label: 'Parking Brake Holds',
    description: 'Parking brake holds against gentle acceleration',
    category: 'brakes',
    critical: true,
  },
  {
    id: 'service_brake_ok',
    label: 'Service Brake Stops Straight',
    description: 'Vehicle stops without pulling left or right',
    category: 'brakes',
    critical: true,
  },
  {
    id: 'slack_adjusters_ok',
    label: 'Slack Adjusters OK',
    description: 'Less than 1 inch play when pulled by hand',
    category: 'brakes',
    critical: true,
  },
  {
    id: 'steering_play_ok',
    label: 'Steering Wheel Play OK',
    description: 'Less than 10 degrees free play',
    category: 'steering',
    critical: true,
  },
  {
    id: 'lug_nuts_tight',
    label: 'Lug Nuts Tight',
    description: 'All lug nuts checked and tight',
    category: 'steering',
    critical: true,
  },
  {
    id: 'steer_tires_ok',
    label: 'Steer Tires OK',
    description: 'Adequate tread depth, proper inflation, no cuts or sidewall damage',
    category: 'steering',
    critical: true,
  },
  {
    id: 'drive_tires_ok',
    label: 'Drive Tires OK',
    description: 'Adequate tread depth, proper inflation, no mismatched sizes, no damage',
    category: 'steering',
    critical: true,
  },
  {
    id: 'horn_works',
    label: 'Horn Works',
    description: 'Both city and air horns functional',
    category: 'safety',
    critical: true,
  },
  {
    id: 'wipers_work',
    label: 'Wipers & Washers Work',
    description: 'Windshield wipers and washers functional',
    category: 'safety',
    critical: false,
  },
  {
    id: 'heater_defroster_work',
    label: 'Heater/Defroster Works',
    description: 'Heat and defrost operational',
    category: 'safety',
    critical: false,
  },
  {
    id: 'mirrors_adjusted',
    label: 'Mirrors Adjusted',
    description: 'All mirrors properly adjusted for driver',
    category: 'safety',
    critical: true,
  },
  {
    id: 'trailer_lights_work',
    label: 'Trailer Lights Working',
    description: 'All trailer tail, brake, turn, and marker lights functional',
    category: 'trailer',
    critical: true,
  },
  {
    id: 'trailer_brakes_ok',
    label: 'Trailer Brakes Functional',
    description: 'Trailer brakes engage and release properly via tractor controls',
    category: 'trailer',
    critical: true,
  },
  {
    id: 'trailer_tires_ok',
    label: 'Trailer Tires OK',
    description: 'Adequate tread depth, proper inflation, no sidewall damage',
    category: 'trailer',
    critical: true,
  },
  {
    id: 'trailer_coupling_secure',
    label: 'Coupling / Fifth Wheel Secure',
    description: 'Fifth wheel locked, kingpin engaged, jaws closed, release handle in',
    category: 'trailer',
    critical: true,
  },
  {
    id: 'trailer_gladhands_ok',
    label: 'Glad Hands & Air Lines Secure',
    description: 'Air lines connected properly, no leaks, electrical cord plugged in',
    category: 'trailer',
    critical: true,
  },
  {
    id: 'trailer_landing_gear_up',
    label: 'Landing Gear Fully Raised',
    description: 'Landing gear cranked up and handle secured',
    category: 'trailer',
    critical: true,
  },
  {
    id: 'trailer_doors_secured',
    label: 'Trailer Doors Secured',
    description: 'Rear doors closed and latched, seals intact',
    category: 'trailer',
    critical: true,
  },
  {
    id: 'trailer_reflective_tape',
    label: 'DOT Reflective Tape Intact',
    description: 'Reflective conspicuity tape on sides and rear in good condition',
    category: 'trailer',
    critical: false,
  },
];

export function getTractorPhotos(): PhotoShot[] {
  return TRACTOR_PHOTOS;
}

export function getCouplingPhotos(): PhotoShot[] {
  return COUPLING_PHOTOS;
}

export function getTrailerPhotos(): PhotoShot[] {
  return TRAILER_PHOTOS;
}

export function getAllPhotos(hasTrailer: boolean): PhotoShot[] {
  if (hasTrailer) {
    return [...TRACTOR_PHOTOS, ...COUPLING_PHOTOS];
  }
  return TRACTOR_PHOTOS;
}

export function getManualChecks(): ManualCheck[] {
  return MANUAL_CHECKS;
}

export function getCriticalChecks(): ManualCheck[] {
  return MANUAL_CHECKS.filter(c => c.critical);
}