// Adds demo cities, listings, favorites and inquiries.
// Run once from the backend folder:  node db/seed-listings.js
// It uses the agent and user accounts that already exist (from seed.sql), and skips if cities already exist.
const db = require('./index');

const agents = db.prepare("SELECT id FROM users WHERE role = 'agent' ORDER BY id").all();
const users = db.prepare("SELECT id FROM users WHERE role = 'user' ORDER BY id").all();

if (agents.length === 0) {
  console.log("No user with role 'agent' found. Register or seed an agent first, then run this again.");
  process.exit(1);
}
if (db.prepare('SELECT COUNT(*) AS n FROM cities').get().n > 0) {
  console.log('Cities already exist, nothing to do.');
  process.exit(0);
}

const insCity = db.prepare('INSERT INTO cities (name, region) VALUES (?, ?)');
[['Tbilisi', 'Tbilisi'], ['Batumi', 'Adjara'], ['Kutaisi', 'Imereti'], ['Rustavi', 'Kvemo Kartli'], ['Telavi', 'Kakheti']]
  .forEach(([n, r]) => insCity.run(n, r));

const insProp = db.prepare(`INSERT INTO properties (agent_id, city_id, title, description, address, price, area_m2, rooms, type)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const props = [
  [1, 'Bright 2-bedroom apartment', 'South-facing flat near the metro, renovated kitchen, balcony.', 'Vake, Chavchavadze Ave', 105000, 68, 2, 'sale'],
  [1, 'Studio near Rustaveli', 'Compact studio, furnished, ideal for one person.', 'Sololaki', 650, 32, 1, 'rent'],
  [1, 'Family house with garden', 'Three floors, private yard, quiet street.', 'Saburtalo', 320000, 210, 5, 'sale'],
  [2, 'Sea-view apartment', 'Twelfth floor, direct sea view, parking included.', 'New Boulevard', 148000, 74, 2, 'sale'],
  [2, '1-bedroom for monthly rent', 'Walking distance to the beach, air conditioning.', 'Old Batumi', 520, 45, 1, 'rent'],
  [3, 'Renovated city-centre flat', 'High ceilings, new windows, close to the park.', 'Kutaisi centre', 58000, 80, 3, 'sale'],
  [4, 'Practical 3-room apartment', 'Good public transport, school nearby.', 'Rustavi, 9th district', 42000, 72, 3, 'sale'],
  [5, 'Stone house in wine country', 'Traditional house, cellar, vineyard view.', 'Telavi outskirts', 89000, 140, 4, 'sale'],
  [1, 'Two-room flat for rent', 'Unfurnished, long-term lease preferred.', 'Didube', 480, 55, 2, 'rent'],
  [2, 'Penthouse with terrace', 'Large terrace, two parking spots.', 'Batumi Boulevard', 275000, 130, 4, 'sale'],
];
props.forEach(([city, ...rest], i) => insProp.run(agents[i % agents.length].id, city, ...rest));

if (users.length > 0) {
  db.prepare('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)').run(users[0].id, 1);
  db.prepare('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)').run(users[0].id, 4);
  db.prepare('INSERT INTO inquiries (property_id, user_id, message) VALUES (?, ?, ?)')
    .run(1, users[0].id, 'Is the price negotiable? Can I visit this weekend?');
  db.prepare("INSERT INTO inquiries (property_id, user_id, message, reply, replied_at) VALUES (?, ?, ?, ?, datetime('now'))")
    .run(4, users[users.length > 1 ? 1 : 0].id, 'Is parking included in the price?', 'Yes, one underground spot is included.');
}

console.log('Seeded cities, 10 listings' + (users.length ? ', favorites and inquiries.' : '.'));
