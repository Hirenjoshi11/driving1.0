async function testEndpoints() {
  const endpoints = [
    '/api/states',
    '/api/services',
    '/api/fees?stateId=1&serviceId=1',
    '/api/privacy/policy?lang=en&version=1.2',
    '/api/vehicle-classes',
    '/',
    '/apply',
    '/apply/gujarat',
    '/documents'
  ];

  let passed = 0;
  let failed = 0;

  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:3000${ep}`);
      console.log(`[${res.status}] ${ep}`);
      if (res.status >= 200 && res.status < 400) {
        passed++;
        if (ep.startsWith('/api/')) {
          const data = await res.json();
          const preview = JSON.stringify(data).substring(0, 100);
          console.log(`   -> OK: ${preview}...`);
        }
      } else {
        failed++;
        const text = await res.text();
        console.error(`   -> FAIL: ${text.substring(0, 200)}`);
      }
    } catch (err) {
      failed++;
      console.error(`   -> ERROR ${ep}:`, err.message);
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
}

testEndpoints();
