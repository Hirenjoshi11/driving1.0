const assert = require('assert');

async function testPrivacySystem() {
  console.log('Testing Privacy Policy System & CMS...');

  // 1. Test GET /api/privacy/policy in English
  const resEn = await fetch('http://localhost:3000/api/privacy/policy?lang=en&version=1.2');
  assert.strictEqual(resEn.status, 200, 'EN policy endpoint returns 200');
  const dataEn = await resEn.json();
  assert.strictEqual(dataEn.success, true, 'EN response success is true');
  assert.strictEqual(dataEn.sections.length, 14, 'All 14 sections returned in EN');
  assert.strictEqual(dataEn.sections[0].heading, 'Overview & Digital Service Commitment');
  console.log('✅ PASS: English policy endpoint has all 14 structured sections');

  // 2. Test GET /api/privacy/policy in Gujarati
  const resGu = await fetch('http://localhost:3000/api/privacy/policy?lang=gu&version=1.2');
  assert.strictEqual(resGu.status, 200, 'GU policy endpoint returns 200');
  const dataGu = await resGu.json();
  assert.strictEqual(dataGu.sections.length, 14, 'All 14 sections returned in GU');
  assert.strictEqual(dataGu.sections[0].heading, 'ઝાંખી અને ડિજિટલ સેવા પ્રતિબદ્ધતા');
  console.log('✅ PASS: Gujarati policy endpoint has all 14 native sections');

  // 3. Test GET /api/privacy/policy in Hindi
  const resHi = await fetch('http://localhost:3000/api/privacy/policy?lang=hi&version=1.2');
  assert.strictEqual(resHi.status, 200, 'HI policy endpoint returns 200');
  const dataHi = await resHi.json();
  assert.strictEqual(dataHi.sections.length, 14, 'All 14 sections returned in HI');
  assert.strictEqual(dataHi.sections[0].heading, 'अवलोकन एवं डिजिटल सेवा प्रतिबद्धता');
  console.log('✅ PASS: Hindi policy endpoint has all 14 native sections');

  // 4. Test Search filter
  const resSearch = await fetch('http://localhost:3000/api/privacy/policy?lang=en&version=1.2&q=retention');
  const dataSearch = await resSearch.json();
  assert(dataSearch.matchedCount > 0, 'Search for "retention" matches sections');
  assert(dataSearch.sections.some(s => s.section_key === '07-data-retention'), 'Section 07 matched');
  console.log(`✅ PASS: Search filter matches ${dataSearch.matchedCount} sections`);

  // 5. Check UI elements on /privacy page
  const pageRes = await fetch('http://localhost:3000/privacy');
  const html = await pageRes.text();
  assert(html.includes('Your Privacy Matters'), 'Hero title present');
  assert(html.includes('Quick Privacy Summary') || html.includes('summaryGrid') || html.includes('Your Data'), 'Summary cards present');
  assert(html.includes('Open Privacy Center'), 'Privacy Center CTA present');
  console.log('✅ PASS: Front-end /privacy HTML renders complete UI components');

  console.log('\n============================================================');
  console.log('ALL PRIVACY POLICY TESTS PASSED (5/5)');
  console.log('============================================================\n');
}

testPrivacySystem().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
