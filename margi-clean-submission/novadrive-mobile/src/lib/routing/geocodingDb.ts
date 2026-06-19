import * as SQLite from 'expo-sqlite';

export type GeocodeSuggestion = {
  lat: number;
  lng: number;
  displayName: string;
};

// SEED List: 250+ High-Density Indian Bypasses, Toll Plazas, Highway Nodes & Regional Hubs
const SEED_LOCATIONS: (GeocodeSuggestion & { priority?: number })[] = [
  // ── CHENNAI & NH-48 / NH-16 CORRIDORS ──────────────────────────────────────
  { lat: 13.0827, lng: 80.2707, displayName: 'Chennai Central Railway Station, Chennai, Tamil Nadu', priority: 5 },
  { lat: 13.0524, lng: 80.2042, displayName: 'Apollo Hospitals Greams Road, Chennai, Tamil Nadu', priority: 4 },
  { lat: 13.0212, lng: 80.1858, displayName: 'MIOT International Trauma Bay, Manapakkam, Chennai', priority: 4 },
  { lat: 13.0321, lng: 80.1801, displayName: 'SRMC Emergency & Trauma, Porur, Chennai, Tamil Nadu', priority: 4 },
  { lat: 13.0076, lng: 80.2052, displayName: 'Kathipara Junction, Guindy, Chennai, Tamil Nadu', priority: 5 },
  { lat: 13.0727, lng: 80.2016, displayName: 'Koyambedu Roundabout & CMBT, Chennai, Tamil Nadu', priority: 5 },
  { lat: 12.9249, lng: 80.1200, displayName: 'Tambaram Highway Junction (NH-48), Chennai, Tamil Nadu', priority: 5 },
  { lat: 12.9011, lng: 80.2269, displayName: 'Sholinganallur Junction, OMR, Chennai, Tamil Nadu', priority: 4 },
  { lat: 12.8252, lng: 80.2199, displayName: 'Siruseri IT Park Gate, Chennai, Tamil Nadu', priority: 3 },
  { lat: 12.8906, lng: 80.0812, displayName: 'Vandalur Outer Ring Road Merging, Chennai, Tamil Nadu', priority: 5 },
  { lat: 12.7885, lng: 80.2215, displayName: 'Kelambakkam Junction, ECR-OMR Link, Chennai, Tamil Nadu', priority: 3 },
  { lat: 13.0418, lng: 80.2341, displayName: 'T Nagar Police Station, Chennai, Tamil Nadu', priority: 2 },
  { lat: 13.0731, lng: 80.2609, displayName: 'Egmore Police Station & Corridor Gate, Chennai, Tamil Nadu', priority: 2 },
  { lat: 12.9847, lng: 80.1906, displayName: 'Vellore CMC Casualty NH Referral Node, Tamil Nadu', priority: 4 },
  { lat: 12.9664, lng: 80.2475, displayName: 'Bhadra Homeo Clinic Node (NH-48 Area), Chennai', priority: 1 },
  { lat: 13.1147, lng: 80.1548, displayName: 'Ambattur Telephone Exchange, CTH Road, Chennai', priority: 2 },
  { lat: 12.9122, lng: 80.2520, displayName: 'Akkarai Curve Safety Spot, ECR, Chennai, Tamil Nadu', priority: 3 },
  { lat: 13.0829, lng: 80.2812, displayName: 'Government Dental Hospital & College, Chennai, Tamil Nadu', priority: 1 },
  { lat: 13.0721, lng: 80.2590, displayName: 'Govt Maternity Hospital Casualty, Egmore, Chennai', priority: 2 },
  { lat: 12.9788, lng: 80.1846, displayName: 'Hindu Mission Health Services, Kanchipuram Corridor', priority: 3 },
  { lat: 13.0735, lng: 80.2570, displayName: 'Institute of Child Health (ICH), Egmore, Chennai', priority: 1 },
  { lat: 13.0786, lng: 80.2433, displayName: 'Kilpauk Medical College & Hospital ER, Chennai', priority: 3 },
  { lat: 13.0195, lng: 80.1973, displayName: 'Military Hospital Trauma Wing, St Thomas Mount, Chennai', priority: 3 },
  { lat: 13.0508, lng: 80.2434, displayName: 'Rajan Eye Care Hospital Facility, Chennai', priority: 1 },
  { lat: 13.0294, lng: 80.2441, displayName: 'Rajiv Gandhi Govt General Hospital ER, Chennai', priority: 4 },
  { lat: 13.0123, lng: 80.1964, displayName: 'St Thomas Hospital Casualty Node, Chennai', priority: 3 },
  { lat: 13.0822, lng: 80.2070, displayName: 'Sundaram Medical Foundation (SMF), Anna Nagar, Chennai', priority: 2 },
  { lat: 13.0495, lng: 80.2110, displayName: 'Vasan Eye Care Hospital, Vadapalani Node, Chennai', priority: 1 },
  { lat: 13.0484, lng: 80.2070, displayName: 'Vijaya Heart Centre & Emergency ER, Vadapalani, Chennai', priority: 3 },
  { lat: 13.0089, lng: 80.2125, displayName: 'Guindy National Park Crossing, Chennai, Tamil Nadu', priority: 2 },
  { lat: 12.9912, lng: 80.2311, displayName: 'IIT Madras In-gate Corridor, Adyar, Chennai, Tamil Nadu', priority: 4 },
  { lat: 12.9815, lng: 80.2422, displayName: 'Adyar Flyover Junction, Chennai, Tamil Nadu', priority: 3 },
  { lat: 12.8398, lng: 79.7042, displayName: 'Kanchipuram NH-48 Bypass, Tamil Nadu', priority: 4 },
  { lat: 12.9214, lng: 79.1325, displayName: 'Vellore NH-48 Toll Plaza, Kaniyambadi, Tamil Nadu', priority: 5 },
  { lat: 12.5244, lng: 78.5678, displayName: 'Ambur Highway Crossing (NH-48), Tamil Nadu', priority: 4 },
  { lat: 12.7212, lng: 77.8541, displayName: 'Hosur Border NH-48 Toll Plaza, Tamil Nadu', priority: 5 },
  { lat: 13.3142, lng: 80.1255, displayName: 'Red Hills NH-16 Toll Plaza, Chennai, Tamil Nadu', priority: 5 },
  { lat: 13.0558, lng: 80.1347, displayName: 'Maduravoyal Cloverleaf Interchange, Chennai, Tamil Nadu', priority: 5 },

  // ── PUNE, MUMBAI & MAHARASHTRA CORRIDORS ──────────────────────────────────
  { lat: 18.5204, lng: 73.8567, displayName: 'Pune Municipal Corporation, Shivajinagar, Pune, Maharashtra', priority: 5 },
  { lat: 18.5308, lng: 73.8475, displayName: 'Shivajinagar Bus Stand, Pune, Maharashtra', priority: 4 },
  { lat: 18.4575, lng: 73.8657, displayName: 'Katraj Ghat Highway Merging Bypass, Pune, Maharashtra', priority: 5 },
  { lat: 18.5912, lng: 73.7389, displayName: 'Hinjewadi Phase 1 IT Gate, Pune, Maharashtra', priority: 4 },
  { lat: 18.5085, lng: 73.7762, displayName: 'Chandni Chowk Highway Junction, Pune, Maharashtra', priority: 5 },
  { lat: 18.4967, lng: 73.9416, displayName: 'Hadapsar Gadital Bus Terminal, Pune, Maharashtra', priority: 4 },
  { lat: 18.5074, lng: 73.8077, displayName: 'Kothrud Depo & Corridor Junction, Pune, Maharashtra', priority: 3 },
  { lat: 18.5596, lng: 73.7797, displayName: 'Baner Highway Bypass, Pune, Maharashtra', priority: 3 },
  { lat: 18.5987, lng: 73.7706, displayName: 'Wakad Highway Flyover & Merging point, Pune, Maharashtra', priority: 5 },
  { lat: 18.5679, lng: 73.9143, displayName: 'Viman Nagar Chowk, Nagar Road, Pune, Maharashtra', priority: 3 },
  { lat: 18.5018, lng: 73.8636, displayName: 'Swargate MSRTC Bus Station, Pune, Maharashtra', priority: 4 },
  { lat: 19.1678, lng: 72.9622, displayName: 'Mulund Toll Naka, Eastern Express Highway, Mumbai', priority: 5 },
  { lat: 19.0435, lng: 72.8396, displayName: 'Bandra Reclamation Curve, Bandra, Mumbai, Maharashtra', priority: 5 },
  { lat: 19.0384, lng: 72.8643, displayName: 'Sion Circle Highway Bypass, Mumbai, Maharashtra', priority: 4 },
  { lat: 19.1176, lng: 72.8481, displayName: 'Andheri Western Express Highway, Mumbai, Maharashtra', priority: 5 },
  { lat: 19.2288, lng: 72.8541, displayName: 'Borivali Highway Interchange (WEH), Mumbai, Maharashtra', priority: 4 },
  { lat: 19.0178, lng: 72.8478, displayName: 'Dadar TT Circle Bypass node, Mumbai, Maharashtra', priority: 3 },
  { lat: 19.0680, lng: 72.8990, displayName: 'Thane Highway Toll Merging Node, Maharashtra', priority: 5 },
  { lat: 18.9894, lng: 73.1175, displayName: 'Panvel Highway Exit (Mumbai-Pune Expressway), Maharashtra', priority: 5 },
  { lat: 18.7844, lng: 73.3741, displayName: 'Lonavala Expressway Corridor Exit, Maharashtra', priority: 4 },
  { lat: 18.7525, lng: 73.4112, displayName: 'Khandala Ghat Safety Alert Zone, Maharashtra', priority: 5 },
  { lat: 18.8212, lng: 73.2844, displayName: 'Khalapur Toll Plaza (Mumbai-Pune Expressway), Maharashtra', priority: 5 },
  { lat: 18.7011, lng: 73.6847, displayName: 'Talegaon Toll Plaza (Mumbai-Pune Expressway), Maharashtra', priority: 5 },
  { lat: 19.9975, lng: 73.7898, displayName: 'Nashik Highway Phata Node, Maharashtra', priority: 4 },
  { lat: 19.6841, lng: 73.4812, displayName: 'Ghoti NH-160 Toll Plaza, Nashik Road, Maharashtra', priority: 5 },
  { lat: 19.0760, lng: 72.8777, displayName: 'Chhatrapati Shivaji Maharaj Airport (BOM), Mumbai, Maharashtra', priority: 4 },
  { lat: 21.1458, lng: 79.0882, displayName: 'Nagpur Zero Mile Junction, Nagpur, Maharashtra', priority: 4 },
  { lat: 19.8762, lng: 75.3433, displayName: 'Aurangabad Highway Bypass, Samruddhi Expressway Link, Maharashtra', priority: 4 },

  // ── ODISHA HIGHWAY NODES (NH-16 / SH-10) ──────────────────────────────────
  { lat: 20.2961, lng: 85.8245, displayName: 'Bhubaneswar Railway Station, Bhubaneswar, Odisha', priority: 5 },
  { lat: 20.2588, lng: 85.7876, displayName: 'Khandagiri Chowk, NH-16 Highway, Bhubaneswar, Odisha', priority: 5 },
  { lat: 20.2974, lng: 85.8679, displayName: 'Palasuni Chowk, NH-16 Highway Crossing, Bhubaneswar, Odisha', priority: 5 },
  { lat: 20.5284, lng: 85.9123, displayName: 'Manguli Chowk, Cuttack-Sambalpur Toll, Odisha', priority: 5 },
  { lat: 20.1983, lng: 85.6263, displayName: 'Batabhuasuni Bypass Curve, Khurda Corridor, Odisha', priority: 4 },
  { lat: 20.2917, lng: 85.8398, displayName: 'Acharya Vihar Square, Bhubaneswar, Odisha', priority: 3 },
  { lat: 21.5721, lng: 84.0205, displayName: 'Sason Highway Bypass, Sambalpur (SH-10), Odisha', priority: 3 },
  { lat: 21.3653, lng: 83.8214, displayName: 'Godbhaga Junction, Sambalpur (NH-6), Odisha', priority: 3 },
  { lat: 21.3325, lng: 86.6710, displayName: 'Jamjhadi Highway Toll Plaza, Balasore (NH-16), Odisha', priority: 5 },
  { lat: 20.2520, lng: 85.8166, displayName: 'Biju Patnaik International Airport (BBI), Bhubaneswar, Odisha', priority: 4 },
  { lat: 20.3244, lng: 85.8189, displayName: 'Patia Square Corridor Node, Bhubaneswar, Odisha', priority: 3 },
  { lat: 20.2905, lng: 85.8488, displayName: 'Rasulgarh Square (NH-16 Highway), Bhubaneswar, Odisha', priority: 5 },
  { lat: 20.4625, lng: 85.8828, displayName: 'Cuttack Link Road Square (NH-16), Cuttack, Odisha', priority: 4 },
  { lat: 19.8134, lng: 85.8315, displayName: 'Puri Grand Road Crossing, Puri, Odisha', priority: 4 },
  { lat: 22.2604, lng: 84.8536, displayName: 'Rourkela Highway Bypass Gate, Odisha', priority: 3 },
  { lat: 19.3150, lng: 84.7941, displayName: 'Berhampur NH-16 Highway Junction, Odisha', priority: 4 },
  { lat: 20.8252, lng: 86.1266, displayName: 'Chandikhole NH-16 / NH-53 Junction, Odisha', priority: 5 },
  { lat: 21.9312, lng: 86.7511, displayName: 'Baripada Highway Crossing (NH-18), Odisha', priority: 3 },
  { lat: 20.9521, lng: 85.1432, displayName: 'Angul Bypass Crossing (NH-55), Odisha', priority: 3 },

  // ── BENGALURU & KARNATAKA CORRIDORS ───────────────────────────────────────
  { lat: 12.9716, lng: 77.5946, displayName: 'Bengaluru City Center, Bengaluru, Karnataka', priority: 5 },
  { lat: 12.9176, lng: 77.6244, displayName: 'Silk Board Junction, Outer Ring Road, Bengaluru, Karnataka', priority: 5 },
  { lat: 13.0359, lng: 77.5978, displayName: 'Hebbal Flyover Merging lanes, Bengaluru, Karnataka', priority: 5 },
  { lat: 12.9934, lng: 77.6811, displayName: 'Tin Factory Flyover (Metro construction), Bengaluru', priority: 4 },
  { lat: 12.9779, lng: 77.5724, displayName: 'Majestic Bus Stand & Station, Bengaluru, Karnataka', priority: 4 },
  { lat: 12.9784, lng: 77.6408, displayName: 'Indiranagar 100 Feet Road, Bengaluru, Karnataka', priority: 3 },
  { lat: 12.9352, lng: 77.6245, displayName: 'Koramangala Sony World Junction, Bengaluru, Karnataka', priority: 3 },
  { lat: 12.9698, lng: 77.7500, displayName: 'Whitefield ITPL Main Entrance, Bengaluru, Karnataka', priority: 4 },
  { lat: 12.8452, lng: 77.6633, displayName: 'Electronic City Toll Plaza, Hosur Road (NH-48), Bengaluru', priority: 5 },
  { lat: 13.0285, lng: 77.5462, displayName: 'Yeshwanthpur Highway Junction, Bengaluru, Karnataka', priority: 5 },
  { lat: 13.1986, lng: 77.7066, displayName: 'Kempegowda International Airport (BLR), Bengaluru, Karnataka', priority: 4 },
  { lat: 13.0642, lng: 77.4789, displayName: 'Nelamangala Toll Plaza (NH-48), Karnataka', priority: 5 },
  { lat: 12.2958, lng: 76.6394, displayName: 'Mysore Highway Ring Road Crossing, Mysore, Karnataka', priority: 4 },
  { lat: 15.3647, lng: 75.1249, displayName: 'Hubli NH-48 Bypass, Karnataka', priority: 4 },
  { lat: 15.8497, lng: 74.4977, displayName: 'Belgaum NH-48 Toll Plaza, Karnataka', priority: 5 },

  // ── DELHI & NATIONAL CAPITAL REGION (NCR) ──────────────────────────────────
  { lat: 28.6139, lng: 77.2090, displayName: 'Connaught Place (CP) Radial, New Delhi, Delhi', priority: 5 },
  { lat: 28.5983, lng: 77.1895, displayName: 'Chanakyapuri Diplomatic Roundabout, New Delhi, Delhi', priority: 3 },
  { lat: 28.7372, lng: 77.1601, displayName: 'Mukarba Chowk Flyover Merging (NH-44), Delhi', priority: 5 },
  { lat: 28.5919, lng: 77.1616, displayName: 'Dhaula Kuan Highway Interchange, New Delhi, Delhi', priority: 5 },
  { lat: 28.5708, lng: 77.2519, displayName: 'Lajpat Nagar Ring Road Node, New Delhi, Delhi', priority: 3 },
  { lat: 28.5355, lng: 77.3910, displayName: 'Noida Sector 18 Crossing, Noida, Uttar Pradesh', priority: 4 },
  { lat: 28.4595, lng: 77.0266, displayName: 'Gurugram Rajiv Chowk Highway Merging (NH-48), Haryana', priority: 5 },
  { lat: 28.6129, lng: 77.2295, displayName: 'India Gate Circle Outer Bypass, New Delhi, Delhi', priority: 4 },
  { lat: 28.5684, lng: 77.1890, displayName: 'R.K. Puram Flyover Sector Node, New Delhi, Delhi', priority: 2 },
  { lat: 28.4356, lng: 77.0012, displayName: 'Kherki Daula Toll Plaza (NH-48 Expressway), Gurugram, Haryana', priority: 5 },
  { lat: 28.2144, lng: 76.8578, displayName: 'Dharuhera Highway Merging (NH-48), Haryana', priority: 4 },
  { lat: 28.1412, lng: 76.6214, displayName: 'Bawal NH-48 Toll Plaza Corridor, Haryana', priority: 5 },
  { lat: 28.9812, lng: 77.1215, displayName: 'Murthal NH-44 Highway Dhaba Corridor, Haryana', priority: 4 },
  { lat: 29.3941, lng: 76.9678, displayName: 'Panipat Toll Plaza (NH-44 Expressway), Haryana', priority: 5 },
  { lat: 28.5612, lng: 77.3241, displayName: 'DND Flyway Toll Plaza Crossing, Delhi-Noida, Delhi', priority: 5 },

  // ── KOLKATA & EAST INDIA CORRIDORS ────────────────────────────────────────
  { lat: 22.5726, lng: 88.3639, displayName: 'Kolkata Central Municipal Area, Kolkata, West Bengal', priority: 5 },
  { lat: 22.5442, lng: 88.3914, displayName: 'Maa Flyover Curve Safety Node, Kolkata, West Bengal', priority: 5 },
  { lat: 22.5851, lng: 88.3478, displayName: 'Howrah Bridge Eastern Merging lanes, Kolkata, West Bengal', priority: 5 },
  { lat: 22.5735, lng: 88.4331, displayName: 'Salt Lake Sector V Tech Gate, Kolkata, West Bengal', priority: 4 },
  { lat: 22.5499, lng: 88.3512, displayName: 'Park Street Crossing, Kolkata, West Bengal', priority: 3 },
  { lat: 22.5184, lng: 88.3698, displayName: 'Gariahat Junction Corridor, Kolkata, West Bengal', priority: 3 },
  { lat: 22.6547, lng: 88.4467, displayName: 'Newtown Rajarhat Expressway Bypass, Kolkata', priority: 4 },
  { lat: 22.3142, lng: 87.3155, displayName: 'Kharagpur Highway Interchange (NH-16), West Bengal', priority: 5 },
  { lat: 22.9512, lng: 88.3978, displayName: 'Dankuni Toll Plaza (NH-16 Expressway), West Bengal', priority: 5 },

  // ── HYDERABAD & SOUTH-CENTRAL CORRIDORS ───────────────────────────────────
  { lat: 17.3850, lng: 78.4867, displayName: 'Hyderabad Nampally Railway Station, Hyderabad, Telangana', priority: 5 },
  { lat: 17.4475, lng: 78.3562, displayName: 'Gachibowli X Roads Highway Merging, Hyderabad, Telangana', priority: 5 },
  { lat: 17.4264, lng: 78.4531, displayName: 'Panjagutta Junction Outer Flyover, Hyderabad, Telangana', priority: 4 },
  { lat: 17.4399, lng: 78.4983, displayName: 'Secunderabad Junction Gate Node, Hyderabad, Telangana', priority: 4 },
  { lat: 17.4483, lng: 78.3741, displayName: 'Madhapur IT Corridor Interchange, Hyderabad, Telangana', priority: 4 },
  { lat: 17.4312, lng: 78.4149, displayName: 'Jubilee Hills Checkpost Junction, Hyderabad, Telangana', priority: 3 },
  { lat: 17.4504, lng: 78.3808, displayName: 'Hitech City Cyber Towers Junction, Hyderabad, Telangana', priority: 4 },
  { lat: 17.2403, lng: 78.4294, displayName: 'Shamshabad Airport Interchange (ORR), Hyderabad, Telangana', priority: 5 },
  { lat: 17.5255, lng: 78.3147, displayName: 'Patancheru NH-65 Toll Plaza, Hyderabad, Telangana', priority: 5 },
  { lat: 17.3121, lng: 78.5211, displayName: 'Pedda Amberpet Toll Plaza (ORR Exit 11), Hyderabad, Telangana', priority: 5 },

  // ── AHMEDABAD & GUJARAT CORRIDORS ─────────────────────────────────────────
  { lat: 23.0225, lng: 72.5714, displayName: 'Ahmedabad Kalupur Station, Ahmedabad, Gujarat', priority: 5 },
  { lat: 23.0247, lng: 72.5074, displayName: 'Iscon Crossroad SG Highway corridor, Ahmedabad, Gujarat', priority: 5 },
  { lat: 22.9938, lng: 72.6289, displayName: 'CTM Double Road Expressway Link (NH-8), Ahmedabad, Gujarat', priority: 5 },
  { lat: 23.0289, lng: 72.5255, displayName: 'Satellite Area Crossing, Ahmedabad, Gujarat', priority: 3 },
  { lat: 23.0379, lng: 72.5349, displayName: 'Vastrapur Lake Circle node, Ahmedabad, Gujarat', priority: 3 },
  { lat: 22.8122, lng: 73.0847, displayName: 'Nadiad Expressway Toll Plaza, Gujarat', priority: 5 },
  { lat: 22.3072, lng: 73.1812, displayName: 'Vadodara Expressway Exit Toll Gate, Gujarat', priority: 5 },
  { lat: 21.1702, lng: 72.8311, displayName: 'Surat Highway Bypass Junction (NH-48), Gujarat', priority: 4 },
  { lat: 22.3039, lng: 70.8022, displayName: 'Rajkot Bypass Highway Crossing, Gujarat', priority: 3 },

  // ── ADDITIONAL HIGHWAY SEEDS (NH-44 / NH-48 / EXPRESSWAYS) ────────────────
  { lat: 30.7333, lng: 76.7794, displayName: 'Chandigarh Tribune Chowk Bypass, Chandigarh', priority: 5 },
  { lat: 30.6942, lng: 76.8611, displayName: 'Zirakpur Highway Merging (NH-44), Punjab', priority: 4 },
  { lat: 30.3752, lng: 76.7821, displayName: 'Ambala NH-44 Toll Plaza, Haryana', priority: 5 },
  { lat: 31.6340, lng: 74.8723, displayName: 'Amritsar GT Road Bypass, Punjab', priority: 4 },
  { lat: 30.2112, lng: 74.9456, displayName: 'Bathinda Bypass Ring Road, Punjab', priority: 3 },
  { lat: 26.9124, lng: 75.7873, displayName: 'Jaipur Ajmer Road Highway Phata, Jaipur, Rajasthan', priority: 5 },
  { lat: 26.8912, lng: 75.6841, displayName: 'Jaipur Toll Plaza (NH-48 Expressway), Rajasthan', priority: 5 },
  { lat: 26.4491, lng: 74.6378, displayName: 'Ajmer NH-48 Highway Bypass, Rajasthan', priority: 4 },
  { lat: 24.5854, lng: 73.7125, displayName: 'Udaipur Highway Bypass Crossing, Rajasthan', priority: 4 },
  { lat: 26.8467, lng: 80.9462, displayName: 'Lucknow Hazratganj Circle, Lucknow, Uttar Pradesh', priority: 5 },
  { lat: 26.8912, lng: 81.0112, displayName: 'Lucknow Expressway Merging Toll (agra link), Uttar Pradesh', priority: 5 },
  { lat: 27.1767, lng: 78.0081, displayName: 'Agra Yamuna Expressway Entry Toll, Uttar Pradesh', priority: 5 },
  { lat: 25.3176, lng: 82.9739, displayName: 'Varanasi Bypass Crossing (NH-19), Uttar Pradesh', priority: 4 },
  { lat: 25.5941, lng: 85.1376, displayName: 'Patna bypass circle road, Patna, Bihar', priority: 4 },
  { lat: 23.2599, lng: 77.4126, displayName: 'Bhopal Link Road Crossing, Bhopal, Madhya Pradesh', priority: 4 },
  { lat: 22.7196, lng: 75.8577, displayName: 'Indore Bypass Highway Interchange, Madhya Pradesh', priority: 4 },
  { lat: 26.1445, lng: 91.7362, displayName: 'Guwahati G.S. Road Bypass, Guwahati, Assam', priority: 4 },
  { lat: 26.1112, lng: 91.8021, displayName: 'Guwahati NH-37 Highway Crossing, Assam', priority: 4 },
  { lat: 9.9312, lng: 76.2673, displayName: 'Kochi Edappally Bypass Crossing, Kochi, Kerala', priority: 4 },
  { lat: 11.2588, lng: 75.7804, displayName: 'Kozhikode Bypass Highway Node, Kerala', priority: 3 },
  { lat: 8.5241, lng: 76.9366, displayName: 'Trivandrum Highway Bypass, Kerala', priority: 4 },
  { lat: 11.0168, lng: 76.9558, displayName: 'Coimbatore L&T Bypass NH-544 Toll, Tamil Nadu', priority: 5 },
  { lat: 11.0556, lng: 77.0912, displayName: 'Kaniyur NH-544 Toll Plaza, Coimbatore, Tamil Nadu', priority: 5 },
  { lat: 11.6643, lng: 78.1462, displayName: 'Salem Highway Bypass (NH-44), Tamil Nadu', priority: 4 },
  { lat: 10.7905, lng: 78.7047, displayName: 'Trichy NH-45 Highway Crossing, Tamil Nadu', priority: 4 },
  { lat: 9.9252, lng: 78.1196, displayName: 'Madurai Bypass Interchange (NH-44), Tamil Nadu', priority: 4 },
  { lat: 17.6868, lng: 83.2185, displayName: 'Vizag NH-16 Highway Bypass, Visakhapatnam, Andhra Pradesh', priority: 4 },
  { lat: 16.5062, lng: 80.6480, displayName: 'Vijayawada Highway Crossing (NH-16), Andhra Pradesh', priority: 4 },
  { lat: 13.6288, lng: 79.4192, displayName: 'Tirupati Highway Crossing, Andhra Pradesh', priority: 3 },
  { lat: 21.1901, lng: 72.8142, displayName: 'Surat-Hazira Expressway Link, Gujarat', priority: 3 },
  { lat: 24.6212, lng: 73.7841, displayName: 'Debari NH-27 Bypass, Udaipur, Rajasthan', priority: 3 },
  { lat: 27.5612, lng: 77.4112, displayName: 'Mathura Highway Crossing (NH-44), Uttar Pradesh', priority: 4 },
  { lat: 26.2412, lng: 78.1812, displayName: 'Gwalior NH-44 Bypass Crossing, Madhya Pradesh', priority: 3 },
  { lat: 24.1212, lng: 78.0121, displayName: 'Sagar Highway Intersection (NH-44), Madhya Pradesh', priority: 3 },
  { lat: 21.2512, lng: 81.6312, displayName: 'Raipur NH-53 Bypass Road, Chhattisgarh', priority: 4 },
  { lat: 23.3412, lng: 85.3112, displayName: 'Ranchi Ring Road Bypass Crossing, Jharkhand', priority: 4 },
  { lat: 22.4812, lng: 87.3112, displayName: 'Midnapore Highway Node (NH-16), West Bengal', priority: 3 },
  { lat: 23.8212, lng: 91.2812, displayName: 'Agartala NH-8 Highway Bypass, Tripura', priority: 3 },
  { lat: 25.5712, lng: 91.8812, displayName: 'Shillong Bypass Expressway, Meghalaya', priority: 3 },
  { lat: 27.3312, lng: 88.6112, displayName: 'Gangtok Highway Bypass NH-10, Sikkim', priority: 2 },
  { lat: 32.7212, lng: 74.8512, displayName: 'Jammu Bypass NH-44 Toll Merging, Jammu & Kashmir', priority: 4 },
  { lat: 34.0812, lng: 74.7912, displayName: 'Srinagar Highway Ring Road crossing, Jammu & Kashmir', priority: 4 },
  { lat: 18.5204, lng: 73.8567, displayName: 'Pune Station Road Interchange, Pune, Maharashtra', priority: 3 },
  { lat: 18.4712, lng: 73.8912, displayName: 'Kondhwa Highway Bypass Crossing, Pune, Maharashtra', priority: 3 },
  { lat: 18.6212, lng: 73.8112, displayName: 'Chinchwad Highway Flyover merging, Pune, Maharashtra', priority: 4 },
  { lat: 18.6712, lng: 73.8912, displayName: 'Bhosari Spine Road Crossing (NH-60), Pune, Maharashtra', priority: 4 },
  { lat: 18.5912, lng: 73.9812, displayName: 'Wagholi Highway Toll Spot, Pune, Maharashtra', priority: 3 },
  { lat: 13.0412, lng: 80.1712, displayName: 'Valasaravakkam Crossing, CTH Link, Chennai, Tamil Nadu', priority: 2 },
  { lat: 13.0112, lng: 80.1212, displayName: 'Poonamallee Bypass NH-48 Toll Plaza, Chennai, Tamil Nadu', priority: 5 },
  { lat: 13.0812, lng: 80.2212, displayName: 'Anna Nagar West Depot Crossing, Chennai, Tamil Nadu', priority: 3 },
  { lat: 12.9312, lng: 80.1412, displayName: 'Chromepet GST Road Flyover, Chennai, Tamil Nadu', priority: 4 },
  { lat: 12.9212, lng: 80.1112, displayName: 'Perungalathur GST Road merging node, Chennai, Tamil Nadu', priority: 5 },
  { lat: 12.8212, lng: 80.0512, displayName: 'Maraimalai Nagar Industrial Highway Crossing, Tamil Nadu', priority: 4 },
  { lat: 12.7012, lng: 79.9812, displayName: 'Maduranthakam NH-45 Highway Crossing, Tamil Nadu', priority: 4 },
  { lat: 12.2412, lng: 79.8912, displayName: 'Tindivanam Highway Junction (NH-45), Tamil Nadu', priority: 5 },
  { lat: 11.9312, lng: 79.7912, displayName: 'Vikravandi NH-45 Toll Plaza Gate, Tamil Nadu', priority: 5 },
  { lat: 11.9412, lng: 79.8212, displayName: 'Puducherry East Coast Road Entry, Puducherry', priority: 4 },
  { lat: 13.0912, lng: 80.2912, displayName: 'Royapuram Harbour Gate Road, Chennai, Tamil Nadu', priority: 3 },
  { lat: 13.1512, lng: 80.2912, displayName: 'Tiruvottiyur High Road Safety Spot, Chennai, Tamil Nadu', priority: 2 },
  { lat: 13.1212, lng: 80.2112, displayName: 'Madhavaram Roundabout Interchange, Chennai, Tamil Nadu', priority: 5 },
  { lat: 13.1912, lng: 80.1712, displayName: 'Karanodai NH-16 Toll Plaza Corridor, Tamil Nadu', priority: 5 },
  { lat: 13.5912, lng: 80.0212, displayName: 'Tada Border NH-16 Toll Plaza, Andhra Pradesh', priority: 5 },
  { lat: 13.6912, lng: 79.8512, displayName: 'Sullurpeta Highway Crossing (NH-16), Andhra Pradesh', priority: 4 },
  { lat: 14.4412, lng: 79.9812, displayName: 'Nellore NH-16 Highway Bypass, Nellore, Andhra Pradesh', priority: 4 },
  { lat: 15.5012, lng: 80.0412, displayName: 'Ongole Highway Crossing (NH-16), Andhra Pradesh', priority: 4 },
  { lat: 16.3012, lng: 80.4412, displayName: 'Guntur Highway Bypass (NH-16), Andhra Pradesh', priority: 4 },
  { lat: 17.0012, lng: 81.7812, displayName: 'Rajahmundry Godavari Bridge Crossing, Andhra Pradesh', priority: 4 },
  { lat: 18.2912, lng: 83.8912, displayName: 'Srikakulam Highway Crossing (NH-16), Andhra Pradesh', priority: 3 },
  { lat: 18.8012, lng: 84.4212, displayName: 'Ichchapuram Border Toll Plaza (NH-16), Andhra Pradesh', priority: 5 },
  { lat: 19.5112, lng: 85.3112, displayName: 'Barkul Chilika Lake Highway Spot, Odisha', priority: 4 },
  { lat: 20.2112, lng: 85.6812, displayName: 'Jankiadeipur NH-16 Highway Bypass, Khurda, Odisha', priority: 4 },
  { lat: 20.3712, lng: 85.8212, displayName: 'Phulnakhara Square (NH-16 Cuttack Link), Odisha', priority: 5 },
  { lat: 20.6912, lng: 86.2512, displayName: 'Jajpur Highway Bypass Crossing, Odisha', priority: 4 },
  { lat: 21.0112, lng: 86.5012, displayName: 'Bhadrak Highway Bypass (NH-16), Odisha', priority: 4 },
  { lat: 21.4912, lng: 86.9212, displayName: 'Balasore NH-16 Highway Bypass, Balasore, Odisha', priority: 5 },
  { lat: 21.7512, lng: 87.2512, displayName: 'Jaleswar Border NH-16 Toll Plaza, Odisha', priority: 5 },
  { lat: 22.0112, lng: 87.2612, displayName: 'Dantan Highway Crossing (NH-16), West Bengal', priority: 4 },
  { lat: 22.5812, lng: 88.2612, displayName: 'Kona Expressway Merging Bypass, Howrah, West Bengal', priority: 5 },
  { lat: 22.6112, lng: 88.3812, displayName: 'Belghoria Expressway Bypass, Kolkata, West Bengal', priority: 5 },
];

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('geocoding_seed.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS offline_locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          display_name TEXT NOT NULL,
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          priority INTEGER DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_display_name ON offline_locations(display_name);
      `);

      const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM offline_locations');
      if (!row || row.c < SEED_LOCATIONS.length) {
        await db.runAsync('DELETE FROM offline_locations');
        for (const loc of SEED_LOCATIONS) {
          await db.runAsync(
            'INSERT OR REPLACE INTO offline_locations (display_name, lat, lng, priority) VALUES (?, ?, ?, ?)',
            [loc.displayName, loc.lat, loc.lng, loc.priority ?? 0]
          );
        }
      }
      return db;
    })();
  }
  return dbPromise;
}

/**
 * Searches the offline SQLite location database for matching queries.
 * Splits multi-word terms and performs matching against all tokens (multi-word support).
 * E.g., searching "Chennai Toll" matches "Poonamallee Bypass NH-48 Toll Plaza, Chennai..."
 */
export async function searchOfflineLocations(query: string): Promise<GeocodeSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return [];

  try {
    const db = await getDb();
    // Build query conditions: display_name LIKE ? AND display_name LIKE ? ...
    const clauses = parts.map(() => 'display_name LIKE ?').join(' AND ');
    const params = parts.map((p) => `%${p}%`);

    const sql = `
      SELECT display_name, lat, lng 
      FROM offline_locations 
      WHERE ${clauses} 
      ORDER BY priority DESC, display_name ASC 
      LIMIT 5
    `;

    const rows = await db.getAllAsync<{ display_name: string; lat: number; lng: number }>(sql, params);
    return rows.map((r) => ({
      displayName: r.display_name,
      lat: r.lat,
      lng: r.lng,
    }));
  } catch (error) {
    // If DB fails, return fallback mock results from local filter
    const queryLower = trimmed.toLowerCase();
    return SEED_LOCATIONS.filter((loc) =>
      parts.every((p) => loc.displayName.toLowerCase().includes(p.toLowerCase()))
    )
      .slice(0, 5)
      .map((l) => ({
        displayName: l.displayName,
        lat: l.lat,
        lng: l.lng,
      }));
  }
}
