import hotelHero from './hotel_hero.jpg';
import roomStandard from './room_standard.jpg';
import roomDeluxe from './room_deluxe.jpg';
import roomSuite from './room_suite.jpg';
import roomExecutive from './room_executive.jpg';
import roomPresidential from './room_presidential.jpg';
import roomFamily from './room_family.jpg';

export const images = {
  hero: hotelHero,
  'room_standard.jpg': roomStandard,
  'room_deluxe.jpg': roomDeluxe,
  'room_suite.jpg': roomSuite,
  'room_executive.jpg': roomExecutive,
  'room_presidential.jpg': roomPresidential,
  'room_family.jpg': roomFamily,
  // SVG fallbacks mapping
  'room_standard.svg': roomStandard,
  'room_deluxe.svg': roomDeluxe,
  'room_suite.svg': roomSuite,
  'room_executive.svg': roomExecutive,
  'room_presidential.svg': roomPresidential,
  'room_family.svg': roomFamily,
};

export const getRoomImage = (imageName) => {
  return images[imageName] || images['room_standard.jpg'];
};
