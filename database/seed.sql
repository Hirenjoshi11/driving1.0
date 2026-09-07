-- ============================================================
-- DRIVING LICENSE FORM — SEED DATA
-- Real RTO codes and verified data
-- ============================================================

-- ============================================================
-- STATES
-- ============================================================
INSERT INTO states (name, name_hi, name_gu, slug, code, description, description_hi, description_gu, sort_order) VALUES
('Gujarat', 'गुजरात', 'ગુજરાત', 'gujarat', 'GJ', 'Apply for driving licence services in Gujarat. Access all RTOs across 33 districts.', 'गुजरात में ड्राइविंग लाइसेंस सेवाओं के लिए आवेदन करें।', 'ગુજરાતમાં ડ્રાઇવિંગ લાઇસન્સ સેવાઓ માટે અરજી કરો.', 1),
('Rajasthan', 'राजस्थान', 'રાજસ્થાન', 'rajasthan', 'RJ', 'Apply for driving licence services in Rajasthan. Access all RTOs across 33 districts.', 'राजस्थान में ड्राइविंग लाइसेंस सेवाओं के लिए आवेदन करें।', 'રાજસ્થાનમાં ડ્રાઇવિંગ લાઇસન્સ સેવાઓ માટે અરજી કરો.', 2),
('Uttar Pradesh', 'उत्तर प्रदेश', 'ઉત્તર પ્રદેશ', 'uttar-pradesh', 'UP', 'Apply for driving licence services in Uttar Pradesh. Access all RTOs across 75 districts.', 'उत्तर प्रदेश में ड्राइविंग लाइसेंस सेवाओं के लिए आवेदन करें।', 'ઉત્તર પ્રદેશમાં ડ્રાઇવિંગ લાઇસન્સ સેવાઓ માટે અરજી કરો.', 3);

-- ============================================================
-- DISTRICTS — GUJARAT (key districts)
-- ============================================================
INSERT INTO districts (state_id, name, name_hi, name_gu, code, sort_order) VALUES
(1, 'Ahmedabad', 'अहमदाबाद', 'અમદાવાદ', 'AHM', 1),
(1, 'Mehsana', 'मेहसाणा', 'મહેસાણા', 'MEH', 2),
(1, 'Rajkot', 'राजकोट', 'રાજકોટ', 'RAJ', 3),
(1, 'Bhavnagar', 'भावनगर', 'ભાવનગર', 'BHA', 4),
(1, 'Surat', 'सूरत', 'સુરત', 'SUR', 5),
(1, 'Vadodara', 'वडोदरा', 'વડોદરા', 'VAD', 6),
(1, 'Kheda', 'खेड़ा', 'ખેડા', 'KHE', 7),
(1, 'Banaskantha', 'बनासकांठा', 'બનાસકાંઠા', 'BAN', 8),
(1, 'Sabarkantha', 'साबरकांठा', 'સાબરકાંઠા', 'SAB', 9),
(1, 'Jamnagar', 'जामनगर', 'જામનગર', 'JAM', 10),
(1, 'Junagadh', 'जूनागढ़', 'જૂનાગઢ', 'JUN', 11),
(1, 'Kutch', 'कच्छ', 'કચ્છ', 'KUT', 12),
(1, 'Surendranagar', 'सुरेंद्रनगर', 'સુરેન્દ્રનગર', 'SUR2', 13),
(1, 'Amreli', 'अमरेली', 'અમરેલી', 'AMR', 14),
(1, 'Bharuch', 'भरूच', 'ભરૂચ', 'BRU', 15),
(1, 'Panchmahal', 'पंचमहल', 'પંચમહાલ', 'PAN', 16),
(1, 'Valsad', 'वलसाड', 'વલસાડ', 'VAL', 17),
(1, 'Gandhinagar', 'गांधीनगर', 'ગાંધીનગર', 'GAN', 18),
(1, 'Anand', 'आणंद', 'આણંદ', 'ANA', 19),
(1, 'Narmada', 'नर्मदा', 'નર્મદા', 'NAR', 20),
(1, 'Navsari', 'नवसारी', 'નવસારી', 'NAV', 21),
(1, 'Patan', 'पाटण', 'પાટણ', 'PAT', 22),
(1, 'Dahod', 'दाहोद', 'દાહોદ', 'DAH', 23),
(1, 'Porbandar', 'पोरबंदर', 'પોરબંદર', 'POR', 24),
(1, 'Tapi', 'तापी', 'તાપી', 'TAP', 25);

-- ============================================================
-- DISTRICTS — RAJASTHAN (key districts)
-- ============================================================
INSERT INTO districts (state_id, name, name_hi, name_gu, code, sort_order) VALUES
(2, 'Ajmer', 'अजमेर', 'અજમેર', 'AJM', 1),
(2, 'Alwar', 'अलवर', 'અલવર', 'ALW', 2),
(2, 'Banswara', 'बांसवाड़ा', 'બાંસવાડા', 'BNS', 3),
(2, 'Barmer', 'बाड़मेर', 'બાડમેર', 'BAR', 4),
(2, 'Bharatpur', 'भरतपुर', 'ભરતપુર', 'BHR', 5),
(2, 'Bhilwara', 'भीलवाड़ा', 'ભીલવાડા', 'BHL', 6),
(2, 'Bikaner', 'बीकानेर', 'બીકાનેર', 'BIK', 7),
(2, 'Bundi', 'बूंदी', 'બૂંદી', 'BUN', 8),
(2, 'Chittorgarh', 'चित्तौड़गढ़', 'ચિત્તોડગઢ', 'CHT', 9),
(2, 'Churu', 'चुरू', 'ચુરુ', 'CHU', 10),
(2, 'Dholpur', 'धौलपुर', 'ધોલપુર', 'DHP', 11),
(2, 'Dungarpur', 'डूंगरपुर', 'ડૂંગરપુર', 'DNG', 12),
(2, 'Sri Ganganagar', 'श्री गंगानगर', 'શ્રી ગંગાનગર', 'GNG', 13),
(2, 'Jaipur', 'जयपुर', 'જયપુર', 'JAI', 14),
(2, 'Jaisalmer', 'जैसलमेर', 'જેસલમેર', 'JSL', 15),
(2, 'Jalore', 'जालौर', 'જાલોર', 'JAL', 16),
(2, 'Jhalawar', 'झालावाड़', 'ઝાલાવાડ', 'JHL', 17),
(2, 'Jhunjhunu', 'झुंझुनूं', 'ઝુંઝુનું', 'JHJ', 18),
(2, 'Jodhpur', 'जोधपुर', 'જોધપુર', 'JOD', 19),
(2, 'Kota', 'कोटा', 'કોટા', 'KOT', 20),
(2, 'Nagaur', 'नागौर', 'નાગૌર', 'NAG', 21),
(2, 'Pali', 'पाली', 'પાલી', 'PAL', 22),
(2, 'Sikar', 'सीकर', 'સીકર', 'SIK', 23),
(2, 'Sirohi', 'सिरोही', 'સિરોહી', 'SIR', 24),
(2, 'Tonk', 'टोंक', 'ટોંક', 'TON', 25),
(2, 'Udaipur', 'उदयपुर', 'ઉદયપુર', 'UDP', 26);

-- ============================================================
-- DISTRICTS — UTTAR PRADESH (key districts)
-- ============================================================
INSERT INTO districts (state_id, name, name_hi, name_gu, code, sort_order) VALUES
(3, 'Lucknow', 'लखनऊ', 'લખનૌ', 'LKO', 1),
(3, 'Kanpur Nagar', 'कानपुर नगर', 'કાનપુર નગર', 'KNP', 2),
(3, 'Agra', 'आगरा', 'આગ્રા', 'AGR', 3),
(3, 'Varanasi', 'वाराणसी', 'વારાણસી', 'VNS', 4),
(3, 'Prayagraj', 'प्रयागराज', 'પ્રયાગરાજ', 'PRY', 5),
(3, 'Meerut', 'मेरठ', 'મેરઠ', 'MRT', 6),
(3, 'Ghaziabad', 'गाज़ियाबाद', 'ગાઝિયાબાદ', 'GZB', 7),
(3, 'Noida (Gautam Buddha Nagar)', 'नोएडा (गौतम बुद्ध नगर)', 'નોઈડા (ગૌતમ બુદ્ધ નગર)', 'NOI', 8),
(3, 'Gorakhpur', 'गोरखपुर', 'ગોરખપુર', 'GKP', 9),
(3, 'Bareilly', 'बरेली', 'બરેલી', 'BLY', 10),
(3, 'Aligarh', 'अलीगढ़', 'અલીગઢ', 'ALG', 11),
(3, 'Moradabad', 'मुरादाबाद', 'મુરાદાબાદ', 'MBD', 12),
(3, 'Saharanpur', 'सहारनपुर', 'સહારનપુર', 'SHP', 13),
(3, 'Jhansi', 'झांसी', 'ઝાંસી', 'JHS', 14),
(3, 'Mathura', 'मथुरा', 'મથુરા', 'MTH', 15),
(3, 'Firozabad', 'फ़िरोज़ाबाद', 'ફીરોઝાબાદ', 'FZB', 16),
(3, 'Muzaffarnagar', 'मुज़फ़्फ़रनगर', 'મુઝફ્ફરનગર', 'MZN', 17),
(3, 'Bijnor', 'बिजनौर', 'બિજનૌર', 'BJN', 18),
(3, 'Sitapur', 'सीतापुर', 'સીતાપુર', 'STP', 19),
(3, 'Unnao', 'उन्नाव', 'ઉન્નાવ', 'UNN', 20),
(3, 'Banda', 'बांदा', 'બાંદા', 'BND', 21),
(3, 'Sultanpur', 'सुल्तानपुर', 'સુલતાનપુર', 'SLT', 22),
(3, 'Azamgarh', 'आज़मगढ़', 'આઝમગઢ', 'AZM', 23),
(3, 'Etawah', 'इटावा', 'ઇટાવા', 'ETW', 24),
(3, 'Bulandshahr', 'बुलंदशहर', 'બુલંદશહર', 'BLS', 25);

-- ============================================================
-- RTO OFFICES — GUJARAT (real RTO codes)
-- ============================================================
INSERT INTO rto_offices (district_id, state_id, name, name_hi, name_gu, rto_code, office_type, address, city) VALUES
(1, 1, 'RTO Ahmedabad', 'आरटीओ अहमदाबाद', 'આરટીઓ અમદાવાદ', 'GJ-01', 'RTO', 'Subhash Bridge, Ahmedabad', 'Ahmedabad'),
(1, 1, 'RTO Ahmedabad (West)', 'आरटीओ अहमदाबाद (पश्चिम)', 'આરટીઓ અમદાવાદ (પશ્ચિમ)', 'GJ-27', 'RTO', 'Satellite Area, Ahmedabad', 'Ahmedabad'),
(1, 1, 'ARTO Ahmedabad (Rural)', 'एआरटीओ अहमदाबाद (ग्रामीण)', 'એઆરટીઓ અમદાવાદ (ગ્રામીણ)', 'GJ-38', 'ARTO', 'Naroda, Ahmedabad', 'Ahmedabad'),
(2, 1, 'RTO Mehsana', 'आरटीओ मेहसाणा', 'આરટીઓ મહેસાણા', 'GJ-02', 'RTO', 'Highway Road, Mehsana', 'Mehsana'),
(3, 1, 'RTO Rajkot', 'आरटीओ राजकोट', 'આરટીઓ રાજકોટ', 'GJ-03', 'RTO', 'Kalavad Road, Rajkot', 'Rajkot'),
(4, 1, 'RTO Bhavnagar', 'आरटीओ भावनगर', 'આરટીઓ ભાવનગર', 'GJ-04', 'RTO', 'Waghawadi Road, Bhavnagar', 'Bhavnagar'),
(5, 1, 'RTO Surat', 'आरटीओ सूरत', 'આરટીઓ સુરત', 'GJ-05', 'RTO', 'Ring Road, Surat', 'Surat'),
(5, 1, 'RTO Surat (City)', 'आरटीओ सूरत (शहर)', 'આરટીઓ સુરત (શહેર)', 'GJ-28', 'RTO', 'Adajan, Surat', 'Surat'),
(6, 1, 'RTO Vadodara', 'आरटीओ वडोदरा', 'આરટીઓ વડોદરા', 'GJ-06', 'RTO', 'Productivity Road, Vadodara', 'Vadodara'),
(6, 1, 'RTO Vadodara (City)', 'आरटीओ वडोदरा (शहर)', 'આરટીઓ વડોદરા (શહેર)', 'GJ-29', 'RTO', 'Manjalpur, Vadodara', 'Vadodara'),
(7, 1, 'RTO Kheda (Nadiad)', 'आरटीओ खेड़ा (नडियाद)', 'આરટીઓ ખેડા (નડિયાદ)', 'GJ-07', 'RTO', 'Station Road, Nadiad', 'Nadiad'),
(8, 1, 'RTO Banaskantha (Palanpur)', 'आरटीओ बनासकांठा (पालनपुर)', 'આરટીઓ બનાસકાંઠા (પાલનપુર)', 'GJ-08', 'RTO', 'Highway Road, Palanpur', 'Palanpur'),
(9, 1, 'RTO Sabarkantha (Himmatnagar)', 'आरटीओ साबरकांठा (हिम्मतनगर)', 'આરટીઓ સાબરકાંઠા (હિંમતનગર)', 'GJ-09', 'RTO', 'Bus Stand Road, Himmatnagar', 'Himmatnagar'),
(10, 1, 'RTO Jamnagar', 'आरटीओ जामनगर', 'આરટીઓ જામનગર', 'GJ-10', 'RTO', 'Aerodrome Road, Jamnagar', 'Jamnagar'),
(11, 1, 'RTO Junagadh', 'आरटीओ जूनागढ़', 'આરટીઓ જૂનાગઢ', 'GJ-11', 'RTO', 'Talav Gate, Junagadh', 'Junagadh'),
(12, 1, 'RTO Kutch (Bhuj)', 'आरटीओ कच्छ (भुज)', 'આરટીઓ કચ્છ (ભુજ)', 'GJ-12', 'RTO', 'Hospital Road, Bhuj', 'Bhuj'),
(18, 1, 'RTO Gandhinagar', 'आरटीओ गांधीनगर', 'આરટીઓ ગાંધીનગર', 'GJ-18', 'RTO', 'Sector 10, Gandhinagar', 'Gandhinagar'),
(19, 1, 'RTO Anand', 'आरटीओ आणंद', 'આરટીઓ આણંદ', 'GJ-19', 'RTO', 'Station Road, Anand', 'Anand'),
(21, 1, 'RTO Navsari', 'आरटीओ नवसारी', 'આરટીઓ નવસારી', 'GJ-21', 'RTO', 'Tower Road, Navsari', 'Navsari'),
(17, 1, 'RTO Valsad', 'आरटीओ वलसाड', 'આરટીઓ વલસાડ', 'GJ-15', 'RTO', 'Station Road, Valsad', 'Valsad');

-- ============================================================
-- RTO OFFICES — RAJASTHAN (real RTO codes)
-- ============================================================
INSERT INTO rto_offices (district_id, state_id, name, name_hi, name_gu, rto_code, office_type, address, city) VALUES
(26, 2, 'RTO Ajmer', 'आरटीओ अजमेर', 'આરટીઓ અજમેર', 'RJ-01', 'RTO', 'Jaipur Road, Ajmer', 'Ajmer'),
(27, 2, 'RTO Alwar', 'आरटीओ अलवर', 'આરટીઓ અલવર', 'RJ-02', 'RTO', 'Bhagat Singh Circle, Alwar', 'Alwar'),
(28, 2, 'RTO Banswara', 'आरटीओ बांसवाड़ा', 'આરટીઓ બાંસવાડા', 'RJ-03', 'RTO', 'Dungarpur Road, Banswara', 'Banswara'),
(29, 2, 'RTO Barmer', 'आरटीओ बाड़मेर', 'આરટીઓ બાડમેર', 'RJ-04', 'RTO', 'Station Road, Barmer', 'Barmer'),
(30, 2, 'RTO Bharatpur', 'आरटीओ भरतपुर', 'આરટીઓ ભરતપુર', 'RJ-05', 'RTO', 'Agra Road, Bharatpur', 'Bharatpur'),
(31, 2, 'RTO Bhilwara', 'आरटीओ भीलवाड़ा', 'આરટીઓ ભીલવાડા', 'RJ-06', 'RTO', 'Pur Road, Bhilwara', 'Bhilwara'),
(32, 2, 'RTO Bikaner', 'आरटीओ बीकानेर', 'આરટીઓ બીકાનેર', 'RJ-07', 'RTO', 'KEM Road, Bikaner', 'Bikaner'),
(33, 2, 'RTO Bundi', 'आरटीओ बूंदी', 'આરટીઓ બૂંદી', 'RJ-08', 'RTO', 'Kota Road, Bundi', 'Bundi'),
(34, 2, 'RTO Chittorgarh', 'आरटीओ चित्तौड़गढ़', 'આરટીઓ ચિત્તોડગઢ', 'RJ-09', 'RTO', 'Udaipur Road, Chittorgarh', 'Chittorgarh'),
(39, 2, 'RTO Jaipur (South)', 'आरटीओ जयपुर (दक्षिण)', 'આરટીઓ જયપુર (દક્ષિણ)', 'RJ-14', 'RTO', 'Tonk Road, Jaipur', 'Jaipur'),
(39, 2, 'RTO Jaipur (North)', 'आरटीओ जयपुर (उत्तर)', 'આરટીઓ જયપુર (ઉત્તર)', 'RJ-45', 'RTO', 'Sikar Road, Jaipur', 'Jaipur'),
(44, 2, 'RTO Jodhpur', 'आरटीओ जोधपुर', 'આરટીઓ જોધપુર', 'RJ-19', 'RTO', 'Paota, Jodhpur', 'Jodhpur'),
(45, 2, 'RTO Kota', 'आरटीओ कोटा', 'આરટીઓ કોટા', 'RJ-20', 'RTO', 'Industrial Area, Kota', 'Kota'),
(51, 2, 'RTO Udaipur', 'आरटीओ उदयपुर', 'આરટીઓ ઉદયપુર', 'RJ-27', 'RTO', 'Ambamata, Udaipur', 'Udaipur'),
(48, 2, 'RTO Sikar', 'आरटीओ सीकर', 'આરટીઓ સીકર', 'RJ-23', 'RTO', 'Jaipur Road, Sikar', 'Sikar');

-- ============================================================
-- RTO OFFICES — UTTAR PRADESH (real RTO codes)
-- ============================================================
INSERT INTO rto_offices (district_id, state_id, name, name_hi, name_gu, rto_code, office_type, address, city) VALUES
(52, 3, 'RTO Lucknow', 'आरटीओ लखनऊ', 'આરટીઓ લખનૌ', 'UP-32', 'RTO', 'Kaiserbagh, Lucknow', 'Lucknow'),
(53, 3, 'RTO Kanpur Nagar', 'आरटीओ कानपुर नगर', 'આરટીઓ કાનપુર નગર', 'UP-78', 'RTO', 'GT Road, Kanpur', 'Kanpur'),
(54, 3, 'RTO Agra', 'आरटीओ आगरा', 'આરટીઓ આગ્રા', 'UP-80', 'RTO', 'Belanganj, Agra', 'Agra'),
(55, 3, 'RTO Varanasi', 'आरटीओ वाराणसी', 'આરટીઓ વારાણસી', 'UP-65', 'RTO', 'Sigra, Varanasi', 'Varanasi'),
(56, 3, 'RTO Prayagraj', 'आरटीओ प्रयागराज', 'આરટીઓ પ્રયાગરાજ', 'UP-70', 'RTO', 'Civil Lines, Prayagraj', 'Prayagraj'),
(57, 3, 'RTO Meerut', 'आरटीओ मेरठ', 'આરટીઓ મેરઠ', 'UP-15', 'RTO', 'Western Kutchery, Meerut', 'Meerut'),
(58, 3, 'RTO Ghaziabad', 'आरटीओ गाज़ियाबाद', 'આરટીઓ ગાઝિયાબાદ', 'UP-14', 'RTO', 'Raj Nagar, Ghaziabad', 'Ghaziabad'),
(59, 3, 'RTO Noida', 'आरटीओ नोएडा', 'આરટીઓ નોઈડા', 'UP-16', 'RTO', 'Sector 32, Noida', 'Noida'),
(60, 3, 'RTO Gorakhpur', 'आरटीओ गोरखपुर', 'આરટીઓ ગોરખપુર', 'UP-53', 'RTO', 'Civil Lines, Gorakhpur', 'Gorakhpur'),
(61, 3, 'RTO Bareilly', 'आरटीओ बरेली', 'આરટીઓ બરેલી', 'UP-25', 'RTO', 'Civil Lines, Bareilly', 'Bareilly'),
(62, 3, 'RTO Aligarh', 'आरटीओ अलीगढ़', 'આરટીઓ અલીગઢ', 'UP-81', 'RTO', 'GT Road, Aligarh', 'Aligarh'),
(64, 3, 'RTO Saharanpur', 'आरटीओ सहारनपुर', 'આરટીઓ સહારનપુર', 'UP-11', 'RTO', 'Court Road, Saharanpur', 'Saharanpur'),
(65, 3, 'RTO Jhansi', 'आरटीओ झांसी', 'આરટીઓ ઝાંસી', 'UP-93', 'RTO', 'Civil Lines, Jhansi', 'Jhansi'),
(66, 3, 'RTO Mathura', 'आरटीओ मथुरा', 'આરટીઓ મથુરા', 'UP-85', 'RTO', 'Delhi Road, Mathura', 'Mathura');

-- ============================================================
-- DRIVING TEST CENTRES (separate from RTO offices)
-- ============================================================
INSERT INTO driving_test_centres (rto_id, district_id, state_id, name, name_hi, name_gu, address, city, rto_code, test_type, two_wheeler_available, four_wheeler_available, transport_vehicle_available, status) VALUES
-- Gujarat
(1, 1, 1, 'Ahmedabad Automated Driving Test Track', 'अहमदाबाद स्वचालित ड्राइविंग टेस्ट ट्रैक', 'અમદાવાદ ઓટોમેટેડ ડ્રાઇવિંગ ટેસ્ટ ટ્રેક', 'Subhash Bridge Area, Ahmedabad', 'Ahmedabad', 'GJ-01', 'both', 1, 1, 1, 'active'),
(5, 3, 1, 'Rajkot Driving Test Centre', 'राजकोट ड्राइविंग टेस्ट केंद्र', 'રાજકોટ ડ્રાઇવિંગ ટેસ્ટ કેન્દ્ર', 'Kalavad Road, Rajkot', 'Rajkot', 'GJ-03', 'both', 1, 1, 0, 'active'),
(7, 5, 1, 'Surat Driving Test Track', 'सूरत ड्राइविंग टेस्ट ट्रैक', 'સુરત ડ્રાઇવિંગ ટેસ્ટ ટ્રેક', 'Ring Road Area, Surat', 'Surat', 'GJ-05', 'both', 1, 1, 1, 'active'),
(9, 6, 1, 'Vadodara Driving Test Centre', 'वडोदरा ड्राइविंग टेस्ट केंद्र', 'વડોદરા ડ્રાઇવિંગ ટેસ્ટ કેન્દ્ર', 'Productivity Road Area, Vadodara', 'Vadodara', 'GJ-06', 'both', 1, 1, 0, 'active'),
(17, 18, 1, 'Gandhinagar Automated Test Track', 'गांधीनगर स्वचालित टेस्ट ट्रैक', 'ગાંધીનગર ઓટોમેટેડ ટેસ્ટ ટ્રેક', 'Sector 10, Gandhinagar', 'Gandhinagar', 'GJ-18', 'both', 1, 1, 1, 'active'),
-- Rajasthan
(21, 39, 2, 'Jaipur Automated Driving Test Track', 'जयपुर स्वचालित ड्राइविंग टेस्ट ट्रैक', 'જયપુર ઓટોમેટેડ ડ્રાઇવિંગ ટેસ્ટ ટ્રેક', 'Tonk Road Area, Jaipur', 'Jaipur', 'RJ-14', 'both', 1, 1, 1, 'active'),
(23, 44, 2, 'Jodhpur Driving Test Centre', 'जोधपुर ड्राइविंग टेस्ट केंद्र', 'જોધપુર ડ્રાઇવિંગ ટેસ્ટ કેન્દ્ર', 'Paota Area, Jodhpur', 'Jodhpur', 'RJ-19', 'both', 1, 1, 0, 'active'),
(25, 51, 2, 'Udaipur Driving Test Track', 'उदयपुर ड्राइविंग टेस्ट ट्रैक', 'ઉદયપુર ડ્રાઇવિંગ ટેસ્ટ ટ્રેક', 'Ambamata Area, Udaipur', 'Udaipur', 'RJ-27', 'both', 1, 1, 0, 'active'),
(24, 45, 2, 'Kota Driving Test Centre', 'कोटा ड्राइविंग टेस्ट केंद्र', 'કોટા ડ્રાઇવિંગ ટેસ્ટ કેન્દ્ર', 'Industrial Area, Kota', 'Kota', 'RJ-20', 'both', 1, 1, 1, 'active'),
-- Uttar Pradesh
(36, 52, 3, 'Lucknow Automated Driving Test Track', 'लखनऊ स्वचालित ड्राइविंग टेस्ट ट्रैक', 'લખનૌ ઓટોમેટેડ ડ્રાઇવિંગ ટેસ્ટ ટ્રેક', 'Kaiserbagh Area, Lucknow', 'Lucknow', 'UP-32', 'both', 1, 1, 1, 'active'),
(37, 53, 3, 'Kanpur Driving Test Centre', 'कानपुर ड्राइविंग टेस्ट केंद्र', 'કાનપુર ડ્રાઇવિંગ ટેસ્ટ કેન્દ્ર', 'GT Road Area, Kanpur', 'Kanpur', 'UP-78', 'both', 1, 1, 1, 'active'),
(38, 54, 3, 'Agra Driving Test Track', 'आगरा ड्राइविंग टेस्ट ट्रैक', 'આગ્રા ડ્રાઇવિંગ ટેસ્ટ ટ્રેક', 'Belanganj Area, Agra', 'Agra', 'UP-80', 'both', 1, 1, 0, 'active'),
(43, 59, 3, 'Noida Automated Test Track', 'नोएडा स्वचालित टेस्ट ट्रैक', 'નોઈડા ઓટોમેટેડ ટેસ્ટ ટ્રેક', 'Sector 32, Noida', 'Noida', 'UP-16', 'both', 1, 1, 0, 'active'),
(39, 55, 3, 'Varanasi Driving Test Centre', 'वाराणसी ड्राइविंग टेस्ट केंद्र', 'વારાણસી ડ્રાઇવિંગ ટેસ્ટ કેન્દ્ર', 'Sigra Area, Varanasi', 'Varanasi', 'UP-65', 'both', 1, 1, 1, 'active');

-- ============================================================
-- LICENCE SERVICES
-- ============================================================
INSERT INTO licence_services (name, name_hi, name_gu, slug, description, description_hi, description_gu, icon, estimated_days, requires_existing_licence, requires_learner_licence, requires_medical, requires_driving_test, allows_minor, sort_order, is_active) VALUES
('Learner Licence', 'लर्नर लाइसेंस', 'લર્નર લાઇસન્સ', 'learner-licence', 'Apply for a new Learner Licence to start learning to drive.', 'ड्राइविंग सीखने के लिए नए लर्नर लाइसेंस हेतु आवेदन करें।', 'ડ્રાઇવિંગ શીખવા માટે નવા લર્નર લાઇસન્સ માટે અરજી કરો.', 'book-open', 7, 0, 0, 0, 0, 1, 1, 1),
('New Driving Licence', 'नया ड्राइविंग लाइसेंस', 'નવું ડ્રાઇવિંગ લાઇસન્સ', 'new-driving-licence', 'Apply for a permanent Driving Licence after completing your learner period.', 'लर्नर अवधि पूरी होने के बाद स्थायी ड्राइविंग लाइसेंस के लिए आवेदन करें।', 'લર્નર સમયગાળો પૂરો થયા પછી કાયમી ડ્રાઇવિંગ લાઇસન્સ માટે અરજી કરો.', 'id-card', 30, 0, 1, 0, 1, 0, 2, 1),
('Renewal of Driving Licence', 'ड्राइविंग लाइसेंस का नवीनीकरण', 'ડ્રાઇવિંગ લાઇસન્સનું નવીનીકરણ', 'renewal', 'Renew your expired or expiring Driving Licence.', 'अपने समाप्त या समाप्त होने वाले ड्राइविंग लाइसेंस का नवीनीकरण करें।', 'તમારા સમાપ્ત થયેલ કે થઈ રહેલ ડ્રાઇવિંગ લાઇસન્સનું નવીનીકરણ કરો.', 'refresh-cw', 15, 1, 0, 0, 0, 0, 3, 0),
('Duplicate Driving Licence', 'डुप्लीकेट ड्राइविंग लाइसेंस', 'ડુપ્લિકેટ ડ્રાઇવિંગ લાઇસન્સ', 'duplicate', 'Get a duplicate licence if your original is lost, damaged or stolen.', 'यदि आपका मूल लाइसेंस खो गया, क्षतिग्रस्त या चोरी हो गया है तो डुप्लीकेट लाइसेंस प्राप्त करें।', 'જો તમારું મૂળ લાઇસન્સ ખોવાયું, ક્ષતિગ્રસ્ત અથવા ચોરાયું હોય તો ડુપ્લિકેટ લાઇસન્સ મેળવો.', 'copy', 15, 1, 0, 0, 0, 0, 4, 0),
('Addition of Vehicle Class', 'वाहन वर्ग का जोड़', 'વાહન વર્ગનો ઉમેરો', 'add-vehicle-class', 'Add a new vehicle class to your existing Driving Licence.', 'अपने मौजूदा ड्राइविंग लाइसेंस में नया वाहन वर्ग जोड़ें।', 'તમારા હાલના ડ્રાઇવિંગ લાઇસન્સમાં નવો વાહન વર્ગ ઉમેરો.', 'plus-circle', 21, 1, 0, 0, 1, 0, 5, 0),
('Change of Address', 'पते का परिवर्तन', 'સરનામાનો ફેરફાર', 'change-address', 'Update the address on your existing Driving Licence.', 'अपने मौजूदा ड्राइविंग लाइसेंस पर पता अपडेट करें।', 'તમારા હાલના ડ્રાઇવિંગ લાઇસન્સ પરનું સરનામું અપડેટ કરો.', 'map-pin', 15, 1, 0, 0, 0, 0, 6, 0),
('Change of Name', 'नाम का परिवर्तन', 'નામનો ફેરફાર', 'change-name', 'Update the name on your existing Driving Licence.', 'अपने मौजूदा ड्राइविंग लाइसेंस पर नाम अपडेट करें।', 'તમારા હાલના ડ્રાઇવિંગ લાઇસન્સ પરનું નામ અપડેટ કરો.', 'edit', 15, 1, 0, 0, 0, 0, 7, 0),
('International Driving Permit', 'अंतर्राष्ट्रीय ड्राइविंग परमिट', 'આંતરરાષ્ટ્રીય ડ્રાઇવિંગ પરમિટ', 'international-permit', 'Apply for an International Driving Permit for driving abroad.', 'विदेश में ड्राइविंग के लिए अंतर्राष्ट्रीय ड्राइविंग परमिट के लिए आवेदन करें।', 'વિદેશમાં ડ્રાઇવિંગ માટે આંતરરાષ્ટ્રીય ડ્રાઇવિંગ પરમિટ માટે અરજી કરો.', 'globe', 21, 1, 0, 0, 0, 0, 8, 0);

-- ============================================================
-- STATE-SERVICE MAPPING
-- ============================================================
-- Gujarat: All services
INSERT INTO state_services (state_id, service_id, is_active) VALUES
(1, 1, 1), (1, 2, 1), (1, 3, 0), (1, 4, 0), (1, 5, 0), (1, 6, 0), (1, 7, 0), (1, 8, 0);

-- Rajasthan: All except International Permit initially
INSERT INTO state_services (state_id, service_id, is_active) VALUES
(2, 1, 1), (2, 2, 1), (2, 3, 0), (2, 4, 0), (2, 5, 0), (2, 6, 0), (2, 7, 0);

-- Uttar Pradesh: All services
INSERT INTO state_services (state_id, service_id, is_active) VALUES
(3, 1, 1), (3, 2, 1), (3, 3, 0), (3, 4, 0), (3, 5, 0), (3, 6, 0), (3, 7, 0), (3, 8, 0);

-- ============================================================
-- SERVICE STEPS
-- ============================================================
-- Service 1 Steps
INSERT INTO service_steps (service_id, step_number, step_key, label, label_hi, label_gu) VALUES
(1, 1, 'applicant', 'Applicant Details', 'आवेदक विवरण', 'અરજદારની વિગતો'),
(1, 2, 'address', 'Address', 'पता', 'સરનામું'),
(1, 3, 'vehicle', 'Vehicle Class', 'वाहन वर्ग', 'વાહન વર્ગ'),
(1, 4, 'rto', 'RTO Selection', 'आरटीओ चयन', 'આરટીઓ પસંદગી'),
(1, 5, 'documents', 'Documents', 'दस्तावेज़', 'દસ્તાવેજો'),
(1, 6, 'review', 'Review', 'समीक्षा', 'સમીક્ષા'),
(1, 7, 'payment', 'Payment', 'भुगतान', 'ચૂકવણી');

-- Service 2 Steps
INSERT INTO service_steps (service_id, step_number, step_key, label, label_hi, label_gu) VALUES
(2, 1, 'applicant', 'Applicant Details', 'आवेदक विवरण', 'અરજદારની વિગતો'),
(2, 2, 'address', 'Address', 'पता', 'સરનામું'),
(2, 3, 'licence', 'Learner Licence', 'लर्नर लाइसेंस', 'લર્નર લાઇસન્સ'),
(2, 4, 'vehicle', 'Vehicle Class', 'वाहन वर्ग', 'વાહન વર્ગ'),
(2, 5, 'rto', 'RTO & Test Centre', 'आरटीओ और टेस्ट केंद्र', 'આરટીઓ અને ટેસ્ટ કેન્દ્ર'),
(2, 6, 'documents', 'Documents', 'दस्तावेज़', 'દસ્તાવેજો'),
(2, 7, 'review', 'Review', 'समीक्षा', 'સમીક્ષા'),
(2, 8, 'payment', 'Payment', 'भुगतान', 'ચૂકવણી');

-- Service 3 Steps
INSERT INTO service_steps (service_id, step_number, step_key, label, label_hi, label_gu) VALUES
(3, 1, 'applicant', 'Applicant Details', 'आवेदक विवरण', 'અરજદારની વિગતો'),
(3, 2, 'licence', 'Existing Licence', 'मौजूदा लाइसेंस', 'હાલનું લાઇસન્સ'),
(3, 3, 'address', 'Address', 'पता', 'સરનામું'),
(3, 4, 'rto', 'RTO Selection', 'आरटीओ चयन', 'આરટીઓ પસંદગી'),
(3, 5, 'documents', 'Documents', 'दस्तावेज़', 'દસ્તાવેજો'),
(3, 6, 'review', 'Review', 'समीक्षा', 'સમીક્ષા'),
(3, 7, 'payment', 'Payment', 'भुगतान', 'ચૂકવણી');

-- Service 4 Steps
INSERT INTO service_steps (service_id, step_number, step_key, label, label_hi, label_gu) VALUES
(4, 1, 'applicant', 'Applicant Details', 'आवेदक विवरण', 'અરજદારની વિગતો'),
(4, 2, 'licence', 'Existing Licence', 'मौजूदा लाइसेंस', 'હાલનું લાઇસન્સ'),
(4, 3, 'address', 'Address', 'पता', 'સરનામું'),
(4, 4, 'rto', 'RTO Selection', 'आरटीओ चयन', 'આરટીઓ પસંદગી'),
(4, 5, 'documents', 'Documents', 'दस्तावेज़', 'દસ્તાવેજો'),
(4, 6, 'review', 'Review', 'समीक्षा', 'સમીક્ષા'),
(4, 7, 'payment', 'Payment', 'भुगतान', 'ચૂકવણી');

-- Service 5 Steps
INSERT INTO service_steps (service_id, step_number, step_key, label, label_hi, label_gu) VALUES
(5, 1, 'applicant', 'Applicant Details', 'आवेदक विवरण', 'અરજદારની વિગતો'),
(5, 2, 'licence', 'Existing Licence', 'मौजूदा लाइसेंस', 'હાલનું લાઇસન્સ'),
(5, 3, 'vehicle', 'New Vehicle Class', 'नया वाहन वर्ग', 'નવો વાહન વર્ગ'),
(5, 4, 'rto', 'RTO & Test Centre', 'आरटीओ और टेस्ट केंद्र', 'આરટીઓ અને ટેસ્ટ કેન્દ્ર'),
(5, 5, 'documents', 'Documents', 'दस्तावेज़', 'દસ્તાવેજો'),
(5, 6, 'review', 'Review', 'समीक्षा', 'સમીક્ષા'),
(5, 7, 'payment', 'Payment', 'भुगतान', 'ચૂકવણી');

-- Service 6 Steps
INSERT INTO service_steps (service_id, step_number, step_key, label, label_hi, label_gu) VALUES
(6, 1, 'applicant', 'Applicant Details', 'आवेदक विवरण', 'અરજદારની વિગતો'),
(6, 2, 'licence', 'Existing Licence', 'मौजूदा लाइसेंस', 'હાલનું લાઇસન્સ'),
(6, 3, 'address', 'New Address', 'नया पता', 'નવું સરનામું'),
(6, 4, 'rto', 'RTO Selection', 'आरटीओ चयन', 'આરટીઓ પસંદગી'),
(6, 5, 'documents', 'Documents', 'दस्तावेज़', 'દસ્તાવેજો'),
(6, 6, 'review', 'Review', 'सમીક્ષા', 'સમીક્ષા'),
(6, 7, 'payment', 'Payment', 'भुगतान', 'ચૂકવણી');

-- Service 7 Steps
INSERT INTO service_steps (service_id, step_number, step_key, label, label_hi, label_gu) VALUES
(7, 1, 'applicant', 'Applicant Details', 'आवेदक विवरण', 'અરજદારની વિગતો'),
(7, 2, 'licence', 'Existing Licence', 'मौजूदा लाइसेंस', 'હાલનું લાઇસન્સ'),
(7, 3, 'rto', 'RTO Selection', 'आरटीओ चयन', 'આરટીઓ પસંદગી'),
(7, 4, 'documents', 'Documents', 'दस्तावेज़', 'દસ્તાવેજો'),
(7, 5, 'review', 'Review', 'समीक्षा', 'સમીક્ષા'),
(7, 6, 'payment', 'Payment', 'भुगतान', 'ચૂકવણી');

-- Service 8 Steps
INSERT INTO service_steps (service_id, step_number, step_key, label, label_hi, label_gu) VALUES
(8, 1, 'applicant', 'Applicant Details', 'आवेदक विवरण', 'અરજદારની વિગતો'),
(8, 2, 'licence', 'Existing Licence', 'मौजूदा लाइसेंस', 'હાલનું લાઇસન્સ'),
(8, 3, 'address', 'Address', 'पता', 'સરનામું'),
(8, 4, 'rto', 'RTO Selection', 'आरटीओ चयन', 'આરટીઓ પસંદગી'),
(8, 5, 'documents', 'Documents', 'दस्तावेज़', 'દસ્તાવેજો'),
(8, 6, 'review', 'Review', 'समीक्षा', 'સમીક્ષા'),
(8, 7, 'payment', 'Payment', 'भुगतान', 'ચૂકવણી');

-- ============================================================
-- VEHICLE CLASSES
-- ============================================================
INSERT INTO vehicle_classes (code, name, name_hi, name_gu, description, description_hi, description_gu, min_age, requires_medical, sort_order) VALUES
('MC50CC', 'Motorcycle 50cc', 'मोटरसाइकिल 50cc', 'મોટરસાઇકલ 50cc', 'Motorcycles with engine capacity up to 50cc', 'इंजन क्षमता 50cc तक की मोटरसाइकिल', 'એન્જિન ક્ષમતા 50cc સુધીની મોટરસાઇકલ', 16, 0, 1),
('MCWOG', 'Motorcycle Without Gear', 'गियर रहित मोटरसाइकिल', 'ગિયર વગરની મોટરસાઇકલ', 'Gearless scooters and mopeds (e.g., Activa, Jupiter)', 'गियर रहित स्कूटर और मोपेड (जैसे एक्टिवा, जुपिटर)', 'ગિયર વગરના સ્કૂટર અને મોપેડ (દા.ત., એક્ટિવા, જુપિટર)', 16, 0, 2),
('MCWG', 'Motorcycle With Gear', 'गियर वाली मोटरसाइकिल', 'ગિયર વાળી મોટરસાઇકલ', 'All motorcycles with manual gears', 'मैनुअल गियर वाली सभी मोटरसाइकिल', 'મેન્યુઅલ ગિયર વાળી તમામ મોટરસાઇકલ', 18, 0, 3),
('LMV', 'Light Motor Vehicle (Car)', 'हल्का मोटर वाहन (कार)', 'હળવું મોટર વાહન (કાર)', 'Cars, jeeps, small vans for personal use', 'निजी उपयोग के लिए कार, जीप, छोटी वैन', 'અંગત ઉપયોગ માટે કાર, જીપ, નાની વેન', 18, 0, 4),
('LMV-NT', 'LMV Non-Transport', 'एलएमवी गैर-परिवहन', 'એલએમવી બિન-પરિવહન', 'Light motor vehicles for personal (non-commercial) use', 'निजी (गैर-वाणिज्यिक) उपयोग के लिए हल्का मोटर वाहन', 'અંગત (બિન-વ્યાપારી) ઉપયોગ માટે હળવું મોટર વાહન', 18, 0, 5),
('LMV-TR', 'LMV Transport', 'एलएमवी परिवहन', 'એલએમવી પરિવહન', 'Light motor vehicles for commercial/transport use', 'वाणिज्यिक/परिवहन उपयोग के लिए हल्का मोटर वाहन', 'વ્યાપારી/પરિવહન ઉપયોગ માટે હળવું મોટર વાહન', 20, 1, 6),
('HMV', 'Heavy Motor Vehicle', 'भारी मोटर वाहन', 'ભારે મોટર વાહન', 'Buses, trucks, and heavy commercial vehicles', 'बसें, ट्रक और भारी वाणिज्यिक वाहन', 'બસ, ટ્રક અને ભારે વ્યાપારી વાહન', 20, 1, 7),
('TRANS', 'Transport Vehicle', 'परिवहन वाहन', 'પરિવહન વાહન', 'Commercial transport vehicles (goods/passenger)', 'वाणिज्यिक परिवहन वाहन (माल/यात्री)', 'વ્યાપારી પરિવહન વાહન (માલ/મુસાફર)', 20, 1, 8);

-- Service-Vehicle Class Mapping (all 3 states, key services)
-- Learner Licence - all personal classes
INSERT INTO service_vehicle_classes (service_id, state_id, vehicle_class_id) VALUES
(1,1,1),(1,1,2),(1,1,3),(1,1,4),(1,1,5),(1,1,6),(1,1,7),(1,1,8),
(1,2,1),(1,2,2),(1,2,3),(1,2,4),(1,2,5),(1,2,6),(1,2,7),(1,2,8),
(1,3,1),(1,3,2),(1,3,3),(1,3,4),(1,3,5),(1,3,6),(1,3,7),(1,3,8);

-- New DL - all classes
INSERT INTO service_vehicle_classes (service_id, state_id, vehicle_class_id) VALUES
(2,1,1),(2,1,2),(2,1,3),(2,1,4),(2,1,5),(2,1,6),(2,1,7),(2,1,8),
(2,2,1),(2,2,2),(2,2,3),(2,2,4),(2,2,5),(2,2,6),(2,2,7),(2,2,8),
(2,3,1),(2,3,2),(2,3,3),(2,3,4),(2,3,5),(2,3,6),(2,3,7),(2,3,8);

-- Addition of Vehicle Class
INSERT INTO service_vehicle_classes (service_id, state_id, vehicle_class_id) VALUES
(5,1,1),(5,1,2),(5,1,3),(5,1,4),(5,1,5),(5,1,6),(5,1,7),(5,1,8),
(5,2,1),(5,2,2),(5,2,3),(5,2,4),(5,2,5),(5,2,6),(5,2,7),(5,2,8),
(5,3,1),(5,3,2),(5,3,3),(5,3,4),(5,3,5),(5,3,6),(5,3,7),(5,3,8);

-- ============================================================
-- IDENTITY TYPES
-- ============================================================
INSERT INTO identity_types (name, name_hi, name_gu, code, sort_order) VALUES
('Aadhaar Card', 'आधार कार्ड', 'આધાર કાર્ડ', 'AADHAAR', 1),
('Passport', 'पासपोर्ट', 'પાસપોર્ટ', 'PASSPORT', 2),
('Voter ID Card', 'मतदाता पहचान पत्र', 'મતદાર ઓળખ કાર્ડ', 'VOTER_ID', 3),
('PAN Card', 'पैन कार्ड', 'પાન કાર્ડ', 'PAN', 4),
('Ration Card', 'राशन कार्ड', 'રેશન કાર્ડ', 'RATION', 5);

-- All states accept all identity types
INSERT INTO state_identity_types (state_id, identity_type_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),
(2,1),(2,2),(2,3),(2,4),(2,5),
(3,1),(3,2),(3,3),(3,4),(3,5);

-- ============================================================
-- DOCUMENT TYPES
-- ============================================================
INSERT INTO document_types (name, name_hi, name_gu, code, category, description, where_to_get, where_to_get_hi, where_to_get_gu, accepted_formats, max_size_mb, sort_order) VALUES
('Proof of Age', 'आयु प्रमाण', 'ઉંમરનો પુરાવો', 'AGE_PROOF', 'age', 'Birth certificate, school certificate, or passport', 'Municipal corporation, school, or passport office', 'नगर निगम, स्कूल या पासपोर्ट कार्यालय', 'મ્યુનિસિપલ કોર્પોરેશન, શાળા કે પાસપોર્ટ ઓફિસ', 'pdf,jpg,jpeg,png', 2, 1),
('Proof of Address', 'पते का प्रमाण', 'સરનામાનો પુરાવો', 'ADDRESS_PROOF', 'address', 'Aadhaar card, utility bill, voter ID, or rental agreement', 'UIDAI centre, utility provider, election commission', 'यूआईडीएआई केंद्र, उपयोगिता प्रदाता, चुनाव आयोग', 'UIDAI કેન્દ્ર, ઉપયોગિતા પ્રદાતા, ચૂંટણી આયોગ', 'pdf,jpg,jpeg,png', 2, 2),
('Passport Size Photograph', 'पासपोर्ट साइज फोटो', 'પાસપોર્ટ સાઇઝ ફોટો', 'PHOTO', 'photo', 'Recent passport-size photograph with white background', 'Any photo studio', 'कोई भी फोटो स्टूडियो', 'કોઈપણ ફોટો સ્ટુડિયો', 'jpg,jpeg,png', 1, 3),
('Signature', 'हस्ताक्षर', 'સહી', 'SIGNATURE', 'signature', 'Scanned signature on white paper', 'Self-signed on plain white paper', 'सादे सफेद कागज पर स्व-हस्ताक्षरित', 'સાદા સફેદ કાગળ પર સ્વ-હસ્તાક્ષરિત', 'jpg,jpeg,png', 1, 4),
('Identity Proof', 'पहचान प्रमाण', 'ઓળખનો પુરાવો', 'IDENTITY_PROOF', 'identity', 'Aadhaar card, passport, voter ID, or PAN card', 'UIDAI, passport office, election commission, or income tax dept', 'यूआईडीएआई, पासपोर्ट कार्यालय, चुनाव आयोग या आयकर विभाग', 'UIDAI, પાસપોર્ટ ઓફિસ, ચૂંટણી આયોગ અથવા આવકવેરા વિભાગ', 'pdf,jpg,jpeg,png', 2, 5),
('Medical Certificate (Form 1)', 'चिकित्सा प्रमाणपत्र (फॉर्म 1)', 'મેડિકલ સર્ટિફિકેટ (ફોર્મ 1)', 'MEDICAL_FORM1', 'medical', 'Self-declaration of physical fitness (for applicants under 40 years)', 'Self-declaration form', 'स्व-घोषणा फॉर्म', 'સ્વ-ઘોષણા ફોર્મ', 'pdf,jpg,jpeg,png', 2, 6),
('Medical Certificate (Form 1A)', 'चिकित्सा प्रमाणपत्र (फॉर्म 1ए)', 'મેડિકલ સર્ટિફિકેટ (ફોર્મ 1A)', 'MEDICAL_FORM1A', 'medical', 'Medical certificate by registered medical practitioner (age 40+ or transport vehicles)', 'Registered medical practitioner', 'पंजीकृत चिकित्सक', 'રજિસ્ટર્ડ મેડિકલ પ્રેક્ટિશનર', 'pdf,jpg,jpeg,png', 2, 7),
('Learner Licence', 'लर्नर लाइसेंस', 'લર્નર લાઇસન્સ', 'LEARNER_LICENCE', 'other', 'Valid Learner Licence issued by RTO', 'Sarathi portal / RTO office', 'सारथी पोर्टल / आरटीओ कार्यालय', 'સારથી પોર્ટલ / આરટીઓ ઓફિસ', 'pdf,jpg,jpeg,png', 2, 8),
('Existing Driving Licence', 'मौजूदा ड्राइविंग लाइसेंस', 'હાલનું ડ્રાઇવિંગ લાઇસન્સ', 'EXISTING_DL', 'other', 'Copy of current/expired Driving Licence', 'Your existing licence', 'आपका मौजूदा लाइसेंस', 'તમારું હાલનું લાઇસન્સ', 'pdf,jpg,jpeg,png', 2, 9),
('Parent/Guardian Declaration', 'माता-पिता/अभिभावक घोषणा', 'માતા-પિતા/વાલીની ઘોષણા', 'GUARDIAN_DECLARATION', 'other', 'Declaration by parent/guardian for minor applicants', 'Self-declaration by parent/guardian', 'माता-पिता/अभिभावक द्वारा स्व-घोषणा', 'માતા-પિતા/વાલી દ્વારા સ્વ-ઘોષણા', 'pdf,jpg,jpeg,png', 2, 10),
('FIR / Police Report', 'एफआईआर / पुलिस रिपोर्ट', 'FIR / પોલીસ રિપોર્ટ', 'FIR_REPORT', 'other', 'FIR or police report for lost/stolen licence', 'Nearest police station', 'निकटतम पुलिस थाना', 'નજીકનું પોલીસ સ્ટેશન', 'pdf,jpg,jpeg,png', 2, 11),
('Passport (for IDP)', 'पासपोर्ट (आईडीपी के लिए)', 'પાસપોર્ટ (IDP માટે)', 'PASSPORT_IDP', 'other', 'Valid passport for International Driving Permit', 'Regional Passport Office', 'क्षेत्रीय पासपोर्ट कार्यालय', 'પ્રાદેશિક પાસપોર્ટ ઓફિસ', 'pdf,jpg,jpeg,png', 2, 12),
('Marriage Certificate / Gazette', 'विवाह प्रमाणपत्र / गजट', 'લગ્ન પ્રમાણપત્ર / ગેઝેટ', 'NAME_CHANGE_PROOF', 'other', 'Marriage certificate or gazette notification for name change', 'Registrar office or gazette publisher', 'रजिस्ट्रार कार्यालय या गजट प्रकाशक', 'રજિસ્ટ્રાર ઓફિસ અથવા ગેઝેટ પ્રકાશક', 'pdf,jpg,jpeg,png', 2, 13);

-- ============================================================
-- SERVICE DOCUMENTS (per service per state)
-- ============================================================
-- Learner Licence - Gujarat
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(1, 1, 1, 1, 1), -- Age proof
(1, 1, 2, 1, 2), -- Address proof
(1, 1, 3, 1, 3), -- Photo
(1, 1, 4, 1, 4), -- Signature
(1, 1, 5, 1, 5); -- Identity proof

-- Learner Licence - Medical conditional
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, condition_description, condition_field, condition_value, sort_order) VALUES
(1, 1, 6, 0, 'Required for applicants under 40 years', 'age_group', 'under_40', 6),
(1, 1, 7, 0, 'Required for applicants 40 years and above, or transport vehicle applicants', 'age_group', 'above_40', 7);

-- Learner Licence - Minor
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, condition_description, condition_field, condition_value, sort_order) VALUES
(1, 1, 10, 0, 'Required only for minor applicants (under 18)', 'is_minor', '1', 8);

-- Learner Licence - Rajasthan (same docs)
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(1, 2, 1, 1, 1), (1, 2, 2, 1, 2), (1, 2, 3, 1, 3), (1, 2, 4, 1, 4), (1, 2, 5, 1, 5);
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, condition_description, condition_field, condition_value, sort_order) VALUES
(1, 2, 6, 0, 'Required for applicants under 40 years', 'age_group', 'under_40', 6),
(1, 2, 7, 0, 'Required for applicants 40 years and above', 'age_group', 'above_40', 7),
(1, 2, 10, 0, 'Required only for minor applicants', 'is_minor', '1', 8);

-- Learner Licence - Uttar Pradesh (same docs)
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(1, 3, 1, 1, 1), (1, 3, 2, 1, 2), (1, 3, 3, 1, 3), (1, 3, 4, 1, 4), (1, 3, 5, 1, 5);
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, condition_description, condition_field, condition_value, sort_order) VALUES
(1, 3, 6, 0, 'Required for applicants under 40 years', 'age_group', 'under_40', 6),
(1, 3, 7, 0, 'Required for applicants 40 years and above', 'age_group', 'above_40', 7),
(1, 3, 10, 0, 'Required only for minor applicants', 'is_minor', '1', 8);

-- New DL - All states (need LL + standard docs)
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(2, 1, 8, 1, 1), (2, 1, 1, 1, 2), (2, 1, 2, 1, 3), (2, 1, 3, 1, 4), (2, 1, 4, 1, 5), (2, 1, 5, 1, 6),
(2, 2, 8, 1, 1), (2, 2, 1, 1, 2), (2, 2, 2, 1, 3), (2, 2, 3, 1, 4), (2, 2, 4, 1, 5), (2, 2, 5, 1, 6),
(2, 3, 8, 1, 1), (2, 3, 1, 1, 2), (2, 3, 2, 1, 3), (2, 3, 3, 1, 4), (2, 3, 4, 1, 5), (2, 3, 5, 1, 6);

-- Renewal - All states
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(3, 1, 9, 1, 1), (3, 1, 2, 1, 2), (3, 1, 3, 1, 3), (3, 1, 5, 1, 4),
(3, 2, 9, 1, 1), (3, 2, 2, 1, 2), (3, 2, 3, 1, 3), (3, 2, 5, 1, 4),
(3, 3, 9, 1, 1), (3, 3, 2, 1, 2), (3, 3, 3, 1, 3), (3, 3, 5, 1, 4);

-- Duplicate - All states (need FIR)
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(4, 1, 5, 1, 1), (4, 1, 2, 1, 2), (4, 1, 3, 1, 3), (4, 1, 11, 1, 4),
(4, 2, 5, 1, 1), (4, 2, 2, 1, 2), (4, 2, 3, 1, 3), (4, 2, 11, 1, 4),
(4, 3, 5, 1, 1), (4, 3, 2, 1, 2), (4, 3, 3, 1, 3), (4, 3, 11, 1, 4);

-- Change of Address - All states
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(6, 1, 9, 1, 1), (6, 1, 2, 1, 2), (6, 1, 5, 1, 3),
(6, 2, 9, 1, 1), (6, 2, 2, 1, 2), (6, 2, 5, 1, 3),
(6, 3, 9, 1, 1), (6, 3, 2, 1, 2), (6, 3, 5, 1, 3);

-- Change of Name - All states
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(7, 1, 9, 1, 1), (7, 1, 5, 1, 2), (7, 1, 13, 1, 3),
(7, 2, 9, 1, 1), (7, 2, 5, 1, 2), (7, 2, 13, 1, 3),
(7, 3, 9, 1, 1), (7, 3, 5, 1, 2), (7, 3, 13, 1, 3);

-- IDP - Gujarat & UP
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(8, 1, 9, 1, 1), (8, 1, 12, 1, 2), (8, 1, 3, 1, 3), (8, 1, 5, 1, 4),
(8, 3, 9, 1, 1), (8, 3, 12, 1, 2), (8, 3, 3, 1, 3), (8, 3, 5, 1, 4);

-- Addition of Vehicle Class - All states
INSERT INTO service_documents (service_id, state_id, document_type_id, is_required, sort_order) VALUES
(5, 1, 9, 1, 1), (5, 1, 5, 1, 2), (5, 1, 3, 1, 3),
(5, 2, 9, 1, 1), (5, 2, 5, 1, 2), (5, 2, 3, 1, 3),
(5, 3, 9, 1, 1), (5, 3, 5, 1, 2), (5, 3, 3, 1, 3);

-- ============================================================
-- FEE STRUCTURE (based on Central Motor Vehicles Rules)
-- ============================================================
-- Gujarat fees
INSERT INTO fee_structure (service_id, state_id, government_fee, service_fee, smart_card_fee, test_fee) VALUES
(1, 1, 150, 99, 0, 50),      -- Learner Licence
(2, 1, 200, 99, 200, 300),    -- New DL
(3, 1, 200, 99, 200, 0),     -- Renewal
(4, 1, 200, 99, 200, 0),     -- Duplicate
(5, 1, 500, 99, 200, 300),    -- Add Vehicle Class
(6, 1, 200, 99, 200, 0),     -- Change Address
(7, 1, 200, 99, 200, 0),     -- Change Name
(8, 1, 1000, 99, 0, 0);      -- IDP

-- Rajasthan fees
INSERT INTO fee_structure (service_id, state_id, government_fee, service_fee, smart_card_fee, test_fee) VALUES
(1, 2, 150, 99, 0, 50),
(2, 2, 200, 99, 200, 300),
(3, 2, 200, 99, 200, 0),
(4, 2, 200, 99, 200, 0),
(5, 2, 500, 99, 200, 300),
(6, 2, 200, 99, 200, 0),
(7, 2, 200, 99, 200, 0);

-- Uttar Pradesh fees
INSERT INTO fee_structure (service_id, state_id, government_fee, service_fee, smart_card_fee, test_fee) VALUES
(1, 3, 150, 99, 0, 50),
(2, 3, 200, 99, 200, 300),
(3, 3, 200, 99, 200, 0),
(4, 3, 200, 99, 200, 0),
(5, 3, 500, 99, 200, 300),
(6, 3, 200, 99, 200, 0),
(7, 3, 200, 99, 200, 0),
(8, 3, 1000, 99, 0, 0);

-- ============================================================
-- DEFAULT ADMIN USER
-- ============================================================
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Admin', 'admin@drivinglicenseform.com', '9999999999', '$2b$10$VQ5WjuB2acEPY1eDOT3jEeBBrDGzMwrIlYFi0O9a3oUAx.He/Rp76', 'admin');
