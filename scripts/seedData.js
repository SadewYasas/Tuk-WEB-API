const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Province = require('../models/Province');
const District = require('../models/District');
const Station = require('../models/Station');
const TukTuk = require('../models/TukTuk');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Sample data
const provinces = [
  { name: 'Bangkok', code: 'BKK', region: 'Central' },
  { name: 'Chiang Mai', code: 'CNX', region: 'Northern' },
  { name: 'Phuket', code: 'PHK', region: 'Southern' },
  { name: 'Pattaya', code: 'UTP', region: 'Eastern' },
  { name: 'Khon Kaen', code: 'KKC', region: 'Northeastern' },
  { name: 'Chiang Rai', code: 'CEI', region: 'Northern' },
  { name: 'Rayong', code: 'RYG', region: 'Eastern' },
  { name: 'Krabi', code: 'KBV', region: 'Southern' },
  { name: 'Udon Thani', code: 'UTH', region: 'Northeastern' },
];

const districtsByProvince = {
  Bangkok: [
    'Chatuchak', 'Bangsue', 'Bang Khen', 'Lad Phrao', 'Saphan Sung',
    'Yan Nawa', 'Bang Khun Thian', 'Min Buri', 'Sai Mai',
  ],
  'Chiang Mai': [
    'Mueang Chiang Mai', 'Suthep', 'San Kamphaeng', 'Hang Dong', 'Doi Saket',
    'San Sai', 'Chiang Dao', 'Fang',
  ],
  Phuket: ['Mueang Phuket', 'Kathu', 'Karon', 'Kamala', 'Thalang', 'Patong'],
  Pattaya: ['Banglamung', 'Naklua', 'Sattahip'],
  'Khon Kaen': [
    'Mueang Khon Kaen', 'Phu Wiang', 'Mancha Khiri', 'Non Sila', 'Ban Phai',
  ],
  'Chiang Rai': ['Mueang Chiang Rai', 'Wiangchiang Rai', 'Mae Sai'],
  Rayong: ['Mueang Rayong', 'Ban Phe', 'Map Ta Phut', 'Wang Chan'],
  Krabi: ['Mueang Krabi', 'Ao Nang', 'Phi Phi'],
  'Udon Thani': ['Mueang Udon Thani', 'Phibun Rak', 'Nong Han'],
};

const stations = [
  // Bangkok stations
  { name: 'Central Bangkok Station', province: 'Bangkok', district: 'Chatuchak', lat: 13.7563, lng: 100.5018 },
  { name: 'Chatuchak Station', province: 'Bangkok', district: 'Chatuchak', lat: 13.8009, lng: 100.5543 },
  { name: 'Bangsue Station', province: 'Bangkok', district: 'Bangsue', lat: 13.8164, lng: 100.5282 },
  { name: 'Bang Khen Station', province: 'Bangkok', district: 'Bang Khen', lat: 13.8459, lng: 100.5639 },
  // Chiang Mai stations
  { name: 'Central Chiang Mai Station', province: 'Chiang Mai', district: 'Mueang Chiang Mai', lat: 18.7883, lng: 98.9853 },
  { name: 'Suthep Station', province: 'Chiang Mai', district: 'Suthep', lat: 18.8075, lng: 98.9511 },
  { name: 'San Kamphaeng Station', province: 'Chiang Mai', district: 'San Kamphaeng', lat: 18.8256, lng: 99.0824 },
  { name: 'Hang Dong Station', province: 'Chiang Mai', district: 'Hang Dong', lat: 18.7219, lng: 98.8934 },
  // Phuket stations
  { name: 'Central Phuket Station', province: 'Phuket', district: 'Mueang Phuket', lat: 8.1167, lng: 98.35 },
  { name: 'Kathu Station', province: 'Phuket', district: 'Kathu', lat: 8.2925, lng: 98.2969 },
  { name: 'Karon Station', province: 'Phuket', district: 'Karon', lat: 8.0764, lng: 98.3066 },
  { name: 'Patong Station', province: 'Phuket', district: 'Patong', lat: 8.1572, lng: 98.2945 },
  // Pattaya stations
  { name: 'Central Pattaya Station', province: 'Pattaya', district: 'Banglamung', lat: 12.9272, lng: 100.8772 },
  { name: 'Naklua Station', province: 'Pattaya', district: 'Naklua', lat: 12.9753, lng: 100.8803 },
  // Khon Kaen stations
  { name: 'Central Khon Kaen Station', province: 'Khon Kaen', district: 'Mueang Khon Kaen', lat: 16.4406, lng: 102.8362 },
  { name: 'Phu Wiang Station', province: 'Khon Kaen', district: 'Phu Wiang', lat: 16.5028, lng: 102.0653 },
  // Chiang Rai stations
  { name: 'Central Chiang Rai Station', province: 'Chiang Rai', district: 'Mueang Chiang Rai', lat: 19.9108, lng: 99.8392 },
  // Rayong stations
  { name: 'Central Rayong Station', province: 'Rayong', district: 'Mueang Rayong', lat: 12.6833, lng: 101.3 },
  { name: 'Map Ta Phut Station', province: 'Rayong', district: 'Map Ta Phut', lat: 12.6706, lng: 101.5325 },
  // Krabi stations
  { name: 'Central Krabi Station', province: 'Krabi', district: 'Mueang Krabi', lat: 8.0863, lng: 98.9063 },
  { name: 'Ao Nang Station', province: 'Krabi', district: 'Ao Nang', lat: 8.1792, lng: 98.8272 },
  // Udon Thani stations
  { name: 'Central Udon Thani Station', province: 'Udon Thani', district: 'Mueang Udon Thani', lat: 17.3867, lng: 102.7858 },
];

const tukTukNames = [
  'Speed Dragon', 'Golden Wheel', 'Bangkok Express', 'Quick Rider', 'Lucky Number',
  'Power Runner', 'City Star', 'Swift Motion', 'Happy Ride', 'Bright Future',
  'Quick Pulse', 'Moon Light', 'Star Express', 'Fire Dragon', 'Cloud Nine',
  'Ocean Wave', 'Desert Wind', 'Thunder Bolt', 'Silver Arrow', 'Golden Ray',
];

const generateTukTuks = () => {
  const tukTuks = [];
  let registrationNum = 1;

  for (const province of provinces) {
    for (let i = 0; i < 22; i++) {
      const districtsList = districtsByProvince[province.name] || [];
      const randomDistrict = districtsList[Math.floor(Math.random() * districtsList.length)];
      const randomName = tukTukNames[Math.floor(Math.random() * tukTukNames.length)];

      tukTuks.push({
        registrationNumber: `TK-${String(registrationNum).padStart(5, '0')}`,
        ownerName: `${randomName} Owner ${registrationNum}`,
        province: province.name,
        district: randomDistrict || districtsList[0],
        lastKnownLocation: {
          latitude: 13.7563 + (Math.random() - 0.5) * 10,
          longitude: 100.5018 + (Math.random() - 0.5) * 10,
          timestamp: new Date(),
        },
      });
      registrationNum++;
    }
  }

  return tukTuks;
};

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Province.deleteMany({});
    await District.deleteMany({});
    await Station.deleteMany({});
    await TukTuk.deleteMany({});
    console.log('Cleared existing data');

    // Seed provinces
    const savedProvinces = await Province.insertMany(provinces);
    console.log(`✓ Seeded ${savedProvinces.length} provinces`);

    // Seed districts
    const districts = [];
    for (const [provinceName, districtList] of Object.entries(districtsByProvince)) {
      const province = savedProvinces.find((p) => p.name === provinceName);
      for (const districtName of districtList) {
        districts.push({
          name: districtName,
          code: districtName.substring(0, 3).toUpperCase(),
          province: province._id,
          provinceName: province.name,
        });
      }
    }
    const savedDistricts = await District.insertMany(districts);
    console.log(`✓ Seeded ${savedDistricts.length} districts`);

    // Seed stations
    let stationCodeCounter = 1;
    const stationsToSeed = stations.map((station) => {
      const province = savedProvinces.find((p) => p.name === station.province);
      if (!province) {
        console.warn(`Province not found for station: ${station.name}`);
        return null;
      }

      const district = savedDistricts.find(
        (d) => d.provinceName === station.province && d.name === station.district
      );
      if (!district) {
        console.warn(`District not found for station: ${station.name} in province: ${station.province}`);
        return null;
      }

      return {
        name: station.name,
        code: `ST-${String(stationCodeCounter++).padStart(3, '0')}`,
        province: province._id,
        district: district._id,
        provinceName: province.name,
        districtName: district.name,
        latitude: station.lat,
        longitude: station.lng,
      };
    }).filter(s => s !== null);

    const savedStations = await Station.insertMany(stationsToSeed);
    console.log(`✓ Seeded ${savedStations.length} stations`);

    // Seed tuk-tuks
    const tukTuks = generateTukTuks();
    const savedTukTuks = await TukTuk.insertMany(tukTuks);
    console.log(`✓ Seeded ${savedTukTuks.length} tuk-tuks`);

    // Seed admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@tuktuking.com',
      password: 'Admin@123',
      role: 'admin',
      province: provinces[0].name,
      district: districtsByProvince['Bangkok'][0],
    });
    await adminUser.save();
    console.log('✓ Seeded admin user (email: admin@tuktuking.com, password: Admin@123)');

    // Seed test users for each province
    for (let i = 0; i < provinces.length; i++) {
      const province = provinces[i];
      const districts = districtsByProvince[province.name] || [];
      const testUser = new User({
        username: `operator${i + 1}`,
        email: `operator${i + 1}@tuktuking.com`,
        password: 'Operator@123',
        role: 'operator',
        province: province.name,
        district: districts[0],
      });
      await testUser.save();
    }
    console.log(`✓ Seeded ${provinces.length} test operator users`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`Total: 9 provinces, 25 districts, 20+ stations, 198+ tuk-tuks`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
