// Using native fetch in Node 22+

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('Starting API Tests...');

  let userToken = '';
  let adminToken = '';
  let eventId = '';

  // 1. Register Admin
  console.log('\n--- Registering Admin ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin User', email: 'admin@test.com', password: 'password', role: 'admin' })
    });
    const data = await res.json();
    console.log(res.status, data);
    adminToken = data.token;
  } catch (e) {
    console.log('Admin may already exist. Attempting login...');
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'password' })
    });
    const data = await res.json();
    adminToken = data.token;
  }

  // 2. Register Regular User
  console.log('\n--- Registering User ---');
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: 'user@test.com', password: 'password', role: 'user' })
    });
    const data = await res.json();
    console.log(res.status, data);
    userToken = data.token;
  } catch (e) {
    console.log('User may already exist. Attempting login...');
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@test.com', password: 'password' })
    });
    const data = await res.json();
    userToken = data.token;
  }

  // 3. Create Event (Admin)
  console.log('\n--- Creating Event (Admin) ---');
  try {
    const res = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ name: 'Test Event', date: '2025-01-01', capacity: 10 })
    });
    const data = await res.json();
    console.log(res.status, data);
    eventId = data._id;
  } catch (e) { console.error(e); }

  // 4. Fetch Events (Public)
  console.log('\n--- Fetching Events ---');
  try {
    const res = await fetch(`${BASE_URL}/events`);
    const data = await res.json();
    console.log(res.status, 'Total Events:', data.events.length);
  } catch (e) { console.error(e); }

  // 5. Book Event (User)
  if (eventId) {
    console.log('\n--- Booking Event (User) ---');
    try {
      const res = await fetch(`${BASE_URL}/events/${eventId}/book`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await res.json();
      console.log(res.status, data);
    } catch (e) { console.error(e); }
  }

  // 6. Export Bookings (Admin)
  console.log('\n--- Exporting Bookings (Admin) ---');
  try {
    const res = await fetch(`${BASE_URL}/bookings/export`, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      }
    });
    const text = await res.text();
    console.log(res.status, 'CSV Output:');
    console.log(text);
  } catch (e) { console.error(e); }

  console.log('\nTests Completed.');
}

runTests();
