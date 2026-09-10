const { getDb } = require('../src/lib/db');

// Define data for all 14 sections across en, gu, hi for version 1.2
const sectionsData = [
    // 01 Overview
    {
      key: '01-overview',
      num: '01',
      sort: 1,
      en: {
        heading: 'Overview & Digital Service Commitment',
        subheading: 'Clear, transparent and citizen-first privacy governance under the Digital Personal Data Protection Act, 2023.',
        content: 'Driving License Form operates as an independent private digital application assistance service dedicated to simplifying driving licence applications across Gujarat, Rajasthan, and Uttar Pradesh. We recognize personal data as an essential trust placed in us by citizens. This Privacy Policy sets forth our principles, lawful bases, processing protocols, and statutory rights available to you under the Digital Personal Data Protection Act, 2023 (DPDP Act) and the DPDP Rules, 2025.',
        callout_title: 'Independent Citizen Facilitation Platform',
        callout_content: 'Driving License Form is an independent facilitation service. We are not an official government portal and are not affiliated with MoRTH, Parivahan Sewa, or any State Regional Transport Authority. We collect data solely with informed consent to prepare applications for official submission.',
        structured: {
          principles: [
            { title: 'Lawful & Fair Processing', desc: 'Data is gathered only for specified, transparent purposes with verifiable consent.' },
            { title: 'Purpose Limitation', desc: 'Information is never repurposed, sold, or shared for unauthorized commercial gain.' },
            { title: 'Data Minimization', desc: 'We only request data strictly needed to process your chosen licence service.' },
            { title: 'Storage Limitation', desc: 'Records are securely disposed of once statutory retention thresholds expire.' }
          ]
        }
      },
      gu: {
        heading: 'ઝાંખી અને ડિજિટલ સેવા પ્રતિબદ્ધતા',
        subheading: 'ડિજિટલ પર્સનલ ડેટા પ્રોટેક્શન એક્ટ, 2023 હેઠળ સ્પષ્ટ, પારદર્શક અને નાગરિક-પ્રથમ ગોપનીયતા શાસન.',
        content: 'ડ્રાઇવિંગ લાઇસન્સ ફોર્મ ગુજરાત, રાજસ્થાન અને ઉત્તર પ્રદેશમાં ડ્રાઇવિંગ લાઇસન્સ અરજીઓને સરળ બનાવવા માટે સમર્પિત સ્વતંત્ર ખાનગી ડિજિટલ સહાયક સેવા તરીકે કાર્ય કરે છે. અમે વ્યક્તિગત ડેટાને નાગરિકો દ્વારા અમારા પર મુકાયેલા વિશ્વાસ તરીકે સ્વીકારીએ છીએ. આ ગોપનીયતા નીતિ અમારા સિદ્ધાંતો, કાયદેસરના આધારો, પ્રોસેસિંગ નિયમો અને ડિજિટલ પર્સનલ ડેટા પ્રોટેક્શન એક્ટ, 2023 અને ડીપીડીપી નિયમો 2025 હેઠળ તમને ઉપલબ્ધ વૈધાનિક અધિકારો રજૂ કરે છે.',
        callout_title: 'સ્વતંત્ર નાગરિક સહાયતા પ્લેટફોર્મ',
        callout_content: 'ડ્રાઇવિંગ લાઇસન્સ ફોર્મ એક સ્વતંત્ર સહાયક સેવા છે. અમે અધિકૃત સરકારી પોર્ટલ નથી અને મોર્થ, પરિવહન સેવા અથવા કોઈપણ રાજ્ય આરટીઓ સાથે જોડાયેલા નથી. અમે સત્તાવાર સબમિશન માટે અરજીઓ તૈયાર કરવા માટે માત્ર જાણકાર સંમતિ સાથે ડેટા એકત્રિત કરીએ છીએ.',
        structured: {
          principles: [
            { title: 'કાયદેસર અને વાજબી પ્રક્રિયા', desc: 'ચકાસાયેલ સંમતિ સાથે ચોક્કસ, પારદર્શક હેતુઓ માટે જ ડેટા એકત્રિત કરવામાં આવે છે.' },
            { title: 'હેતુ મર્યાદા', desc: 'માહિતીને ક્યારેય અનધિકૃત વ્યાપારી લાભ માટે વેચવામાં કે શેર કરવામાં આવતી નથી.' },
            { title: 'ડેટા લઘુત્તમીકરણ', desc: 'તમારી પસંદ કરેલી લાઇસન્સ સેવા માટે જરૂરી હોય તેટલો જ ડેટા અમે વિનંતી કરીએ છીએ.' },
            { title: 'સંગ્રહ મર્યાદા', desc: 'વૈધાનિક જાળવણી મર્યાદા પૂર્ણ થયા પછી રેકોર્ડ્સ સુરક્ષિત રીતે દૂર કરવામાં આવે છે.' }
          ]
        }
      },
      hi: {
        heading: 'अवलोकन एवं डिजिटल सेवा प्रतिबद्धता',
        subheading: 'डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट, 2023 के तहत स्पष्ट, पारदर्शी और नागरिक-प्रथम गोपनीयता प्रशासन।',
        content: 'ड्राइविंग लाइसेंस फॉर्म गुजरात, राजस्थान और उत्तर प्रदेश में ड्राइविंग लाइसेंस आवेदनों को सरल बनाने हेतु एक स्वतंत्र निजी डिजिटल सहायता सेवा के रूप में संचालित होता है। हम नागरिकों द्वारा दिए गए व्यक्तिगत डेटा को एक पवित्र विश्वास मानते हैं। यह गोपनीयता नीति हमारे सिद्धांतों, वैधानिक आधारों, डेटा प्रोसेसिंग प्रोटोकॉल और डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट, 2023 तथा डीपीडीपी नियम 2025 के तहत नागरिकों को उपलब्ध वैधानिक अधिकारों को स्पष्ट करती है।',
        callout_title: 'स्वतंत्र नागरिक सुविधा मंच',
        callout_content: 'ड्राइविंग लाइसेंस फॉर्म एक स्वतंत्र सुविधा सेवा है। हम आधिकारिक सरकारी पोर्टल नहीं हैं और MoRTH, परिवहन सेवा या किसी भी राज्य आरटीओ से संबद्ध नहीं हैं। हम आधिकारिक सबमिशन हेतु आवेदन तैयार करने के लिए केवल स्पष्ट सहमति से ही डेटा एकत्र करते हैं।',
        structured: {
          principles: [
            { title: 'वैध एवं निष्पक्ष प्रोसेसिंग', desc: 'डेटा केवल विशिष्ट, पारदर्शी उद्देश्यों और सत्यापित सहमति के आधार पर एकत्र किया जाता है।' },
            { title: 'उद्देश्य सीमा', desc: 'जानकारी को कभी भी अनधिकृत व्यावसायिक लाभ के लिए बेचा या साझा नहीं किया जाता।' },
            { title: 'डेटा न्यूनीकरण', desc: 'हम केवल वही जानकारी मांगते हैं जो आपके चयनित लाइसेंस कार्य हेतु अत्यंत आवश्यक है।' },
            { title: 'भंडारण सीमा', desc: 'कानूनी अवधारण अवधि समाप्त होने पर रिकॉर्ड सुरक्षित रूप से नष्ट कर दिए जाते हैं।' }
          ]
        }
      }
    },

    // 02 Information We Collect
    {
      key: '02-information-collected',
      num: '02',
      sort: 2,
      en: {
        heading: 'Information We Collect',
        subheading: 'Categorized inventory of data points collected with your explicit, informed consent.',
        content: 'We collect only the personal information essential to prepare, validate, and track your driving licence application dossier. Expand each category below to review specific data points and their protection classification.',
        callout_title: 'WHY WE ASK FOR THIS',
        callout_content: 'Every field requested corresponds directly to a statutory requirement under the Motor Vehicles Act, 1988 or Central Motor Vehicles Rules, 1989 for filing forms at your State RTO.',
        structured: {
          categories: [
            {
              id: 'account',
              title: 'Account Information',
              badge: 'Basic Identity',
              summary: 'Primary contact credentials used for two-factor authentication and security notifications.',
              items: ['Full Legal Name', 'Mobile Phone Number', 'Email Address', 'Authentication Password Hash']
            },
            {
              id: 'application',
              title: 'Application Information',
              badge: 'Service Data',
              summary: 'Licence specifications, jurisdictional assignments, and vehicle category declarations.',
              items: ['Selected Licence Service (Learner, Permanent, Renewal, Duplicate)', 'State & Registered RTO Office', 'Vehicle Classes (MCWG, LMV, Transport)', 'Existing Licence Number (for renewal/duplicate)', 'Date of Birth', 'Gender & Blood Group']
            },
            {
              id: 'documents',
              title: 'Uploaded Documents',
              badge: 'Sensitive Verification',
              summary: 'Identity and address proof scans uploaded for verification and RTO dossier assembly.',
              items: ['Identity Proof (Aadhaar / Voter ID / Passport - masked storage)', 'Address Proof (Utility Bill / Ration Card / Rent Agreement)', 'Age Proof (Birth Certificate / School Leaving / SSC)', 'Medical Certificate Form 1-A (for transport/commercial or applicants 40+ years)', 'Passport Photograph & Signature Specimen']
            },
            {
              id: 'payment',
              title: 'Payment Information',
              badge: 'Transactional',
              summary: 'Audit tokens for facilitation fee settlement. Raw card data is never processed or stored on our servers.',
              items: ['Payment Reference Order ID', 'Transaction Timestamp', 'Amount Paid & Facilitation Fee breakdown', 'Masked Payment Mode (UPI / NetBanking / Card Token)']
            }
          ]
        }
      },
      gu: {
        heading: 'અમે એકત્રિત કરીએ છીએ તે માહિતી',
        subheading: 'તમારી સ્પષ્ટ, જાણકાર સંમતિ સાથે એકત્રિત કરવામાં આવેલા ડેટાનું વર્ગીકૃત ઇન્વેન્ટરી.',
        content: 'તમારા ડ્રાઇવિંગ લાઇસન્સ અરજી દસ્તાવેજને તૈયાર કરવા, માન્ય કરવા અને ટ્રેક કરવા માટે જરૂરી હોય તેવી જ વ્યક્તિગત માહિતી અમે એકત્રિત કરીએ છીએ. ચોક્કસ વિગતો અને તેના સુરક્ષા સ્તરની સમીક્ષા કરવા માટે નીચે આપેલા વર્ગો ખોલો.',
        callout_title: 'અમે આ માહિતી શા માટે માંગીએ છીએ',
        callout_content: 'માંગવામાં આવેલ દરેક વિગત મોટર વાહન અધિનિયમ, 1988 અને સેન્ટ્રલ મોટર વ્હીકલ રૂલ્સ, 1989 હેઠળ તમારા રાજ્ય આરટીઓમાં ફોર્મ ભરવાની વૈધાનિક જરૂરિયાતને સીધી અનુરૂપ છે.',
        structured: {
          categories: [
            {
              id: 'account',
              title: 'ખાતાની માહિતી',
              badge: 'મૂળભૂત ઓળખ',
              summary: 'દ્વિ-પરિબળ પ્રમાણીકરણ અને સુરક્ષા સૂચનાઓ માટે ઉપયોગમાં લેવાતી પ્રાથમિક સંપર્ક ઓળખ.',
              items: ['સંપૂર્ણ કાનૂની નામ', 'મોબાઇલ ફોન નંબર', 'ઇમેઇલ સરનામું', 'પ્રમાણીકરણ પાસવર્ડ હેશ']
            },
            {
              id: 'application',
              title: 'અરજીની માહિતી',
              badge: 'સેવા ડેટા',
              summary: 'લાઇસન્સ વિશિષ્ટતાઓ, આરટીઓ અધિકારક્ષેત્ર અને વાહન શ્રેણીની ઘોષણાઓ.',
              items: ['પસંદ કરેલ સેવા (લર્નર, કાયમી, રિન્યુઅલ, ડુપ્લિકેટ)', 'રાજ્ય અને નોંધાયેલ આરટીઓ કચેરી', 'વાહન વર્ગ (MCWG, LMV)', 'હાલનો લાઇસન્સ નંબર', 'જન્મ તારીખ', 'જાતિ અને રક્ત જૂથ']
            },
            {
              id: 'documents',
              title: 'અપલોડ કરેલા દસ્તાવેજો',
              badge: 'સંવેદનશીલ ચકાસણી',
              summary: 'ઓળખ અને સરનામાના પુરાવાના સ્કેન જે આરટીઓ અરજી માટે જરૂરી છે.',
              items: ['ઓળખનો પુરાવો (આધાર / ચૂંટણી કાર્ડ - સુરક્ષિત માસ્કિંગ)', 'સરનામાનો પુરાવો (લાઇટ બિલ / રેશન કાર્ડ / ભાડા કરાર)', 'ઉંમરનો પુરાવો (જન્મ પ્રમાણપત્ર / શાળા છોડ્યાનું પ્રમાણપત્ર)', 'મેડિકલ સર્ટિફિકેટ ફોર્મ 1-A (જરૂર મુજબ)', 'પાસપોર્ટ સાઇઝ ફોટોગ્રાફ અને સહી']
            },
            {
              id: 'payment',
              title: 'ચુકવણીની માહિતી',
              badge: 'વ્યવહારિક',
              summary: 'સેવા ફી સમાધાન માટેના ઓડિટ ટોકન્સ. અમે ક્યારેય કાર્ડ કે બેંક વિગતો સંગ્રહિત કરતા નથી.',
              items: ['પેમેન્ટ સંદર્ભ ઓર્ડર આઈડી', 'ટ્રાન્ઝેક્શન તારીખ અને સમય', 'ચૂકવેલ રકમ', 'માસ્ક્ડ પેમેન્ટ મોડ (UPI / નેટબેંકિંગ)']
            }
          ]
        }
      },
      hi: {
        heading: 'एकत्रित की जाने वाली जानकारी',
        subheading: 'आपकी स्पष्ट और सूचित सहमति से एकत्र किए गए डेटा का वर्गीकृत विवरण।',
        content: 'हम केवल वही व्यक्तिगत जानकारी एकत्र करते हैं जो आपके ड्राइविंग लाइसेंस आवेदन पत्र को तैयार करने, सत्यापित करने और ट्रैक करने हेतु अनिवार्य है। विस्तृत डेटा बिंदुओं और उनके सुरक्षा स्तर की समीक्षा के लिए नीचे दी गई श्रेणियों को खोलें।',
        callout_title: 'हम यह जानकारी क्यों मांगते हैं',
        callout_content: 'मांगा गया प्रत्येक डेटा फ़ील्ड मोटर वाहन अधिनियम, 1988 और केंद्रीय मोटर वाहन नियम, 1989 के तहत आपके राज्य आरटीओ में आवेदन प्रस्तुत करने की वैधानिक आवश्यकता के अनुरूप है।',
        structured: {
          categories: [
            {
              id: 'account',
              title: 'खाता संबंधी जानकारी',
              badge: 'मूल पहचान',
              summary: 'दो-चरणीय सत्यापन और सुरक्षा अलर्ट के लिए उपयोग किए जाने वाले प्राथमिक संपर्क विवरण।',
              items: ['पूरा कानूनी नाम', 'मोबाइल फ़ोन नंबर', 'ईमेल पता', 'एन्क्रिप्टेड पासवर्ड हैश']
            },
            {
              id: 'application',
              title: 'आवेदन संबंधी जानकारी',
              badge: 'सेवा डेटा',
              summary: 'लाइसेंस प्रकार, आरटीओ अधिकार क्षेत्र और वाहन श्रेणी से संबंधित घोषणाएं।',
              items: ['चयनित लाइसेंस सेवा (लर्नर, स्थायी, नवीनीकरण, डुप्लिकेट)', 'राज्य एवं पंजीकृत आरटीओ कार्यालय', 'वाहन वर्ग (MCWG, LMV)', 'मौजूदा लाइसेंस नंबर', 'जन्म तिथि', 'लिंग एवं रक्त समूह']
            },
            {
              id: 'documents',
              title: 'अपलोड किए गए दस्तावेज़',
              badge: 'संवेदनशील सत्यापन',
              summary: 'पहचान और पते के प्रमाण पत्र जो आरटीओ आवेदन सत्यापन के लिए आवश्यक हैं।',
              items: ['पहचान प्रमाण (आधार / वोटर आईडी / पासपोर्ट - मास्क्ड स्टोरेज)', 'पते का प्रमाण (बिजली बिल / राशन कार्ड / किराया समझौता)', 'आयु प्रमाण (जन्म प्रमाण पत्र / स्कूल लीविंग / 10वीं मार्कशीट)', 'चिकित्सा प्रमाणपत्र फॉर्म 1-A (जहाँ लागू हो)', 'पासपोर्ट फ़ोटो एवं हस्ताक्षर नमूना']
            },
            {
              id: 'payment',
              title: 'भुगतान संबंधी जानकारी',
              badge: 'लेनदेन संबंधी',
              summary: 'सुविधा शुल्क निपटान हेतु ऑडिट टोकन। हम कभी भी कार्ड नंबर या नेटबैंकिंग क्रेडेंशियल स्टोर नहीं करते।',
              items: ['पेमेंट संदर्भ ऑर्डर आईडी', 'लेनदेन टाइमस्टैम्प', 'भुगतान की गई राशि', 'मास्क्ड पेमेंट मोड (UPI / नेटबैंकिंग / कार्ड टोकन)']
            }
          ]
        }
      }
    },

    // 03 Why We Collect It
    {
      key: '03-why-we-collect',
      num: '03',
      sort: 3,
      en: {
        heading: 'Why We Collect Your Information',
        subheading: 'Direct, 1-to-1 transparent mapping between each piece of collected data and its lawful operational purpose.',
        content: 'Under the DPDP Act 2023, data must only be collected for specified, explicit, and legitimate purposes. We do not engage in blanket data gathering. Each piece of information collected maps directly to a necessary step in facilitating your driving licence.',
        callout_title: 'WHY WE ASK FOR THIS: Date of Birth',
        callout_content: 'We request your date of birth only when it is needed for the selected licence service. Under Section 4 of the Motor Vehicles Act, 1988, strict statutory age minimums apply (16 years for 50cc gearless, 18 years for private cars/motorcycles, 20 years for transport/commercial).',
        structured: {
          mappings: [
            { field: 'Mobile Phone Number', purpose: 'Two-factor OTP sign-in, fraud prevention, and real-time application status alerts via SMS/WhatsApp.', basis: 'Consent & Contract' },
            { field: 'Residential Address', purpose: 'Determines local RTO jurisdiction and ensures printed Smart Card Driving Licence is mailed to your verified address.', basis: 'Statutory Obligation' },
            { field: 'Identity Proof Document', purpose: 'Prevents identity impersonation and duplicate licence fraud as mandated by state transport rules.', basis: 'Statutory Obligation' },
            { field: 'Date of Birth', purpose: 'Verifies eligibility against statutory age thresholds for the requested vehicle class.', basis: 'Statutory Obligation' },
            { field: 'Medical Certificate (Form 1-A)', purpose: 'Mandatory health & fitness verification for transport class licences and applicants over 40 years of age.', basis: 'Statutory Obligation' },
            { field: 'Payment Transaction Ref', purpose: 'Reconciliation of service facilitation fee and generation of verifiable GST receipts.', basis: 'Contractual Performance' }
          ]
        }
      },
      gu: {
        heading: 'અમે તમારી માહિતી શા માટે એકત્રિત કરીએ છીએ',
        subheading: 'એકત્રિત કરેલા દરેક ડેટા અને તેના કાયદેસરના કાર્યકારી હેતુ વચ્ચે સીધો, પારદર્શક સંબંધ.',
        content: 'ડીપીડીપી એક્ટ 2023 હેઠળ ચોક્કસ, સ્પષ્ટ અને કાયદેસરના હેતુઓ માટે જ ડેટા એકત્રિત કરી શકાય છે. અમે બિનજરૂરી માહિતી એકત્રિત કરતા નથી. એકત્રિત કરવામાં આવેલી દરેક વિગત તમારી અરજી પ્રક્રિયામાં સીધી રીતે મદદ કરે છે.',
        callout_title: 'અમે આ શા માટે માંગીએ છીએ: જન્મ તારીખ',
        callout_content: 'અમે તમારી જન્મ તારીખની વિનંતી ફક્ત ત્યારે જ કરીએ છીએ જ્યારે પસંદ કરેલી સેવા માટે તેની જરૂર હોય. મોટર વાહન અધિનિયમ, 1988 ની કલમ 4 હેઠળ કડક વૈધાનિક વય મર્યાદા લાગુ પડે છે (ગિયર વગરના વાહનો માટે 16 વર્ષ, ખાનગી કાર/બાઇક માટે 18 વર્ષ, કોમર્શિયલ માટે 20 વર્ષ).',
        structured: {
          mappings: [
            { field: 'મોબાઇલ ફોન નંબર', purpose: 'દ્વિ-પરિબળ OTP લૉગિન, છેતરપિંડી નિવારણ અને SMS/વોટ્સએપ દ્વારા વાસ્તવિક સમયના અરજી અપડેટ્સ.', basis: 'સંમતિ અને કરાર' },
            { field: 'રહેઠાણનું સરનામું', purpose: 'સ્થાનિક આરટીઓ અધિકારક્ષેત્ર નક્કી કરે છે અને સ્માર્ટ કાર્ડ લાઇસન્સ પહોંચાડવાની ખાતરી કરે છે.', basis: 'વૈધાનિક જવાબદારી' },
            { field: 'ઓળખનો પુરાવો દસ્તાવેજ', purpose: 'નકલી અરજીઓ અને ઓળખની છેતરપિંડી અટકાવવા માટે.', basis: 'વૈધાનિક જવાબદારી' },
            { field: 'જન્મ તારીખ', purpose: 'પસંદ કરેલ વાહન વર્ગ માટે કાયદાકીય વય મર્યાદાની ચકાસણી કરે છે.', basis: 'વૈધાનિક જવાબદારી' },
            { field: 'મેડિકલ સર્ટિફિકેટ (ફોર્મ 1-A)', purpose: '40 વર્ષથી વધુ ઉંમરના અરજદારો અને ટ્રાન્સપોર્ટ વાહનો માટે ફરજિયાત આરોગ્ય ચકાસણી.', basis: 'વૈધાનિક જવાબદારી' },
            { field: 'પેમેન્ટ ટ્રાન્ઝેક્શન સંદર્ભ', purpose: 'સેવા સહાયક ફીની પતાવટ અને જીએસટી પહોંચ જનરેટ કરવા માટે.', basis: 'કરાર પરિપૂર્ણતા' }
          ]
        }
      },
      hi: {
        heading: 'हम आपकी जानकारी क्यों एकत्र करते हैं',
        subheading: 'एकत्रित की गई प्रत्येक जानकारी और उसके वैध प्रयोजन के बीच पारदर्शी 1-से-1 मैपिंग।',
        content: 'डीपीडीपी अधिनियम 2023 के अंतर्गत व्यक्तिगत डेटा केवल विशिष्ट, स्पष्ट और वैध उद्देश्यों के लिए ही एकत्र किया जा सकता है। हम कोई भी अनावश्यक डेटा नहीं लेते। एकत्र की गई प्रत्येक जानकारी आपके लाइसेंस आवेदन को आगे बढ़ाने के लिए अनिवार्य कदम से जुड़ी है।',
        callout_title: 'हम यह क्यों मांगते हैं: जन्म तिथि',
        callout_content: 'हम आपकी जन्म तिथि केवल तभी मांगते हैं जब चयनित लाइसेंस सेवा हेतु इसकी आवश्यकता होती है। मोटर वाहन अधिनियम, 1988 की धारा 4 के तहत आयु सीमा तय है (50cc गियरलेस के लिए 16 वर्ष, निजी कार/बाइक के लिए 18 वर्ष, कमर्शियल के लिए 20 वर्ष)।',
        structured: {
          mappings: [
            { field: 'मोबाइल फ़ोन नंबर', purpose: 'सुरक्षित ओटीपी लॉगिन, धोखाधड़ी रोकथाम एवं वास्तविक समय में एसएमएस/व्हाट्सएप द्वारा स्थिति अलर्ट।', basis: 'सहमति एवं अनुबंध' },
            { field: 'निवास का पता', purpose: 'स्थानीय आरटीओ अधिकार क्षेत्र का निर्धारण एवं स्मार्ट कार्ड लाइसेंस की डाक डिलीवरी।', basis: 'वैधानिक अनिवार्यता' },
            { field: 'पहचान प्रमाण दस्तावेज़', purpose: 'पहचान की चोरी और डुप्लिकेट आवेदन धोखाधड़ी की रोकथाम।', basis: 'वैधानिक अनिवार्यता' },
            { field: 'जन्म तिथि', purpose: 'वाहन श्रेणी के लिए आवश्यक वैधानिक आयु सीमा का सत्यापन।', basis: 'वैधानिक अनिवार्यता' },
            { field: 'चिकित्सा प्रमाणपत्र (फॉर्म 1-A)', purpose: '40 वर्ष से अधिक उम्र के आवेदकों और व्यावसायिक श्रेणी हेतु अनिवार्य स्वास्थ्य जांच।', basis: 'वैधानिक अनिवार्यता' },
            { field: 'भुगतान लेनदेन संदर्भ', purpose: 'सुविधा शुल्क समाधान एवं जीएसटी रसीद जनरेशन।', basis: 'अनुबंध निष्पादन' }
          ]
        }
      }
    },

    // 04 How We Use Data
    {
      key: '04-how-we-use-data',
      num: '04',
      sort: 4,
      en: {
        heading: 'How We Use Your Data',
        subheading: 'Controlled operational pipelines designed to prepare, format, and audit your licence application.',
        content: 'Your personal data flows through strictly audited processing stages. It is used exclusively to facilitate your application, verify compliance with regional transport regulations, and assist you with tracking and customer support.',
        callout_title: 'No Sale or Unsolicited Commercial Communication',
        callout_content: 'We never sell, rent, monetize, or trade your personal data. We do not use your phone number or email address for unsolicited promotional telemarketing or third-party advertisements.',
        structured: {
          steps: [
            { title: 'Application Preparation', desc: 'Auto-populating official state transport forms according to Sarathi / MoRTH formatting requirements.' },
            { title: 'Document Verification', desc: 'Checking file legibility, valid expiry dates, and dimension compliance before submission.' },
            { title: 'Status Tracking & Alerts', desc: 'Sending you progress notifications regarding application milestones, slot bookings, and approval stages.' },
            { title: 'Customer Support', desc: 'Providing dedicated grievance redressal and technical assistance when you contact our help desk.' }
          ]
        }
      },
      gu: {
        heading: 'અમે તમારા ડેટાનો ઉપયોગ કેવી રીતે કરીએ છીએ',
        subheading: 'તમારી લાઇસન્સ અરજી તૈયાર કરવા, ફોર્મેટ કરવા અને ઓડિટ કરવા માટે રચાયેલ નિયંત્રિત પ્રોસેસિંગ.',
        content: 'તમારો વ્યક્તિગત ડેટા કડક ઓડિટ પ્રક્રિયાઓમાંથી પસાર થાય છે. તેનો ઉપયોગ ફક્ત તમારી અરજી તૈયાર કરવા, પ્રાદેશિક પરિવહન નિયમોનું પાલન સુનિશ્ચિત કરવા અને ગ્રાહક સહાય પૂરી પાડવા માટે જ થાય છે.',
        callout_title: 'ડેટા વેચાણ કે અનિચ્છનીય માર્કેટિંગ પર સંપૂર્ણ પ્રતિબંધ',
        callout_content: 'અમે તમારો ડેટા ક્યારેય વેચતા, ભાડે આપતા કે વ્યાપારી લાભ માટે વાપરતા નથી. અમે તમારા નંબર કે ઇમેઇલનો ઉપયોગ પ્રમોશનલ કોલ્સ કે જાહેરાતો માટે ક્યારેય કરતા નથી.',
        structured: {
          steps: [
            { title: 'અરજીની તૈયારી', desc: 'રાજ્ય પરિવહન નિયમો મુજબ સત્તાવાર ફોર્મ્સમાં માહિતી યોગ્ય રીતે ભરવી.' },
            { title: 'દસ્તાવેજ ચકાસણી', desc: 'સબમિશન પહેલાં ફાઇલો સ્પષ્ટ અને માન્ય છે કે નહીં તેની ચકાસણી.' },
            { title: 'સ્ટેટસ ટ્રેકિંગ અને ચેતવણીઓ', desc: 'તબક્કાવાર પ્રગતિ, સ્લોટ બુકિંગ અને મંજૂરી અંગેના મેસેજ મોકલવા.' },
            { title: 'ગ્રાહક સહાય', desc: 'જ્યારે તમે સહાય ડેસ્કનો સંપર્ક કરો ત્યારે ફરિયાદોનું નિવારણ અને સહાય કરવી.' }
          ]
        }
      },
      hi: {
        heading: 'हम आपके डेटा का उपयोग कैसे करते हैं',
        subheading: 'आपके लाइसेंस आवेदन को तैयार करने, प्रारूपित करने और ऑडिट करने हेतु नियंत्रित परिचालन प्रक्रिया।',
        content: 'आपका व्यक्तिगत डेटा कड़े ऑडिट चरणों से होकर गुजरता है। इसका उपयोग विशेष रूप से आपके आवेदन को तैयार करने, क्षेत्रीय परिवहन नियमों के अनुपालन की पुष्टि करने और सहायता प्रदान करने हेतु किया जाता है।',
        callout_title: 'डेटा बिक्री या अवांछित मार्केटिंग पर पूर्ण प्रतिबंध',
        callout_content: 'हम आपके व्यक्तिगत डेटा को कभी भी बेचते, किराए पर नहीं देते या मुद्रीकृत नहीं करते। हम आपके फ़ोन नंबर या ईमेल का उपयोग अनचाहे टेलीमार्केटिंग या विज्ञापनों के लिए नहीं करते हैं।',
        structured: {
          steps: [
            { title: 'आवेदन निर्माण', desc: 'सारथी / MoRTH प्रारूप आवश्यकताओं के अनुसार आधिकारिक फॉर्म तैयार करना।' },
            { title: 'दस्तावेज़ पूर्व-सत्यापन', desc: 'सबमिशन से पहले अपलोड की गई फ़ाइलों की स्पष्टता और वैधता की जांच।' },
            { title: 'स्टेटस ट्रैकिंग और सूचनाएं', desc: 'आवेदन प्रगति, स्लॉट बुकिंग और अनुमोदन चरणों से संबंधित अलर्ट प्रेषित करना।' },
            { title: 'ग्राहक सहायता', desc: 'हेल्पडेस्क से संपर्क करने पर त्वरित शिकायत निवारण एवं तकनीकी मार्गदर्शन प्रदान करना।' }
          ]
        }
      }
    },

    // 05 Sharing & Processors
    {
      key: '05-sharing-processors',
      num: '05',
      sort: 5,
      en: {
        heading: 'Authorized Sharing & Data Processors',
        subheading: 'Transparent, end-to-end disclosure of third-party processors bound by strict Data Protection Agreements.',
        content: 'We share personal data exclusively with vetted Data Processors who perform essential technical, telecommunication, and payment tasks necessary to fulfill our citizen service. Every processor operates under strict contractual DPDP obligations.',
        callout_title: 'Contractual Safeguards',
        callout_content: 'All processors are contractually bound under DPDP Act Section 8(2) to process personal data strictly upon our documented instructions, maintain bank-grade security controls, and purge records upon contract termination.',
        structured: {
          flow: ['You (Data Principal)', 'Driving License Form (Data Fiduciary)', 'Authorized Service Processors', 'State RTO Workflow (Upon Submission)'],
          processors: [
            { service: 'Razorpay / Billdesk', role: 'Payment Gateway', purpose: 'Payment collection and RBI-compliant tokenization for facilitation fees', data: 'Order ID, Transaction Amount, Masked Mode', location: 'India (RBI Compliant)' },
            { service: 'Twilio / Gupshup', role: 'SMS & Messaging Gateway', purpose: 'Dispatching one-time passwords (OTPs) and critical application alerts', data: 'Recipient Mobile Number, SMS Content', location: 'India (TRAI Registered)' },
            { service: 'AWS India (MeitY Empaneled)', role: 'Secure Cloud Infrastructure', purpose: 'Encrypted database hosting and AES-256 secure document storage', data: 'Encrypted Application Dossiers, Scans', location: 'Mumbai / Hyderabad, India' },
            { service: 'Regional Transport Offices (RTO)', role: 'Government Transport Authority', purpose: 'Official processing and issuance of Learner/Permanent Driving Licences', data: 'Complete Verified Application Dossier', location: 'Respective State Government' }
          ]
        }
      },
      gu: {
        heading: 'અધિકૃત શેરિંગ અને ડેટા પ્રોસેસર્સ',
        subheading: 'કડક ડેટા પ્રોટેક્શન કરારો દ્વારા બંધાયેલા થર્ડ-પાર્ટી પ્રોસેસર્સનું પારદર્શક ડિસ્ક્લોઝર.',
        content: 'અમે ફક્ત ચકાસાયેલ ડેટા પ્રોસેસર્સ સાથે જ વ્યક્તિગત ડેટા શેર કરીએ છીએ જે અમારી સેવા પૂર્ણ કરવા માટે આવશ્યક ટેકનિકલ, ટેલિકોમ્યુનિકેશન અને ચુકવણી કાર્યો કરે છે. દરેક પ્રોસેસર ડીપીડીપી જવાબદારીઓ હેઠળ કાર્ય કરે છે.',
        callout_title: 'કરારબદ્ધ સુરક્ષા પગલાં',
        callout_content: 'ડીપીડીપી એક્ટની કલમ 8(2) હેઠળ તમામ પ્રોસેસર્સ ફક્ત અમારી લેખિત સૂચનાઓ પર જ કાર્ય કરવા, બેંક-ગ્રેડ સુરક્ષા જાળવવા અને કરાર સમાપ્ત થતાં ડેટા ભૂંસી નાખવા માટે બંધાયેલા છે.',
        structured: {
          flow: ['તમે (ડેટા પ્રિન્સિપલ)', 'ડ્રાઇવિંગ લાઇસન્સ ફોર્મ (ડેટા ફિડ્યુશિયરી)', 'અધિકૃત સેવા પ્રોસેસર્સ', 'રાજ્ય આરટીઓ કાર્યપ્રણાલી'],
          processors: [
            { service: 'રેઝરપે / બિલડેસ્ક', role: 'પેમેન્ટ ગેટવે', purpose: 'સહાયક ફી માટે આરબીઆઇ સુસંગત સુરક્ષિત ચુકવણી પ્રક્રિયા', data: 'ઓર્ડર આઈડી, રકમ, માસ્ક્ડ પેમેન્ટ મોડ', location: 'ભારત (RBI સુસંગત)' },
            { service: 'ટ્વિલિયો / ગપશપ', role: 'એસએમએસ ગેટવે', purpose: 'વન-ટાઇમ પાસવર્ડ (OTP) અને અરજી અપડેટ્સ મોકલવા', data: 'મોબાઇલ નંબર, એસએમએસ લખાણ', location: 'ભારત (TRAI રજિસ્ટર્ડ)' },
            { service: 'AWS ઇન્ડિયા (MeitY માન્ય)', role: 'સુરક્ષિત ક્લાઉડ સ્ટોરેજ', purpose: 'AES-256 એન્ક્રિપ્ટેડ ડેટાબેઝ અને દસ્તાવેજ સંગ્રહ', data: 'એન્ક્રિપ્ટેડ અરજી ફાઇલો અને સ્કેન', location: 'મુંબઈ / હૈદરાબાદ, ભારત' },
            { service: 'પ્રાદેશિક પરિવહન કચેરીઓ (RTO)', role: 'સરકારી પરિવહન સત્તામંડળ', purpose: 'ડ્રાઇવિંગ લાઇસન્સની સત્તાવાર પ્રક્રિયા અને ઇશ્યૂ', data: 'સંપૂર્ણ ચકાસાયેલ અરજી ફાઇલ', location: 'સંબંધિત રાજ્ય સરકાર' }
          ]
        }
      },
      hi: {
        heading: 'अधिकृत साझाकरण एवं डेटा प्रोसेसर',
        subheading: 'कड़े डेटा संरक्षण समझौतों से बंधे तीसरे पक्ष के अधिकृत प्रोसेसरों का पारदर्शी प्रकटीकरण।',
        content: 'हम व्यक्तिगत डेटा केवल उन्हीं अधिकृत डेटा प्रोसेसरों के साथ साझा करते हैं जो हमारी नागरिक सेवा को पूरा करने हेतु आवश्यक तकनीकी, दूरसंचार और भुगतान कार्य निष्पादित करते हैं। सभी प्रोसेसर कड़े DPDP नियमों के अधीन हैं।',
        callout_title: 'संविदात्मक सुरक्षा उपाय',
        callout_content: 'सभी प्रोसेसर DPDP अधिनियम की धारा 8(2) के तहत केवल हमारे लिखित निर्देशों पर कार्य करने, बैंक-स्तरीय सुरक्षा बनाए रखने और अनुबंध समाप्त होने पर डेटा नष्ट करने के लिए बाध्य हैं।',
        structured: {
          flow: ['आप (डेटा प्रिंसिपल)', 'ड्राइविंग लाइसेंस फॉर्म (डेटा फिड्यूशरी)', 'अधिकृत सेवा प्रोसेसर', 'राज्य आरटीओ कार्यप्रणाली'],
          processors: [
            { service: 'रेज़रपे / बिलडेस्क', role: 'पेमेंट गेटवे', purpose: 'सुविधा शुल्क हेतु आरबीआई-अनुपालन सुरक्षित भुगतान प्रसंस्करण', data: 'ऑर्डर आईडी, भुगतान राशि, मास्क्ड मोड', location: 'भारत (RBI अनुपालन)' },
            { service: 'ट्विलियो / गपशप', role: 'एसएमएस व संदेश गेटवे', purpose: 'वन-टाइम पासवर्ड (OTP) एवं महत्वपूर्ण आवेदन स्थिति प्रेषण', data: 'मोबाइल नंबर, एसएमएस संदेश', location: 'भारत (TRAI पंजीकृत)' },
            { service: 'AWS इंडिया (MeitY सूचीबद्ध)', role: 'सुरक्षित क्लाउड इन्फ्रास्ट्रक्चर', purpose: 'AES-256 एन्क्रिप्टेड डेटाबेस होस्टिंग एवं दस्तावेज़ भंडारण', data: 'एन्क्रिप्टेड आवेदन एवं स्कैन दस्तावेज़', location: 'मुंबई / हैदराबाद, भारत' },
            { service: 'क्षेत्रीय परिवहन कार्यालय (RTO)', role: 'सरकारी परिवहन प्राधिकरण', purpose: 'लाइसेंस का आधिकारिक परीक्षण, प्रसंस्करण एवं निर्गमन', data: 'पूर्ण सत्यापित आवेदन डॉसियर', location: 'संबंधित राज्य सरकार' }
          ]
        }
      }
    },

    // 06 Data Security
    {
      key: '06-data-security',
      num: '06',
      sort: 6,
      en: {
        heading: 'How We Protect Your Information',
        subheading: 'Bank-grade technical safeguards, field-level encryption, and strict organizational security controls.',
        content: 'We employ multi-layered technological and administrative safeguards to protect your personal data against unauthorized access, alteration, disclosure, accidental loss, or destruction.',
        callout_title: '72-Hour Breach Notification Commitment',
        callout_content: 'In compliance with Section 8(6) of the DPDP Act 2023, in the unlikely event of a personal data breach affecting your records, we will notify the Data Protection Board of India and impacted users within 72 hours.',
        structured: {
          securityCards: [
            { icon: '🔒', title: 'Encrypted Connections', desc: 'All data transmitted between your browser and our servers is secured with TLS 1.3 encryption and mandatory HTTP Strict Transport Security (HSTS).' },
            { icon: '🛡️', title: 'Secure Encrypted Storage', desc: 'Sensitive fields, identity credentials, and uploaded document scans are encrypted at rest using industry-standard AES-256 cryptographic standards.' },
            { icon: '👥', title: 'Role-Based Access Controls', desc: 'Internal access to citizen records is strictly limited to authorized operators handling your specific application, reinforced with mandatory two-factor authentication.' },
            { icon: '📋', title: 'Activity Monitoring & Audit', desc: 'Every data access, modification, and document inspection is recorded in tamper-evident audit logs maintained for statutory compliance.' }
          ]
        }
      },
      gu: {
        heading: 'અમે તમારી માહિતીનું રક્ષણ કેવી રીતે કરીએ છીએ',
        subheading: 'બેંક-ગ્રેડ ટેકનિકલ સુરક્ષા, ફિલ્ડ-લેવલ એન્ક્રિપ્શન અને કડક સંસ્થાકીય નિયંત્રણો.',
        content: 'અમે અનધિકૃત ઍક્સેસ, ફેરફાર, પ્રકટીકરણ અથવા ડેટાના નુકસાન સામે તમારા વ્યક્તિગત ડેટાનું રક્ષણ કરવા માટે બહુસ્તરીય તકનીકી અને વહીવટી સુરક્ષા પગલાં લઈએ છીએ.',
        callout_title: '72-કલાકની ઉલ્લંઘન સૂચના પ્રતિબદ્ધતા',
        callout_content: 'ડીપીડીપી એક્ટની કલમ 8(6) મુજબ, જો કોઈ અણધારી ડેટા ભંગની ઘટના બને તો અમે 72 કલાકની અંદર ડેટા પ્રોટેક્શન બોર્ડ અને અસરગ્રસ્ત વપરાશકર્તાઓને સૂચિત કરીશું.',
        structured: {
          securityCards: [
            { icon: '🔒', title: 'એન્ક્રિપ્ટેડ કનેક્શન્સ', desc: 'તમારા બ્રાઉઝર અને સર્વર વચ્ચેનો તમામ ડેટા TLS 1.3 એન્ક્રિપ્શન અને કડક HSTS દ્વારા સુરક્ષિત છે.' },
            { icon: '🛡️', title: 'સુરક્ષિત એન્ક્રિપ્ટેડ સંગ્રહ', desc: 'સંવેદનશીલ માહિતી અને દસ્તાવેજો ઉદ્યોગ-માનક AES-256 એન્ક્રિપ્શન સાથે સાચવવામાં આવે છે.' },
            { icon: '👥', title: 'ભૂમિકા-આધારિત ઍક્સેસ નિયંત્રણ', desc: 'તમારી અરજી સંભાળતા અધિકૃત ઓપરેટરો સુધી જ ઍક્સેસ મર્યાદિત છે, જેને 2FA દ્વારા સુરક્ષિત કરાયેલ છે.' },
            { icon: '📋', title: 'પ્રવૃત્તિ નિરીક્ષણ અને ઓડિટ', desc: 'દરેક ડેટા ઍક્સેસ અને ફેરફાર ટેમ્પર-એવિડન્ટ ઓડિટ લૉગ્સમાં કાયમી ધોરણે રેકોર્ડ થાય છે.' }
          ]
        }
      },
      hi: {
        heading: 'हम आपकी जानकारी की सुरक्षा कैसे करते हैं',
        subheading: 'बैंक-स्तरीय तकनीकी सुरक्षा, फील्ड-स्तरीय एन्क्रिप्शन और सख्त संगठनात्मक नियंत्रण।',
        content: 'हम आपके व्यक्तिगत डेटा को अनधिकृत पहुंच, परिवर्तन, प्रकटीकरण या हानि से सुरक्षित रखने के लिए बहुस्तरीय तकनीकी और प्रशासनिक सुरक्षा उपायों का उपयोग करते हैं।',
        callout_title: '72-घंटे में उल्लंघन सूचना की वैधानिक प्रतिबद्धता',
        callout_content: 'DPDP अधिनियम 2023 की धारा 8(6) के अनुपालन में, किसी भी डेटा उल्लंघन की स्थिति में हम 72 घंटे के भीतर भारतीय डेटा संरक्षण बोर्ड और प्रभावित नागरिकों को सूचित करेंगे।',
        structured: {
          securityCards: [
            { icon: '🔒', title: 'एन्क्रिप्टेड कनेक्शन', desc: 'आपके ब्राउज़र और हमारे सर्वर के बीच सभी संचार TLS 1.3 एन्क्रिप्शन और HSTS द्वारा सुरक्षित हैं।' },
            { icon: '🛡️', title: 'सुरक्षित एन्क्रिप्टेड स्टोरेज', desc: 'संवेदनशील विवरण और अपलोड किए गए दस्तावेज़ AES-256 क्रिप्टोग्राफिक मानकों के साथ एन्क्रिप्ट किए जाते हैं।' },
            { icon: '👥', title: 'भूमिका-आधारित पहुंच नियंत्रण', desc: 'नागरिक रिकॉर्ड तक पहुंच केवल अधिकृत ऑपरेटरों तक सीमित है, जो अनिवार्य दो-चरणीय प्रमाणीकरण से सुरक्षित है।' },
            { icon: '📋', title: 'गतिविधि निगरानी एवं ऑडिट', desc: 'प्रत्येक डेटा पहुंच और संपादन को टैम्पर-एविडेंट ऑडिट लॉग में विधिवत दर्ज किया जाता है।' }
          ]
        }
      }
    },

    // 07 Data Retention
    {
      key: '07-data-retention',
      num: '07',
      sort: 7,
      en: {
        heading: 'How Long We Keep Your Information',
        subheading: 'Strict lifecycle data retention rules anchored in statutory motor vehicles and tax regulations.',
        content: 'We preserve personal data only for as long as necessary to satisfy the purpose for which it was collected, resolve disputes, comply with state transport licensing audits, and meet statutory tax requirements.',
        callout_title: 'Automatic Document Scan Purging',
        callout_content: 'High-resolution uploaded document scans (Aadhaar, utility bills, age proofs) are automatically purged from our servers 30 days after your RTO application status reaches terminal completion.',
        structured: {
          lifecycle: [
            { step: '1. Collected', desc: 'Data ingested with consent solely for application filing.' },
            { step: '2. Used for Purpose', desc: 'Dossier compiled, verified, and submitted to the designated RTO.' },
            { step: '3. Retained when Necessary', desc: 'Financial receipts and application logs held for statutory audit periods.' },
            { step: '4. Deleted / Anonymized', desc: 'Purged permanently or irreversibly anonymized when retention rules expire.' }
          ],
          schedule: [
            { category: 'Completed Application Logs', period: '7 Years', reason: 'Motor Vehicles Rules audit and consumer facilitation records' },
            { category: 'Uploaded Document Scans', period: '30 Days post-completion', reason: 'Verification complete; purged automatically to minimize data holding' },
            { category: 'Payment & Financial Receipts', period: '7 Years', reason: 'Mandatory Goods and Services Tax (GST) and accounting compliance' },
            { category: 'Authentication & Session Logs', period: '180 Days', reason: 'Cybersecurity incident investigation and rate-limiting' },
            { category: 'Marketing & Optional Consents', period: 'Until Withdrawn', reason: 'Subject to your continuous voluntary consent' }
          ]
        }
      },
      gu: {
        heading: 'અમે તમારી માહિતી કેટલા સમય સુધી રાખીએ છીએ',
        subheading: 'મોટર વાહન અને કરવેરા નિયમો પર આધારિત કડક ડેટા જાળવણી નીતિ.',
        content: 'અમે વ્યક્તિગત ડેટા ફક્ત તે હેતુ પૂરો કરવા, વિવાદો ઉકેલવા, પરિવહન ઓડિટ અને કરવેરાના નિયમોનું પાલન કરવા માટે જરૂરી હોય તેટલા સમય માટે જ સાચવીએ છીએ.',
        callout_title: 'દસ્તાવેજ સ્કેનનું આપમેળે નિકાલ',
        callout_content: 'તમારી આરટીઓ અરજી પૂર્ણ થયાના 30 દિવસ પછી અપલોડ કરેલા દસ્તાવેજોના સ્કેન અમારા સર્વર પરથી આપમેળે સુરક્ષિત રીતે દૂર કરવામાં આવે છે.',
        structured: {
          lifecycle: [
            { step: '1. એકત્રિત', desc: 'અરજી ફાઇલિંગ માટે સંમતિ સાથે ડેટા મેળવવામાં આવે છે.' },
            { step: '2. હેતુ માટે ઉપયોગ', desc: 'ફાઇલ તૈયાર કરી નિયુક્ત આરટીઓ કચેરીમાં સબમિટ થાય છે.' },
            { step: '3. જરૂરી હોય ત્યાં સંગ્રહ', desc: 'ઓડિટ અને કરવેરાના કાયદા હેઠળ રેકોર્ડ્સ સાચવવામાં આવે છે.' },
            { step: '4. ડિલીટ / અનામીકરણ', desc: 'સમયગાળો પૂર્ણ થતાં ડેટા કાયમી રૂપે ડિલીટ કરવામાં આવે છે.' }
          ],
          schedule: [
            { category: 'પૂર્ણ થયેલ અરજી લોગ્સ', period: '7 વર્ષ', reason: 'મોટર વાહન નિયમો અને ગ્રાહક સેવા ઓડિટ રેકોર્ડ્સ' },
            { category: 'અપલોડ કરેલા દસ્તાવેજ સ્કેન', period: 'પૂર્ણ થયાના 30 દિવસ', reason: 'ચકાસણી પૂર્ણ; બિનજરૂરી સંગ્રહ રોકવા આપમેળે નાશ' },
            { category: 'ચુકવણી અને નાણાકીય પહોંચ', period: '7 વર્ષ', reason: 'GST અને વૈધાનિક હિસાબી નિયમોનું પાલન' },
            { category: 'સુરક્ષા અને સત્ર લોગ્સ', period: '180 દિવસ', reason: 'સાયબર સુરક્ષા તપાસ અને સિસ્ટમ સુરક્ષા' },
            { category: 'વૈકલ્પિક સંમતિ રેકોર્ડ્સ', period: 'પાછી ખેંચાય ત્યાં સુધી', reason: 'તમારી સ્વૈચ્છિક સંમતિને આધીન' }
          ]
        }
      },
      hi: {
        heading: 'हम आपकी जानकारी कितने समय तक रखते हैं',
        subheading: 'मोटर वाहन एवं वित्तीय कानूनों पर आधारित सख्त डेटा अवधारण (Retention) नियम।',
        content: 'हम व्यक्तिगत डेटा केवल उसी अवधि तक सुरक्षित रखते हैं जब तक कि वह आवेदन के उद्देश्य, कानूनी विवादों के समाधान, और वैधानिक कर नियमों के अनुपालन हेतु आवश्यक हो।',
        callout_title: 'दस्तावेज़ स्कैन का स्वचालित निष्कासन',
        callout_content: 'आवेदन प्रक्रिया पूर्ण होने के 30 दिनों के भीतर अपलोड किए गए दस्तावेज़ स्कैन (आधार, आयु प्रमाण आदि) हमारे सर्वर से स्वचालित रूप से हटा दिए जाते हैं।',
        structured: {
          lifecycle: [
            { step: '1. एकत्रिकरण', desc: 'सहमति के साथ केवल आवेदन प्रक्रिया हेतु डेटा ग्रहण करना।' },
            { step: '2. प्रयोजन हेतु उपयोग', desc: 'दस्तावेज़ तैयार कर आरटीओ कार्यालय में प्रस्तुत करना।' },
            { step: '3. वैधानिक अवधारण', desc: 'कानूनी ऑडिट आवश्यकताओं हेतु निर्धारित अवधि तक रिकॉर्ड रखना।' },
            { step: '4. सुरक्षित विलोपन', desc: 'अवधि समाप्त होने पर डेटा का अपरिवर्तनीय निष्कासन या अनामीकरण।' }
          ],
          schedule: [
            { category: 'पूर्ण आवेदन रिकॉर्ड', period: '7 वर्ष', reason: 'मोटर वाहन नियम एवं उपभोक्ता सुविधा ऑडिट' },
            { category: 'अपलोड किए गए दस्तावेज़', period: 'प्रक्रिया पूर्ण होने के 30 दिन', reason: 'सत्यापन पूर्ण होने के बाद डेटा का न्यूनतमकरण' },
            { category: 'भुगतान एवं वित्तीय रसीदें', period: '7 वर्ष', reason: 'जीएसटी एवं वैधानिक लेखा अनुपालन' },
            { category: 'सुरक्षा एवं सत्र लॉग', period: '180 दिन', reason: 'साइबर सुरक्षा जांच और दर-नियंत्रण' },
            { category: 'वैकल्पिक सहमति रिकॉर्ड', period: 'वापस लेने तक', reason: 'आपकी स्वैच्छिक सहमति पर निर्भर' }
          ]
        }
      }
    },

    // 08 Your Rights
    {
      key: '08-your-rights',
      num: '08',
      sort: 8,
      en: {
        heading: 'Your Statutory Privacy Rights',
        subheading: 'Direct, actionable legal rights guaranteed under Chapter III of the Digital Personal Data Protection Act, 2023.',
        content: 'As a Data Principal, you possess statutory rights enforceable against our platform. You do not need to navigate complex legal hurdles to exercise them; simply access our self-service Citizen Privacy Center.',
        callout_title: 'No Fee for Exercising Rights',
        callout_content: 'Exercising your privacy rights under the DPDP Act is completely free of charge. We respond to all verified statutory rights requests within statutory timelines.',
        structured: {
          rights: [
            { id: 'access', title: 'Right to Access', desc: 'View a complete summary of your personal data held by us, identities of processors shared with, and past processing activities.', href: '/account/privacy', icon: '👤' },
            { id: 'correct', title: 'Right to Correction & Updating', desc: 'Request immediate correction of inaccurate, misleading, or outdated personal information in your profile and pending applications.', href: '/account/privacy/data', icon: '✏️' },
            { id: 'erase', title: 'Right to Erasure & Anonymization', desc: 'Request permanent deletion of personal records and accounts, subject to statutory retention checks and absence of legal holds.', href: '/account/privacy/data', icon: '🗑️' },
            { id: 'withdraw', title: 'Right to Withdraw Consent', desc: 'Easily withdraw consent for non-statutory processing and communications with the same ease with which consent was granted.', href: '/account/privacy/consent', icon: '↩️' },
            { id: 'grievance', title: 'Right of Grievance Redressal', desc: 'Lodge a formal privacy complaint directly with our Data Protection Officer, with statutory 24-hour acknowledgment.', href: '/account/privacy/grievances', icon: '⚖️' },
            { id: 'nominate', title: 'Right to Nominate', desc: 'Designate a trusted individual who may exercise your privacy rights on your behalf in the event of death or incapacity.', href: '/account/privacy/nomination', icon: '🤝' }
          ]
        }
      },
      gu: {
        heading: 'તમારા વૈધાનિક ગોપનીયતા અધિકારો',
        subheading: 'ડિજિટલ પર્સનલ ડેટા પ્રોટેક્શન એક્ટ, 2023 ના પ્રકરણ III હેઠળ બાંયધરી આપવામાં આવેલા અધિકારો.',
        content: 'ડેટા પ્રિન્સિપલ તરીકે તમને કાયદા હેઠળ સુરક્ષિત અધિકારો પ્રાપ્ત છે. આ અધિકારોનો ઉપયોગ કરવા માટે કોઈ જટિલ કાનૂની પ્રક્રિયાની જરૂર નથી; તમે સીધા અમારા સિટીઝન પ્રાઇવસી સેન્ટરમાં જઈને નિયંત્રણ કરી શકો છો.',
        callout_title: 'અધિકારોના ઉપયોગ માટે કોઈ ફી નથી',
        callout_content: 'ડીપીડીપી કાયદા હેઠળ તમારા ગોપનીયતા અધિકારોનો ઉપયોગ સંપૂર્ણપણે મફત છે. અમે તમામ ચકાસાયેલી વિનંતીઓનો નિર્ધારિત સમયમાં જવાબ આપીએ છીએ.',
        structured: {
          rights: [
            { id: 'access', title: 'માહિતી મેળવવાનો અધિકાર (Access)', desc: 'તમારા વિશે સંગ્રહિત વ્યક્તિગત માહિતીનો સંપૂર્ણ સારાંશ અને પ્રોસેસિંગની વિગતો જુઓ.', href: '/account/privacy', icon: '👤' },
            { id: 'correct', title: 'સુધારણાનો અધિકાર (Correction)', desc: 'તમારી પ્રોફાઇલ અથવા અરજીમાં ખોટી, અપૂર્ણ કે જૂની માહિતી સુધારવાની વિનંતી કરો.', href: '/account/privacy/data', icon: '✏️' },
            { id: 'erase', title: 'ડેટા ડિલીટ કરવાનો અધિકાર (Erasure)', desc: 'કાયદાકીય જાળવણી તપાસને આધીન તમારો ડેટા કાયમી રૂપે ડિલીટ કરવાની વિનંતી કરો.', href: '/account/privacy/data', icon: '🗑️' },
            { id: 'withdraw', title: 'સંમતિ પાછી ખેંચવાનો અધિકાર (Withdraw)', desc: 'વૈકલ્પિક સેવાઓ માટે આપેલી સંમતિ કોઈપણ સમયે સરળતાથી પાછી ખેંચો.', href: '/account/privacy/consent', icon: '↩️' },
            { id: 'grievance', title: 'ફરિયાદ નિવારણનો અધિકાર (Grievance)', desc: 'અમારા ડેટા પ્રોટેક્શન ઓફિસર સમક્ષ સીધી ફરિયાદ નોંધાવો.', href: '/account/privacy/grievances', icon: '⚖️' },
            { id: 'nominate', title: 'વારસદાર નીમવાનો અધિકાર (Nominate)', desc: 'અવસાન કે અસમર્થતાના સંજોગોમાં તમારા અધિકારોનો ઉપયોગ કરવા વારસદાર નીમો.', href: '/account/privacy/nomination', icon: '🤝' }
          ]
        }
      },
      hi: {
        heading: 'आपके वैधानिक गोपनीयता अधिकार',
        subheading: 'डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट, 2023 के अध्याय III के तहत प्रत्याभूत प्रत्यक्ष कानूनी अधिकार।',
        content: 'डेटा प्रिंसिपल के रूप में आपके पास कानूनी रूप से प्रवर्तनीय अधिकार हैं। इनका उपयोग करने के लिए आपको किसी जटिल प्रक्रिया से नहीं गुजरना पड़ता; सीधे हमारे नागरिक गोपनीयता केंद्र (Privacy Center) से इनका प्रयोग करें।',
        callout_title: 'अधिकारों के प्रयोग हेतु कोई शुल्क नहीं',
        callout_content: 'DPDP अधिनियम के तहत अपने अधिकारों का उपयोग करना पूरी तरह से निःशुल्क है। हम निर्धारित समय सीमा के भीतर सभी सत्यापित अनुरोधों का समाधान करते हैं।',
        structured: {
          rights: [
            { id: 'access', title: 'पहुंच का अधिकार (Access)', desc: 'हमारे पास संग्रहीत अपने व्यक्तिगत डेटा का संपूर्ण विवरण और साझाकरण की जानकारी देखें।', href: '/account/privacy', icon: '👤' },
            { id: 'correct', title: 'सुधार का अधिकार (Correction)', desc: 'अपनी प्रोफ़ाइल या लंबित आवेदन में गलत अथवा पुरानी जानकारी में सुधार का अनुरोध करें।', href: '/account/privacy/data', icon: '✏️' },
            { id: 'erase', title: 'डेटा विलोपन का अधिकार (Erasure)', desc: 'कानूनी अवधारण सीमाओं को ध्यान में रखते हुए अपने डेटा को हटाने का अनुरोध करें।', href: '/account/privacy/data', icon: '🗑️' },
            { id: 'withdraw', title: 'सहमति वापस लेने का अधिकार (Withdraw)', desc: 'वैकल्पिक उद्देश्यों हेतु दी गई सहमति को किसी भी समय आसानी से वापस लें।', href: '/account/privacy/consent', icon: '↩️' },
            { id: 'grievance', title: 'शिकायत निवारण का अधिकार (Grievance)', desc: 'डेटा संरक्षण अधिकारी (DPO) के समक्ष सीधे औपचारिक शिकायत दर्ज करें।', href: '/account/privacy/grievances', icon: '⚖️' },
            { id: 'nominate', title: 'नामांकन का अधिकार (Nominate)', desc: 'मृत्यु या असमर्थता की स्थिति में अधिकारों के प्रयोग हेतु किसी व्यक्ति को नामांकित करें।', href: '/account/privacy/nomination', icon: '🤝' }
          ]
        }
      }
    },

    // 09 Children & Guardians
    {
      key: '09-children-guardians',
      num: '09',
      sort: 9,
      en: {
        heading: 'Children & Guardian Information',
        subheading: 'Statutory protections under Section 9 of the DPDP Act 2023 for applicants aged 16 to 18 years.',
        content: 'Under Indian Motor Vehicles law, adolescents aged 16 to 18 are eligible to apply for a Learner Licence for motor cycles without gear (engine capacity up to 50cc). In full compliance with Section 9 of the DPDP Act, 2023, the processing of any minor applicant\'s personal data requires verifiable consent from their lawful parent or legal guardian.',
        callout_title: 'Absolute Ban on Profiling & Targeted Ads',
        callout_content: 'We never engage in behavioral tracking, psychological profiling, algorithmic surveillance, or targeted commercial advertising directed towards minor applicants.',
        structured: {
          flow: ['Parent / Lawful Guardian', 'Guardian Identity & Relationship Verification', 'Verifiable Written Consent', 'Minor Licence Application Processing'],
          prohibitions: [
            'No tracking or behavioral monitoring of minor users',
            'No targeted advertisements or promotional messaging',
            'No automated decision-making that adversely impacts the minor',
            'Mandatory guardian identity verification prior to application processing'
          ]
        }
      },
      gu: {
        heading: 'બાળકો અને વાલીની માહિતી',
        subheading: '16 થી 18 વર્ષના અરજદારો માટે ડીપીડીપી એક્ટ 2023 ની કલમ 9 હેઠળ વૈધાનિક સુરક્ષા.',
        content: 'ભારતીય મોટર વાહન કાયદા હેઠળ 16 થી 18 વર્ષના કિશોરો ગિયર વગરના વાહનો (50cc સુધી) માટે લર્નર લાઇસન્સ મેળવી શકે છે. ડીપીડીપી એક્ટની કલમ 9 મુજબ કોઈપણ સગીર અરજદારના ડેટા પર પ્રક્રિયા કરવા માટે તેમના માતાપિતા અથવા કાનૂની વાલીની ચકાસાયેલી સંમતિ ફરજિયાત છે.',
        callout_title: 'પ્રોફાઇલિંગ અને ટાર્ગેટેડ જાહેરાતો પર સંપૂર્ણ પ્રતિબંધ',
        callout_content: 'અમે સગીર અરજદારોનું ક્યારેય બિહેવિયરલ ટ્રેકિંગ, પ્રોફાઇલિંગ કે તેમને લક્ષિત કરતી વ્યાપારી જાહેરાતો કરતા નથી.',
        structured: {
          flow: ['માતાપિતા / કાનૂની વાલી', 'વાલીની ઓળખ અને સંબંધની ચકાસણી', 'ચકાસાયેલ લેખિત સંમતિ', 'સગીર લાઇસન્સ અરજી પ્રક્રિયા'],
          prohibitions: [
            'સગીર વપરાશકર્તાઓનું કોઈ બિહેવિયરલ ટ્રેકિંગ નહીં',
            'કોઈ ટાર્ગેટેડ જાહેરાતો કે પ્રમોશનલ મેસેજ નહીં',
            'સગીરના હિતને નુકસાન પહોંચાડતો કોઈ સ્વચાલિત નિર્ણય નહીં',
            'અરજી આગળ વધારતા પહેલા વાલીની ઓળખની ફરજિયાત ચકાસણી'
          ]
        }
      },
      hi: {
        heading: 'बच्चे एवं अभिभावक संबंधी जानकारी',
        subheading: '16 से 18 वर्ष के आवेदकों हेतु DPDP अधिनियम 2023 की धारा 9 के तहत वैधानिक सुरक्षा।',
        content: 'भारतीय मोटर वाहन कानून के तहत 16 से 18 वर्ष के किशोर 50cc तक के गैर-गियर वाहनों के लिए लर्नर लाइसेंस हेतु आवेदन कर सकते हैं। DPDP अधिनियम की धारा 9 के अनुपालन में, किसी भी नाबालिग के डेटा की प्रोसेसिंग हेतु माता-पिता या कानूनी अभिभावक की सत्यापित सहमति अनिवार्य है।',
        callout_title: 'प्रोफ़ाइलिंग एवं लक्षित विज्ञापनों पर पूर्ण रोक',
        callout_content: 'हम नाबालिग आवेदकों के व्यवहार की ट्रैकिंग, मनोवैज्ञानिक प्रोफ़ाइलिंग या उनके प्रति लक्षित विज्ञापनों में कभी भी संलग्न नहीं होते हैं।',
        structured: {
          flow: ['माता-पिता / वैध अभिभावक', 'अभिभावक पहचान एवं संबंध सत्यापन', 'सत्यापनीय सहमति', 'नाबालिग लाइसेंस आवेदन प्रक्रिया'],
          prohibitions: [
            'नाबालिग उपयोगकर्ताओं की कोई ट्रैकिंग या व्यवहार निगरानी नहीं',
            'कोई लक्षित विज्ञापन या प्रचार संदेश नहीं',
            'नाबालिग को प्रभावित करने वाला कोई स्वचालित निर्णय नहीं',
            'आवेदन से पूर्व अभिभावक की पहचान का अनिवार्य सत्यापन'
          ]
        }
      }
    },

    // 10 Cookies & Analytics
    {
      key: '10-cookies-analytics',
      num: '10',
      sort: 10,
      en: {
        heading: 'Cookies & Digital Preferences',
        subheading: 'Transparent breakdown of local storage and session mechanisms used on our website.',
        content: 'We use cookies and browser storage strictly to ensure application security, remember your selected language, and provide core session functionality. We do not use intrusive third-party cross-site advertising trackers.',
        callout_title: 'Granular Cookie Control',
        callout_content: 'You can update your cookie preferences at any time. Strictly Necessary cookies cannot be disabled as they are required for secure authentication and CSRF protection.',
        structured: {
          categories: [
            { name: 'Strictly Necessary', status: 'Always Active', desc: 'Enables secure login sessions, protects against CSRF forgery, and manages application wizard steps.' },
            { name: 'Functional & Preferences', status: 'User Controlled', desc: 'Remembers your selected language (English, Gujarati, Hindi) and regional jurisdiction preferences.' },
            { name: 'Analytics & Performance', status: 'Optional / Opt-in', desc: 'Collects anonymized, aggregated page load metrics to diagnose application bottlenecks.' }
          ]
        }
      },
      gu: {
        heading: 'કૂકીઝ અને ડિજિટલ પસંદગીઓ',
        subheading: 'અમારી વેબસાઇટ પર વપરાતી લોકલ સ્ટોરેજ અને સત્ર વ્યવસ્થાની પારદર્શક સમજૂતી.',
        content: 'અમે સુરક્ષા સુનિશ્ચિત કરવા, તમારી પસંદ કરેલી ભાષા યાદ રાખવા અને સત્ર ચલાવવા માટે જ કૂકીઝનો ઉપયોગ કરીએ છીએ. અમે જાહેરાત માટે તૃતીય-પક્ષ ટ્રેકર્સનો ઉપયોગ કરતા નથી.',
        callout_title: 'વિગતવાર કૂકી નિયંત્રણ',
        callout_content: 'તમે કોઈપણ સમયે તમારી પસંદગીઓ બદલી શકો છો. સુરક્ષા અને લોગિન માટે જરૂરી કૂકીઝ હંમેશા સક્રિય રહે છે.',
        structured: {
          categories: [
            { name: 'અત્યંત આવશ્યક (Strictly Necessary)', status: 'હંમેશા સક્રિય', desc: 'સુરક્ષિત લૉગિન, CSRF સુરક્ષા અને ફોર્મ સત્ર જાળવવા માટે જરૂરી.' },
            { name: 'કાર્યાત્મક અને પસંદગીઓ', status: 'વપરાશકર્તા નિયંત્રિત', desc: 'તમારી પસંદ કરેલી ભાષા (અંગ્રેજી, ગુજરાતી, હિન્દી) યાદ રાખે છે.' },
            { name: 'એનાલિટિક્સ અને કામગીરી', status: 'વૈકલ્પિક', desc: 'વેબસાઇટની ઝડપ અને કામગીરી સુધારવા માટે અનામી આંકડાકીય ડેટા.' }
          ]
        }
      },
      hi: {
        heading: 'कुकीज़ एवं डिजिटल प्राथमिकताएं',
        subheading: 'हमारी वेबसाइट पर प्रयुक्त ब्राउज़र स्टोरेज एवं सेशन तंत्र का स्पष्ट विवरण।',
        content: 'हम कुकीज़ का उपयोग केवल पोर्टल सुरक्षा, भाषा प्राथमिकता याद रखने और सुचारू सत्र संचालन हेतु करते हैं। हम किसी भी आक्रामक विज्ञापन ट्रैकर का उपयोग नहीं करते हैं।',
        callout_title: 'कुकी प्राथमिकताओं पर आपका नियंत्रण',
        callout_content: 'आप कभी भी अपनी प्राथमिकताएं बदल सकते हैं। सुरक्षा एवं प्रमाणीकरण हेतु आवश्यक कुकीज़ को बंद नहीं किया जा सकता।',
        structured: {
          categories: [
            { name: 'अत्यंत आवश्यक (Strictly Necessary)', status: 'सदैव सक्रिय', desc: 'सुरक्षित लॉगिन, सुरक्षा और फॉर्म भरने की निरंतरता बनाए रखने हेतु आवश्यक।' },
            { name: 'कार्यात्मक एवं प्राथमिकताएं', status: 'उपयोगकर्ता नियंत्रित', desc: 'आपकी चुनी हुई भाषा (अंग्रेज़ी, गुजराती, हिन्दी) को सुरक्षित रखता है।' },
            { name: 'एनालिटिक्स एवं प्रदर्शन', status: 'वैकल्पिक', desc: 'पोर्टल की गति और कार्यप्रणाली को बेहतर बनाने हेतु अनाम आंकड़े।' }
          ]
        }
      }
    },

    // 11 International Transfers
    {
      key: '11-international-transfers',
      num: '11',
      sort: 11,
      en: {
        heading: 'International Data Transfers & Data Residency',
        subheading: 'Strict adherence to domestic data residency within sovereign Indian jurisdiction.',
        content: 'Driving License Form is proud to store citizen personal data exclusively within the sovereign territory of the Republic of India. All databases, encrypted file backups, and processing environments reside in MeitY-empaneled tier-IV data centers located in Mumbai and Hyderabad.',
        callout_title: 'Section 16 DPDP Compliance',
        callout_content: 'We do not transfer or route citizen personal data to any foreign country or territory blacklisted or restricted by the Central Government under Section 16 of the DPDP Act, 2023.',
        structured: {
          points: [
            'Primary Data Centers: Mumbai & Hyderabad, India',
            'Encryption key management resides exclusively within Indian boundaries',
            'Full compliance with RBI, MeitY, and DPDP cross-border data transfer directives'
          ]
        }
      },
      gu: {
        heading: 'આંતરરાષ્ટ્રીય ડેટા ટ્રાન્સફર અને રેસીડેન્સી',
        subheading: 'ભારતીય સાર્વભૌમ અધિકારક્ષેત્રમાં જ સ્થાનિક ડેટા સંગ્રહનું કડક પાલન.',
        content: 'ડ્રાઇવિંગ લાઇસન્સ ફોર્મ નાગરિકોના ડેટાને ફક્ત ભારતના સાર્વભૌમ ક્ષેત્રમાં જ સંગ્રહિત કરે છે. અમારા તમામ ડેટાબેઝ, એન્ક્રિપ્ટેડ બેકઅપ અને સર્વર્સ મુંબઈ અને હૈદરાબાદ સ્થિત MeitY-માન્યતા પ્રાપ્ત ડેટા સેન્ટર્સમાં સુરક્ષિત છે.',
        callout_title: 'કલમ 16 ડીપીડીપી અનુપાલન',
        callout_content: 'અમે કેન્દ્ર સરકાર દ્વારા પ્રતિબંધિત કોઈપણ વિદેશી પ્રદેશમાં નાગરિક ડેટા ટ્રાન્સફર કરતા નથી.',
        structured: {
          points: [
            'પ્રાથમિક ડેટા સેન્ટર્સ: મુંબઈ અને હૈદરાબાદ, ભારત',
            'એન્ક્રિપ્શન કી ભારતીય સરહદોની અંદર જ સંચાલિત થાય છે',
            'આરબીઆઈ, MeitY અને ડીપીડીપી માર્ગદર્શિકાનું સંપૂર્ણ પાલન'
          ]
        }
      },
      hi: {
        heading: 'अंतर्राष्ट्रीय डेटा स्थानांतरण एवं डेटा निवास',
        subheading: 'संप्रभु भारतीय सीमा के भीतर ही स्थानीय डेटा भंडारण का कड़ा अनुपालन।',
        content: 'ड्राइविंग लाइसेंस फॉर्म नागरिकों के व्यक्तिगत डेटा को विशेष रूप से भारत गणराज्य के भीतर ही सुरक्षित रखता है। हमारे सभी डेटाबेस और सर्वर मुंबई और हैदराबाद स्थित MeitY-सूचीबद्ध डेटा केंद्रों में स्थित हैं।',
        callout_title: 'धारा 16 DPDP अनुपालन',
        callout_content: 'हम केंद्र सरकार द्वारा प्रतिबंधित किसी भी विदेशी क्षेत्र में नागरिकों का डेटा स्थानांतरित नहीं करते हैं।',
        structured: {
          points: [
            'प्राथमिक डेटा केंद्र: मुंबई एवं हैदराबाद, भारत',
            'एन्क्रिप्शन कुंजियों का प्रबंधन केवल भारतीय सीमा में',
            'आरबीआई, MeitY और DPDP सीमा पार डेटा निर्देशों का पूर्ण पालन'
          ]
        }
      }
    },

    // 12 Grievances
    {
      key: '12-grievance-redressal',
      num: '12',
      sort: 12,
      en: {
        heading: 'Need Help With Your Privacy? (Grievance Redressal)',
        subheading: 'Direct escalation mechanism to our statutory Data Protection Officer with legally mandated turnaround timelines.',
        content: 'If you have questions, complaints, or concerns regarding how your personal data is handled, you have the statutory right under Section 13 of the DPDP Act to submit a formal grievance. We are committed to prompt and impartial resolution.',
        callout_title: 'Statutory Redressal Timelines',
        callout_content: 'All submitted grievances receive an official tracking ticket and acknowledgment within 24 hours. Formal investigations and resolutions are provided within 30 days.',
        structured: {
          dpo: {
            name: 'Shri Animesh Sharma',
            designation: 'Data Protection Officer & Head of Compliance',
            email: 'dpo@drivinglicenceform.in',
            address: 'Privacy & Grievance Redressal Cell, Driving License Form, Infocity, Gandhinagar, Gujarat 382010',
            sla: '24-hour formal acknowledgment • 30-day statutory resolution'
          }
        }
      },
      gu: {
        heading: 'તમારી ગોપનીયતામાં મદદ જોઈએ છે? (ફરિયાદ નિવારણ)',
        subheading: 'કાયદા દ્વારા નિર્ધારિત સમયમર્યાદા સાથે અમારા ડેટા પ્રોટેક્શન ઓફિસર સમક્ષ સીધી ફરિયાદ પ્રક્રિયા.',
        content: 'જો તમને તમારા વ્યક્તિગત ડેટા અંગે કોઈ પ્રશ્ન કે ફરિયાદ હોય, તો ડીપીડીપી એક્ટની કલમ 13 હેઠળ ઔપચારિક ફરિયાદ નોંધાવવાનો તમારો વૈધાનિક અધિકાર છે. અમે ઝડપી અને ન્યાયી નિરાકરણ માટે પ્રતિબદ્ધ છીએ.',
        callout_title: 'વૈધાનિક નિવારણ સમયરેખા',
        callout_content: 'તમામ ફરિયાદોને 24 કલાકમાં સત્તાવાર સ્વીકૃતિ ટિકિટ આપવામાં આવે છે અને 30 દિવસમાં સંપૂર્ણ નિરાકરણ લાવવામાં આવે છે.',
        structured: {
          dpo: {
            name: 'શ્રી અનિમેષ શર્મા',
            designation: 'ડેટા પ્રોટેક્શન ઓફિસર અને હેડ ઓફ કમ્પ્લાયન્સ',
            email: 'dpo@drivinglicenceform.in',
            address: 'પ્રાઇવસી એન્ડ ગ્રીવન્સ સેલ, ડ્રાઇવિંગ લાઇસન્સ ફોર્મ, ઇન્ફોસિટી, ગાંધીનગર, ગુજરાત 382010',
            sla: '24-કલાકમાં સત્તાવાર સ્વીકૃતિ • 30-દિવસમાં વૈધાનિક નિરાકરણ'
          }
        }
      },
      hi: {
        heading: 'अपनी गोपनीयता के संबंध में सहायता चाहिए? (शिकायत निवारण)',
        subheading: 'कानूनी रूप से निर्धारित समय सीमा के भीतर हमारे डेटा संरक्षण अधिकारी (DPO) से सीधी शिकायत व्यवस्था।',
        content: 'यदि आपको अपने व्यक्तिगत डेटा के संबंध में कोई प्रश्न, शिकायत या संदेह है, तो DPDP अधिनियम की धारा 13 के तहत औपचारिक शिकायत दर्ज करने का आपका वैधानिक अधिकार है। हम त्वरित और निष्पक्ष समाधान हेतु प्रतिबद्ध हैं।',
        callout_title: 'वैधानिक समाधान समय सीमा',
        callout_content: 'सभी शिकायतों को 24 घंटे के भीतर आधिकारिक ट्रैकिंग टिकट व पावती दी जाती है तथा 30 दिनों में विधिवत समाधान प्रदान किया जाता है।',
        structured: {
          dpo: {
            name: 'श्री अनिमेष शर्मा',
            designation: 'डेटा संरक्षण अधिकारी (DPO) एवं अनुपालन प्रमुख',
            email: 'dpo@drivinglicenceform.in',
            address: 'गोपनीयता एवं शिकायत निवारण सेल, ड्राइविंग लाइसेंस फॉर्म, इन्फोसिटी, गांधीनगर, गुजरात 382010',
            sla: '24-घंटे में पावती • 30-दिन में कानूनी समाधान'
          }
        }
      }
    },

    // 13 Contact
    {
      key: '13-contact-details',
      num: '13',
      sort: 13,
      en: {
        heading: 'Contact Us & Privacy Desk',
        subheading: 'Get in touch with our privacy and compliance desk for inquiries, clarifications, or rights assistance.',
        content: 'For routine inquiries regarding this Privacy Policy, consent adjustments, or documentation guidance, our citizen support and compliance team is available via multiple channels.',
        callout_title: 'Official Working Hours',
        callout_content: 'Our compliance desk operates Monday through Friday from 9:30 AM to 6:00 PM IST (excluding national and state public holidays).',
        structured: {
          contactItems: [
            { label: 'Privacy Support Email', val: 'privacy@drivinglicenceform.in' },
            { label: 'DPO Escalation Email', val: 'dpo@drivinglicenceform.in' },
            { label: 'Citizen Helpline', val: '+91 79 2325 0000' },
            { label: 'Registered Office', val: 'Infocity Tower 2, Gandhinagar, Gujarat 382010, India' }
          ]
        }
      },
      gu: {
        heading: 'અમારો સંપર્ક કરો અને ગોપનીયતા ડેસ્ક',
        subheading: 'પૂછપરછ, સ્પષ્ટતા અથવા અધિકારોની સહાય માટે અમારા ગોપનીયતા ડેસ્કનો સંપર્ક કરો.',
        content: 'આ ગોપનીયતા નીતિ, સંમતિ ફેરફારો અથવા દસ્તાવેજ માર્ગદર્શન અંગેની પૂછપરછ માટે અમારી નાગરિક સહાય ટીમ વિવિધ માધ્યમો દ્વારા ઉપલબ્ધ છે.',
        callout_title: 'સત્તાવાર કામકાજનો સમય',
        callout_content: 'અમારું કમ્પ્લાયન્સ ડેસ્ક સોમવારથી શુક્રવાર સવારે 9:30 થી સાંજે 6:00 વાગ્યા સુધી (જાહેર રજાઓ સિવાય) કાર્યરત છે.',
        structured: {
          contactItems: [
            { label: 'ગોપનીયતા સહાય ઇમેઇલ', val: 'privacy@drivinglicenceform.in' },
            { label: 'DPO અધિકારી ઇમેઇલ', val: 'dpo@drivinglicenceform.in' },
            { label: 'નાગરિક હેલ્પલાઇન', val: '+91 79 2325 0000' },
            { label: 'નોંધાયેલ કાર્યાલય', val: 'ઇન્ફોસિટી ટાવર 2, ગાંધીનગર, ગુજરાત 382010, ભારત' }
          ]
        }
      },
      hi: {
        heading: 'संपर्क विवरण एवं प्राइवेसी डेस्क',
        subheading: 'किसी भी प्रश्न, स्पष्टीकरण या अधिकारों की सहायता हेतु हमारे अनुपालन डेस्क से संपर्क करें।',
        content: 'इस गोपनीयता नीति, सहमति परिवर्तन अथवा दस्तावेज़ीकरण संबंधी पूछताछ के लिए हमारी सहायता टीम विभिन्न माध्यमों द्वारा उपलब्ध है।',
        callout_title: 'कार्यालय कार्य समय',
        callout_content: 'हमारा अनुपालन डेस्क सोमवार से शुक्रवार सुबह 9:30 बजे से शाम 6:00 बजे तक (सार्वजनिक अवकाशों को छोड़कर) सक्रिय रहता है।',
        structured: {
          contactItems: [
            { label: 'गोपनीयता सहायता ईमेल', val: 'privacy@drivinglicenceform.in' },
            { label: 'डीपीओ एस्केलेशन ईमेल', val: 'dpo@drivinglicenceform.in' },
            { label: 'नागरिक हेल्पलाइन', val: '+91 79 2325 0000' },
            { label: 'पंजीकृत कार्यालय', val: 'इन्फोसिटी टावर 2, गांधीनगर, गुजरात 382010, भारत' }
          ]
        }
      }
    },

    // 14 Policy Updates
    {
      key: '14-policy-updates',
      num: '14',
      sort: 14,
      en: {
        heading: 'Changes to This Privacy Policy & Version History',
        subheading: 'Transparent audit timeline of updates, regulatory alignments, and archival policy notices.',
        content: 'We review and update this Privacy Policy periodically to reflect enhancements in our digital platform, statutory rules published under the DPDP Act 2023, and state transport directives. Any material modification will be announced prominently prior to taking effect.',
        callout_title: 'Notice of Material Modifications',
        callout_content: 'If changes materially impact how we process your personal data, we will provide at least 15 days advance notice via SMS and account notification before new provisions become active.',
        structured: {
          currentVersion: '1.2',
          effectiveDate: 'September 01, 2026',
          timeline: [
            { version: 'v1.2', status: 'Current', date: '01 Sep 2026', summary: 'Comprehensive alignment with notified DPDP Rules 2025, minor applicant safeguards (Section 9), and statutory 72-hour breach notification clocks.' },
            { version: 'v1.1', status: 'Archived', date: '15 Jun 2026', summary: 'Introduction of enhanced DPO grievance redressal workflows and granular processing purpose consents.' },
            { version: 'v1.0', status: 'Archived', date: '10 Jan 2026', summary: 'Initial launch of Driving License Form citizen assistance portal and baseline privacy notice.' }
          ]
        }
      },
      gu: {
        heading: 'આ ગોપનીયતા નીતિમાં ફેરફારો અને આવૃત્તિ ઇતિહાસ',
        subheading: 'નિયમનકારી ફેરફારો, સુધારાઓ અને ઐતિહાસિક નીતિઓનો પારદર્શક ઓડિટ ટાઈમલાઈન.',
        content: 'અમે ડીપીડીપી નિયમો 2025 અને સરકારી પરિવહન માર્ગદર્શિકા મુજબ સમયાંતરે આ નીતિની સમીક્ષા કરીએ છીએ. કોઈપણ મહત્વપૂર્ણ ફેરફાર લાગુ કરતાં પહેલાં વપરાશકર્તાઓને અગાઉથી જાણ કરવામાં આવે છે.',
        callout_title: 'મહત્વપૂર્ણ ફેરફારોની પૂર્વ સૂચના',
        callout_content: 'જો કોઈ ફેરફાર તમારા ડેટા ઉપયોગને નોંધપાત્ર રીતે અસર કરે છે, તો અમે નવા નિયમો લાગુ થતાં પહેલાં ઓછામાં ઓછા 15 દિવસ અગાઉ SMS અને પોર્ટલ દ્વારા જાણ કરીશું.',
        structured: {
          currentVersion: '1.2',
          effectiveDate: '01 સપ્ટેમ્બર 2026',
          timeline: [
            { version: 'v1.2', status: 'હાલની', date: '01 સપ્ટે 2026', summary: 'ડીપીડીપી નિયમો 2025, સગીર અરજદાર સુરક્ષા (કલમ 9) અને 72-કલાકની સુરક્ષા ચેતવણી સાથે સંપૂર્ણ સુસંગતતા.' },
            { version: 'v1.1', status: 'સંગ્રહિત', date: '15 જૂન 2026', summary: 'ડેટા પ્રોટેક્શન ઓફિસર ફરિયાદ નિવારણ અને વિગતવાર સંમતિ પ્રણાલીનો પ્રારંભ.' },
            { version: 'v1.0', status: 'સંગ્રહિત', date: '10 જાન્યુ 2026', summary: 'ડ્રાઇવિંગ લાઇસન્સ ફોર્મ નાગરિક સહાયતા પોર્ટલ અને મૂળભૂત ગોપનીયતા સૂચનાનો પ્રારંભ.' }
          ]
        }
      },
      hi: {
        heading: 'इस गोपनीयता नीति में परिवर्तन एवं संस्करण इतिहास',
        subheading: 'नियामक परिवर्तनों, सुधारों और ऐतिहासिक सूचनाओं की पारदर्शी ऑडिट टाइमलाइन।',
        content: 'हम डीपीडीपी नियम 2025 और राज्य परिवहन निर्देशों के अनुसार समय-समय पर इस नीति की समीक्षा करते हैं। किसी भी महत्वपूर्ण परिवर्तन की सूचना प्रभावी होने से पूर्व नागरिकों को स्पष्ट रूप से दी जाती है।',
        callout_title: 'महत्वपूर्ण परिवर्तनों की पूर्व सूचना',
        callout_content: 'यदि कोई संशोधन व्यक्तिगत डेटा के उपयोग को महत्वपूर्ण रूप से प्रभावित करता है, तो हम नए प्रावधान प्रभावी होने से कम से कम 15 दिन पूर्व एसएमएस और पोर्टल अलर्ट द्वारा सूचित करेंगे।',
        structured: {
          currentVersion: '1.2',
          effectiveDate: '01 सितंबर 2026',
          timeline: [
            { version: 'v1.2', status: 'वर्तमान', date: '01 सित 2026', summary: 'डीपीडीपी नियम 2025, नाबालिग आवेदक सुरक्षा (धारा 9) और 72-घंटे उल्लंघन चेतावनी प्रणाली के साथ पूर्ण सामंजस्य।' },
            { version: 'v1.1', status: 'संग्रहीत', date: '15 जून 2026', summary: 'डीपीओ शिकायत निवारण प्रक्रिया और उद्देश्य-विशिष्ट सहमति प्रणाली का शुभारंभ।' },
            { version: 'v1.0', status: 'संग्रहीत', date: '10 जन 2026', summary: 'ड्राइविंग लाइसेंस फॉर्म नागरिक सुविधा पोर्टल एवं प्राथमिक गोपनीयता सूचना का आरंभ।' }
          ]
        }
      }
    }
  ];

function seedPrivacySections() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS privacy_policy_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_key TEXT NOT NULL,
        version TEXT NOT NULL DEFAULT '1.2',
        language TEXT NOT NULL DEFAULT 'en',
        section_number TEXT NOT NULL DEFAULT '01',
        heading TEXT NOT NULL,
        subheading TEXT,
        content TEXT NOT NULL,
        structured_json TEXT,
        callout_title TEXT,
        callout_content TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(section_key, version, language)
    );
    CREATE INDEX IF NOT EXISTS idx_sections_ver_lang ON privacy_policy_sections(version, language);
    CREATE INDEX IF NOT EXISTS idx_sections_sort ON privacy_policy_sections(sort_order);
  `);

  db.prepare(`
    INSERT OR IGNORE INTO privacy_notice_versions (notice_id, version, language, title, content, summary, status, effective_from)
    VALUES (1, '1.2', 'en', 'Master Privacy Policy v1.2', 'Complete DPDP Act 2023 & DPDP Rules 2025 compliant notice.', 'Standard citizen privacy policy', 'published', '2026-09-01')
  `).run();

  db.prepare(`
    INSERT OR IGNORE INTO privacy_notice_versions (notice_id, version, language, title, content, summary, status, effective_from)
    VALUES (1, '1.2', 'gu', 'માસ્ટર ગોપનીયતા નીતિ v1.2', 'સંપૂર્ણ ડીપીડીપી કાયદો 2023 અને ડીપીડીપી નિયમો 2025 સુસંગત સૂચના.', 'નાગરિક ગોપનીયતા નીતિ', 'published', '2026-09-01')
  `).run();

  db.prepare(`
    INSERT OR IGNORE INTO privacy_notice_versions (notice_id, version, language, title, content, summary, status, effective_from)
    VALUES (1, '1.2', 'hi', 'मास्टर गोपनीयता नीति v1.2', 'पूर्ण डीपीडीपी अधिनियम 2023 एवं डीपीडीपी नियम 2025 अनुपालन सूचना।', 'नागरिक गोपनीयता नीति', 'published', '2026-09-01')
  `).run();

  // Prepare insert/replace statement
  const insertStmt = db.prepare(`
    INSERT INTO privacy_policy_sections (
      section_key, version, language, section_number, heading, subheading,
      content, structured_json, callout_title, callout_content, sort_order, is_active, updated_at
    ) VALUES (
      @key, @version, @lang, @num, @heading, @subheading,
      @content, @structured_json, @callout_title, @callout_content, @sort_order, 1, datetime('now')
    )
    ON CONFLICT(section_key, version, language) DO UPDATE SET
      heading = excluded.heading,
      subheading = excluded.subheading,
      content = excluded.content,
      structured_json = excluded.structured_json,
      callout_title = excluded.callout_title,
      callout_content = excluded.callout_content,
      sort_order = excluded.sort_order,
      is_active = 1,
      updated_at = datetime('now')
  `);

  const runInsert = db.transaction(() => {
    for (const s of sectionsData) {
      // Version 1.2 in EN, GU, HI
      for (const lang of ['en', 'gu', 'hi']) {
        const langData = s[lang];
        insertStmt.run({
          key: s.key,
          version: '1.2',
          lang: lang,
          num: s.num,
          heading: langData.heading,
          subheading: langData.subheading,
          content: langData.content,
          structured_json: JSON.stringify(langData.structured || {}),
          callout_title: langData.callout_title || null,
          callout_content: langData.callout_content || null,
          sort_order: s.sort
        });

        // Also duplicate to 1.0 for backward compatibility if user switches to 1.0
        insertStmt.run({
          key: s.key,
          version: '1.0',
          lang: lang,
          num: s.num,
          heading: langData.heading,
          subheading: langData.subheading,
          content: langData.content,
          structured_json: JSON.stringify(langData.structured || {}),
          callout_title: langData.callout_title || null,
          callout_content: langData.callout_content || null,
          sort_order: s.sort
        });
      }
    }
  });

  runInsert();
  console.log(`Successfully seeded all ${sectionsData.length} privacy policy sections in EN, GU, HI for versions 1.2 & 1.0!`);
}

module.exports = { seedPrivacySections, sectionsData };
