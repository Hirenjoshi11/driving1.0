async function testMore() {
  const endpoints = [
    '/api/rto-offices?stateId=1',
    '/api/districts?stateId=1',
    '/api/steps?serviceId=1',
    '/api/test-centres?stateId=1',
    '/api/privacy/notice?version=1.2&lang=en',
    '/api/privacy/export',
    '/privacy',
    '/terms',
    '/refunds',
    '/help',
    '/contact',
    '/login'
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
          const preview = JSON.stringify(data).substring(0, 80);
          console.log(`   -> OK: ${preview}...`);
        }
      } else {
        failed++;
        const text = await res.text();
        console.error(`   -> FAIL: ${text.substring(0, 150)}`);
      }
    } catch (err) {
      failed++;
      console.error(`   -> ERROR ${ep}:`, err.message);
    }
  }

  console.log(`\nBatch 2 Results: ${passed} passed, ${failed} failed.`);
}

testMore();
