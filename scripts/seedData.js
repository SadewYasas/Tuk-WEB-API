const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const Province = require('../models/Province');
const District = require('../models/District');
const Station = require('../models/Station');
const TukTuk = require('../models/TukTuk');
const User = require('../models/User');
const LocationHistory = require('../models/LocationHistory');

// Load environment variables
dotenv.config();

// Sri Lanka Master Data
const provinces = [
  { name: 'Western', code: 'WP', region: 'West' },
  { name: 'Central', code: 'CP', region: 'Central' },
  { name: 'Southern', code: 'SP', region: 'South' },
  { name: 'Northern', code: 'NP', region: 'North' },
  { name: 'Eastern', code: 'EP', region: 'East' },
  { name: 'North Western', code: 'NWP', region: 'North West' },
  { name: 'North Central', code: 'NCP', region: 'North Central' },
  { name: 'Uva', code: 'UP', region: 'Uva' },
  { name: 'Sabaragamuwa', code: 'SG', region: 'Sabaragamuwa' },
];

const districtsByProvince = {
  'Western': ['Colombo', 'Gampaha', 'Kalutara'],
  'Central': ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern': ['Galle', 'Matara', 'Hambantota'],
  'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  'Eastern': ['Trincomalee', 'Batticaloa', 'Ampara'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  'Uva': ['Badulla', 'Monaragala'],
  'Sabaragamuwa': ['Ratnapura', 'Kegalle'],
};

// Map center points for districts to generate realistic coordinates
const districtCoordinates = {
  'Colombo': { lat: 6.9271, lng: 79.8612 },
  'Gampaha': { lat: 7.0873, lng: 79.9996 },
  'Kalutara': { lat: 6.5854, lng: 79.9607 },
  'Kandy': { lat: 7.2906, lng: 80.6337 },
  'Matale': { lat: 7.4675, lng: 80.6234 },
  'Nuwara Eliya': { lat: 6.9497, lng: 80.7839 },
  'Galle': { lat: 6.0328, lng: 80.2168 },
  'Matara': { lat: 5.9549, lng: 80.5469 },
  'Hambantota': { lat: 6.1246, lng: 81.1185 },
  'Jaffna': { lat: 9.6615, lng: 80.0255 },
  'Kilinochchi': { lat: 9.3803, lng: 80.3770 },
  'Mannar': { lat: 8.9810, lng: 79.9044 },
  'Vavuniya': { lat: 8.7542, lng: 80.4982 },
  'Mullaitivu': { lat: 9.2671, lng: 80.8142 },
  'Trincomalee': { lat: 8.5874, lng: 81.2152 },
  'Batticaloa': { lat: 7.7102, lng: 81.6924 },
  'Ampara': { lat: 7.2840, lng: 81.6724 },
  'Kurunegala': { lat: 7.4818, lng: 80.3609 },
  'Puttalam': { lat: 8.0362, lng: 79.8283 },
  'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
  'Polonnaruwa': { lat: 7.9403, lng: 81.0188 },
  'Badulla': { lat: 6.9934, lng: 81.0550 },
  'Monaragala': { lat: 6.8728, lng: 81.3507 },
  'Ratnapura': { lat: 6.6828, lng: 80.3992 },
  'Kegalle': { lat: 7.2513, lng: 80.3464 },
};

const tukTukNames = [
  'Speed Dragon', 'Golden Wheel', 'Colombo Express', 'Quick Rider', 'Lucky Number',
  'Power Runner', 'City Star', 'Swift Motion', 'Happy Ride', 'Bright Future',
  'Quick Pulse', 'Moon Light', 'Star Express', 'Fire Dragon', 'Cloud Nine',
  'Ocean Wave', 'Desert Wind', 'Thunder Bolt', 'Silver Arrow', 'Golden Ray',
];

const generateTukTuks = () => {
  const tukTuks = [];
  let registrationNum = 1;

  for (const province of provinces) {
    const districtsList = districtsByProvince[province.name] || [];
    for (const district of districtsList) {
      // Generate 10 tuk tuks per district (25 * 10 = 250 total)
      for (let i = 0; i < 10; i++) {
        const randomName = tukTukNames[Math.floor(Math.random() * tukTukNames.length)];
        const center = districtCoordinates[district] || { lat: 7.8731, lng: 80.7718 }; // Default SL center
        
        tukTuks.push({
          registrationNumber: `TK-${String(registrationNum).padStart(5, '0')}`,
          ownerName: `${randomName} Owner ${registrationNum}`,
          province: province.name,
          district: district,
          lastKnownLocation: {
            latitude: center.lat + (Math.random() - 0.5) * 0.1,
            longitude: center.lng + (Math.random() - 0.5) * 0.1,
            timestamp: new Date(),
          },
        });
        registrationNum++;
      }
    }
  }
  return tukTuks;
};

const generateLocationHistory = (savedTukTuks) => {
  const historyLogs = [];
  const now = new Date();
  
  for (const tuktuk of savedTukTuks) {
    const centerLat = tuktuk.lastKnownLocation.latitude;
    const centerLng = tuktuk.lastKnownLocation.longitude;
    
    // Generate logs for past 7 days, 1 ping every 4 hours = 42 pings
    for (let day = 7; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour += 4) {
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);
        
        // Slight randomization from the center
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lngOffset = (Math.random() - 0.5) * 0.05;
        
        historyLogs.push({
          tukTukId: tuktuk._id,
          latitude: centerLat + latOffset,
          longitude: centerLng + lngOffset,
          timestamp: timestamp,
          speed: Math.floor(Math.random() * 40) + 10, // 10-50 km/h
          accuracy: Math.floor(Math.random() * 10) + 1,
        });
      }
    }
  }
  return historyLogs;
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
    await LocationHistory.deleteMany({});
    await User.deleteMany({});
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

    // Seed stations (1 per district)
    const stationsToSeed = savedDistricts.map((district, index) => {
      const center = districtCoordinates[district.name] || { lat: 7.8731, lng: 80.7718 };
      return {
        name: `${district.name} Main Police Station`,
        code: `ST-${String(index + 1).padStart(3, '0')}`,
        province: district.province,
        district: district._id,
        provinceName: district.provinceName,
        districtName: district.name,
        latitude: center.lat,
        longitude: center.lng,
      };
    });
    const savedStations = await Station.insertMany(stationsToSeed);
    console.log(`✓ Seeded ${savedStations.length} stations`);

    // Seed tuk-tuks
    const tukTuks = generateTukTuks();
    const savedTukTuks = await TukTuk.insertMany(tukTuks);
    console.log(`✓ Seeded ${savedTukTuks.length} tuk-tuks`);

    // Seed location history
    console.log('Generating location history (this may take a few seconds)...');
    const historyLogs = generateLocationHistory(savedTukTuks);
    const savedHistory = await LocationHistory.insertMany(historyLogs);
    console.log(`✓ Seeded ${savedHistory.length} location history records (7 days per TukTuk)`);

    // Seed admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@tuktuking.com',
      password: 'Admin@123',
      role: 'admin',
      province: provinces[0].name,
      district: districtsByProvince['Western'][0],
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

    // Export simulation data to JSON
    const exportData = {
      summary: {
        provincesCount: savedProvinces.length,
        districtsCount: savedDistricts.length,
        stationsCount: savedStations.length,
        tukTuksCount: savedTukTuks.length,
        locationLogsCount: savedHistory.length,
      },
      provinces: savedProvinces.map(p => ({ name: p.name, code: p.code })),
      districts: savedDistricts.map(d => ({ name: d.name, province: d.provinceName })),
      stations: savedStations.map(s => ({ name: s.name, district: s.districtName })),
      tukTuks: savedTukTuks.map(t => ({ registration: t.registrationNumber, province: t.province, district: t.district })),
      sampleLocationLogs: savedHistory.slice(0, 10) // Only export a sample of logs to keep file size small
    };
    
    const outputPath = path.join(__dirname, '..', 'simulation_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`✓ Exported simulation data summary to ${outputPath}`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`Total: ${savedProvinces.length} provinces, ${savedDistricts.length} districts, ${savedStations.length} stations, ${savedTukTuks.length} tuk-tuks, ${savedHistory.length} location pings.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
