async function run() {
  try {
    const { GET } = require('../src/app/api/states/route.js');
    const res = await GET();
    const data = await res.json();
    console.log('Result:', data);
  } catch (err) {
    console.error('Error running GET /api/states:', err);
  }
}
run();
