'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { IconSearch, IconHelp, IconPhone, IconChat, IconArrowRight } from '@/components/icons/Icons';
import styles from './help.module.css';

const FAQS = [
  {
    id: 1,
    category: 'learner',
    q_en: 'What is the minimum age to apply for a Learner Licence?',
    a_en: 'For a Motorcycle Without Gear (engine capacity up to 50cc, MCWOG), the minimum age is 16 years with parental/guardian consent. For all other standard motor vehicles (e.g. Motorcycle With Gear - MCWG and Light Motor Vehicle - LMV Car), the minimum age is 18 years. For transport/commercial vehicles, the minimum age is 20 years.',
    q_gu: 'લર્નર લાઇસન્સ માટે અરજી કરવાની લઘુત્તમ ઉંમર કેટલી છે?',
    a_gu: 'ગિયર વગરના મોટરસાઇકલ (50cc સુધી, MCWOG) માટે માતાપિતા/વાલીની સંમતિ સાથે લઘુત્તમ ઉંમર 16 વર્ષ છે. અન્ય તમામ સામાન્ય વાહનો (MCWG અને LMV કાર) માટે લઘુત્તમ ઉંમર 18 વર્ષ છે. ટ્રાન્સપોર્ટ/કોમર્શિયલ વાહનો માટે લઘુત્તમ ઉંમર 20 વર્ષ છે.',
    q_hi: 'लर्नर लाइसेंस के लिए आवेदन करने की न्यूनतम आयु क्या है?',
    a_hi: 'बिना गियर वाले मोटरसाइकिल (50cc तक, MCWOG) के लिए अभिभावक की सहमति के साथ न्यूनतम आयु 16 वर्ष है। अन्य सभी सामान्य वाहनों (MCWG और LMV कार) के लिए न्यूनतम आयु 18 वर्ष है। वाणिज्यिक/परिवहन वाहनों के लिए न्यूनतम आयु 20 वर्ष है।',
  },
  {
    id: 2,
    category: 'learner',
    q_en: 'How long is a Learner Licence (LL) valid?',
    a_en: 'A Learner Licence issued under the Motor Vehicles Act is valid for 6 months (180 days) from the date of issue across all states in India. You become eligible to apply for a Permanent Driving Licence after 30 days of holding your Learner Licence.',
    q_gu: 'લર્નર લાઇસન્સ (LL) કેટલા સમય માટે માન્ય રહે છે?',
    a_gu: 'મોટર વાહન અધિનિયમ હેઠળ જારી કરાયેલ લર્નર લાઇસન્સ સમગ્ર ભારતમાં ઇશ્યૂ થયાની તારીખથી 6 મહિના (180 દિવસ) માટે માન્ય રહે છે. તમે લર્નર લાઇસન્સ મેળવ્યાના 30 દિવસ પછી કાયમી ડ્રાઇવિંગ લાઇસન્સ માટે અરજી કરવા પાત્ર બનો છો.',
    q_hi: 'लर्नर लाइसेंस (LL) कितने समय तक वैध रहता है?',
    a_hi: 'मोटर वाहन अधिनियम के तहत जारी लर्नर लाइसेंस पूरे भारत में जारी होने की तिथि से 6 महीने (180 दिन) के लिए वैध होता है। आप लर्नर लाइसेंस प्राप्त करने के 30 दिनों के बाद स्थायी ड्राइविंग लाइसेंस के लिए आवेदन करने के पात्र हो जाते हैं।',
  },
  {
    id: 3,
    category: 'dl',
    q_en: 'What is the difference between an RTO Office and a Driving Test Centre?',
    a_en: 'The RTO (Regional Transport Office) is the administrative government office that handles document scrutiny, licence issuing, fee collection, and records. Driving Test Centres (ADTT - Automated Driving Test Tracks) are specialized physical grounds equipped with sensors, cameras, figure-of-eight, and parking tracks where practical driving skill evaluations are conducted.',
    q_gu: 'RTO કચેરી અને ડ્રાઇવિંગ ટેસ્ટ સેન્ટર વચ્ચે શું તફાવત છે?',
    a_gu: 'RTO (પ્રાદેશિક પરિવહન કચેરી) એ વહીવટી સરકારી કચેરી છે જે દસ્તાવેજ ચકાસણી, લાઇસન્સ ઇશ્યૂ અને ફી સંગ્રહ સંભાળે છે. ડ્રાઇવિંગ ટેસ્ટ સેન્ટર્સ (ADTT - સ્વચાલિત ડ્રાઇવિંગ ટેસ્ટ ટ્રેક) એ સેન્સર અને કેમેરાથી સજ્જ ભૌતિક મેદાન છે જ્યાં પ્રાયોગિક ડ્રાઇવિંગ કૌશલ્ય મૂલ્યાંકન કરવામાં આવે છે.',
    q_hi: 'आरटीओ कार्यालय और ड्राइविंग टेस्ट केंद्र में क्या अंतर है?',
    a_hi: 'आरटीओ (क्षेत्रीय परिवहन कार्यालय) प्रशासनिक सरकारी कार्यालय है जो दस्तावेज़ जांच, लाइसेंस जारी करने और शुल्क संग्रह का कार्य करता है। ड्राइविंग टेस्ट केंद्र (ADTT) सेंसर और कैमरों से लैस मैदान हैं जहाँ व्यावहारिक ड्राइविंग कौशल परीक्षा आयोजित की जाती है।',
  },
  {
    id: 4,
    category: 'dl',
    q_en: 'Can I apply for both Motorcycle (MCWG) and Car (LMV) in one form?',
    a_en: 'Yes! You can select both Motorcycle with Gear (MCWG) and Light Motor Vehicle (LMV) in a single application. This allows you to pay a consolidated fee and schedule both skill tests in one visit.',
    q_gu: 'શું હું એક જ ફોર્મમાં મોટરસાઇકલ (MCWG) અને કાર (LMV) બંને માટે અરજી કરી શકું?',
    a_gu: 'હા! તમે એક જ અરજીમાં ગિયરવાળી મોટરસાઇકલ (MCWG) અને લાઇટ મોટર વ્હીકલ (LMV કાર) બંને પસંદ કરી શકો છો. આનાથી તમે સંયુક્ત ફી ચૂકવી શકો છો અને બંને પરીક્ષણો એકસાથે શેડ્યૂલ કરી શકો છો.',
    q_hi: 'क्या मैं एक ही फॉर्म में मोटरसाइकिल (MCWG) और कार (LMV) दोनों के लिए आवेदन कर सकता हूँ?',
    a_hi: 'हाँ! आप एक ही आवेदन में गियर वाली मोटरसाइकिल (MCWG) और लाइट मोटर वाहन (LMV कार) दोनों का चयन कर सकते हैं। इससे आप संयुक्त शुल्क का भुगतान कर सकते हैं।',
  },
  {
    id: 5,
    category: 'renewal',
    q_en: 'What is the grace period for renewing an expired Driving Licence?',
    a_en: 'Note: We do not currently process Driving Licence renewals on this platform. Please visit the official Parivahan portal directly. Under the Central Motor Vehicles Rules, you can apply for renewal up to one year before expiry and within one year after expiry without having to re-take the practical driving test.',
    q_gu: 'સમાપ્ત થયેલ ડ્રાઇવિંગ લાઇસન્સ રિન્યૂ કરવા માટે ગ્રેસ પીરિયડ કેટલો છે?',
    a_gu: 'નોંધ: અમે હાલમાં આ પ્લેટફોર્મ પર ડ્રાઇવિંગ લાઇસન્સના નવીનીકરણની પ્રક્રિયા કરતા નથી. કૃપા કરીને સત્તાવાર પરિવહન પોર્ટલની મુલાકાત લો. સેન્ટ્રલ મોટર વ્હીકલ નિયમો હેઠળ, તમે ફરીથી ડ્રાઇવિંગ ટેસ્ટ આપ્યા વિના સમાપ્તિના એક વર્ષ પહેલાં અને સમાપ્તિના એક વર્ષની અંદર રિન્યુઅલ માટે અરજી કરી શકો છો.',
    q_hi: 'समाप्त ड्राइविंग लाइसेंस के नवीनीकरण के लिए छूट अवधि कितनी है?',
    a_hi: 'नोट: हम वर्तमान में इस प्लेटफॉर्म पर ड्राइविंग लाइसेंस के नवीनीकरण की प्रक्रिया नहीं करते हैं। कृपया आधिकारिक परिवहन पोर्टल पर जाएं। केंद्रीय मोटर वाहन नियमों के तहत, आप दोबारा टेस्ट दिए बिना समाप्ति से 1 वर्ष पहले और समाप्ति के 1 वर्ष के भीतर नवीनीकरण हेतु आवेदन कर सकते हैं।',
  },
  {
    id: 6,
    category: 'duplicate',
    q_en: 'What should I do if my Driving Licence is lost or stolen?',
    a_en: 'Note: We do not currently process Duplicate Driving Licences on this platform. Please visit the official Parivahan portal directly. First, lodge an online or physical Police Lost Report / FIR with your nearest police station.',
    q_gu: 'જો મારું ડ્રાઇવિંગ લાઇસન્સ ખોવાઈ જાય કે ચોરાઈ જાય તો મારે શું કરવું?',
    a_gu: 'નોંધ: અમે હાલમાં આ પ્લેટફોર્મ પર ડુપ્લિકેટ ડ્રાઇવિંગ લાઇસન્સની પ્રક્રિયા કરતા નથી. કૃપા કરીને સત્તાવાર પરિવહન પોર્ટલની મુલાકાત લો. પ્રથમ, નજીકના પોલીસ સ્ટેશનમાં પોલીસ લોસ્ટ રિપોર્ટ / FIR નોંધાવો.',
    q_hi: 'यदि मेरा ड्राइविंग लाइसेंस खो जाए या चोरी हो जाए तो मुझे क्या करना चाहिए?',
    a_hi: 'नोट: हम वर्तमान में इस प्लेटफॉर्म पर डुप्लीकेट ड्राइविंग लाइसेंस की प्रक्रिया नहीं करते हैं। कृपया आधिकारिक परिवहन पोर्टल पर जाएं। पहले नजदीकी थाने में पुलिस रिपोर्ट / FIR दर्ज कराएं।',
  },
  {
    id: 7,
    category: 'fees',
    q_en: 'What does the total application fee include?',
    a_en: 'The total fee includes the Central/State Government statutory application fee, practical test track charges (if applicable), smart card manufacturing & postal dispatch fee, and our digital form preparation and status tracking service charge.',
    q_gu: 'કુલ અરજી ફીમાં શું શામેલ છે?',
    a_gu: 'કુલ ફીમાં કેન્દ્ર/રાજ્ય સરકારની વૈધાનિક અરજી ફી, પ્રાયોગિક ટેસ્ટ ટ્રેક શુલ્ક (જો લાગુ હોય), સ્માર્ટ કાર્ડ પ્રિન્ટિંગ અને ટપાલ ડિલિવરી ફી અને અમારી ડિજિટલ ફોર્મ તૈયારી સહાય ફી શામેલ છે.',
    q_hi: 'कुल आवेदन शुल्क में क्या शामिल है?',
    a_hi: 'कुल शुल्क में केंद्र/राज्य सरकार का वैधानिक आवेदन शुल्क, टेस्ट ट्रैक शुल्क, स्मार्ट कार्ड डाक वितरण शुल्क और हमारी डिजिटल फॉर्म तैयारी सहायता शुल्क शामिल है।',
  },
  {
    id: 8,
    category: 'minor',
    q_en: 'Can a minor (under 18) apply for a car licence?',
    a_en: 'No. The Motor Vehicles Act strictly prohibits minors from driving light motor vehicles (cars) or motorcycles with gear. Minors between 16 and 18 years can solely apply for non-geared two-wheelers up to 50cc (MCWOG) with explicit parental consent.',
    q_gu: 'શું સગીર (18 વર્ષથી ઓછી ઉંમર) કારના લાઇસન્સ માટે અરજી કરી શકે?',
    a_gu: 'ના. મોટર વાહન અધિનિયમ સગીરોને કાર અથવા ગિયરવાળી મોટરસાઇકલ ચલાવવાની સખત મનાઈ ફરમાવે છે. 16 થી 18 વર્ષના સગીરો ફક્ત માતાપિતાની સંમતિથી 50cc સુધીના ગિયર વગરના વાહન (MCWOG) માટે જ અરજી કરી શકે છે.',
    q_hi: 'क्या कोई नाबालिग (18 से कम) कार लाइसेंस के लिए आवेदन कर सकता है?',
    a_hi: 'नहीं। मोटर वाहन अधिनियम नाबालिगों को कार या गियर वाली बाइक चलाने की अनुमति नहीं देता है। 16 से 18 वर्ष के नाबालिग केवल अभिभावक की सहमति से 50cc तक के गैर-गियर वाहन (MCWOG) के लिए आवेदन कर सकते हैं।',
  },
];

export default function HelpPage() {
  const { t, state } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [openFaq, setOpenFaq] = useState(1);

  const lang = state?.language || 'en';

  const getQ = (faq) => {
    if (lang === 'hi') return faq.q_hi || faq.q_en;
    if (lang === 'gu') return faq.q_gu || faq.q_en;
    return faq.q_en;
  };

  const getA = (faq) => {
    if (lang === 'hi') return faq.a_hi || faq.a_en;
    if (lang === 'gu') return faq.a_gu || faq.a_en;
    return faq.a_en;
  };

  const categories = [
    { id: 'all', label: t('help.catAll') },
    { id: 'learner', label: t('services.learnerLicence') || 'Learner Licence' },
    { id: 'dl', label: t('services.newDrivingLicence') || 'Permanent DL & Test' },
    { id: 'renewal', label: t('services.renewal') || 'Renewal' },
    { id: 'duplicate', label: t('services.duplicate') || 'Duplicate / Lost' },
    { id: 'fees', label: t('common.governmentFee') || 'Fees & Payment' },
    { id: 'minor', label: t('help.catMinor') },
  ];

  const filteredFaqs = FAQS.filter((f) => {
    const q = getQ(f);
    const a = getA(f);
    const matchesCat = category === 'all' || f.category === category;
    const matchesSearch =
      q.toLowerCase().includes(search.toLowerCase()) ||
      a.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className={styles.helpPage}>
      <div className="container">
        {/* Hero */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            {t('help.title') || 'Help & Support Centre'}
          </h1>
          <p className={styles.heroDesc}>
            {t('help.subtitle') || 'Find answers to common questions about driving licence rules, RTO jurisdictions, automated test tracks, and application tracking.'}
          </p>
        </div>

        {/* Search */}
        <div className={styles.searchBox}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t('help.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div className={styles.categoryTabs}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.catTab} ${category === cat.id ? styles.catTabActive : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className={styles.faqList}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className={styles.faqItem}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className={styles.faqHeader}
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  >
                    <div className={styles.faqQuestion}>
                      <IconHelp size={16} />
                      <span>{getQ(faq)}</span>
                    </div>
                    <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && <div className={styles.faqBody}>{getA(faq)}</div>}
                </div>
              );
            })
          ) : (
            <p className={styles.noResults}>
              {t('help.noResults')}
            </p>
          )}
        </div>

        {/* Support Grid */}
        <div className={styles.supportGrid}>
          <div className={styles.supportCard}>
            <span className={styles.supportIcon}><IconPhone size={24} /></span>
            <h4 className={styles.supportCardTitle}>
              {t('help.helplineTitle')}
            </h4>
            <p className={styles.supportCardText}>
              {t('help.helplineDesc')}
            </p>
            <span className={styles.supportNumber}>1800-1800-151</span>
          </div>

          <div className={styles.supportCard}>
            <span className={styles.supportIcon}><IconChat size={24} /></span>
            <h4 className={styles.supportCardTitle}>
              {t('help.deskTitle')}
            </h4>
            <p className={styles.supportCardText}>
              {t('help.deskDesc')}
            </p>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <Link href="/track" className="btn btn-primary btn-sm">
                {t('footer.trackApp')}
                <IconArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
