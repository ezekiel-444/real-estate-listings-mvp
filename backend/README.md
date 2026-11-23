 Real Estate Listings: Backend



Express.js REST API with a relational SQLite database (tables, primary and foreign keys, constraints).



 Stack

- Node.js 22 LTS, Express

- SQLite (better-sqlite3)

- bcrypt password hashing, JWT in an httpOnly cookie

- Roles checked on the server: user, agent, admin



 How to run



&#x20;   cd backend

&#x20;   npm install

&#x20;   copy .env.example .env      (Mac/Linux: cp .env.example .env)

&#x20;   # open .env and set JWT\_SECRET to any long random text

&#x20;   npm start                   (runs on http://localhost:5000)

&#x20;   node db/seed-listings.js    (optional: demo cities, 10 listings, favorites, inquiries)



The tables are created from `db/schema.sql` and the test accounts from `db/seed.sql` when the server first starts.

Never commit your real `.env` file.



 Test logins (password for all: Password123!)



| Role | Email | Can do |


| admin | admin@estate.com | Manage cities, edit or delete any listing |

| agent | agent@estate.com | Create, edit, delete own listings, reply to inquiries on them |

| user | user@estate.com | Browse and filter, save favorites, send inquiries |



 Database (db/schema.sql)

- `users` 1 to N `properties` N to 1 `cities`

- `favorites`: join table between users and properties, primary key (user\_id, property\_id)

- `inquiries`: links a user to a property and stores the agent's reply

- Deleting a listing also deletes its favorites and inquiries. A city that still has listings cannot be deleted.



 API (base URL http://localhost:5000, send cookies: credentials: 'include')



| Method | Path | Access |


| POST | /api/auth/register, /login, /logout | public / any |

| GET | /api/auth/me | logged in |

| GET | /api/cities | public |

| POST, PUT, DELETE | /api/cities, /api/cities/:id | admin |

| GET | /api/properties?city\_id\&min\_price\&max\_price\&rooms\&type\&q\&page\&limit | public |

| GET | /api/properties/:id | public |

| GET | /api/properties/mine | agent, admin |

| POST | /api/properties | agent |

| PUT, DELETE | /api/properties/:id | owner agent, or admin |

| GET | /api/favorites | user |

| POST, DELETE | /api/favorites/:propertyId | user |

| POST | /api/properties/:id/inquiries | user |

| GET | /api/inquiries | user (sent), agent (received), admin (all) |

| PUT | /api/inquiries/:id/reply | agent who owns the listing |

| DELETE | /api/inquiries/:id | author, or admin |



Property fields: title, city\_id, price, area\_m2, rooms, type ('sale' or 'rent'), optional description, address, image\_url.





