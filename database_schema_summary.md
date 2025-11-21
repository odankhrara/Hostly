# MySQL Database Schema Summary for Hostly

## Database Name
`hostly` (as configured in .env file)

## Tables Structure

### 1. **users** Table
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK, Auto-increment) | Unique user identifier |
| name | STRING | User's full name |
| email | STRING (UNIQUE) | User's email address (must be valid email) |
| password | STRING | Hashed password (bcrypt) |
| role | ENUM('traveler', 'owner', 'both') | User role, default: 'traveler' |
| phone_number | STRING | Optional phone number |
| about_me | TEXT | Optional user bio/description |
| city | STRING | Optional city location |
| country | STRING | Optional country |
| languages | STRING | Optional languages spoken |
| gender | STRING | Optional gender |
| profile_image_url | STRING | Optional profile picture URL |
| created_at | TIMESTAMP | Auto-generated timestamp |
| updated_at | TIMESTAMP | Auto-generated timestamp |

**Relationships:**
- Has many Properties (as owner)
- Has many Bookings (as traveler)
- Has many Favorites

---

### 2. **properties** Table
Stores property/listing information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK, Auto-increment) | Unique property identifier |
| owner_id | INTEGER (FK → users.id) | Owner of the property |
| name | STRING | Property name/title |
| description | TEXT | Property description |
| city | STRING(100) | City location |
| state | STRING(2) | State abbreviation |
| country | STRING(100) | Country name |
| property_type | STRING(50) | Type of property (e.g., 'apartment', 'house') |
| price_per_night | DECIMAL(10,2) | Price per night |
| bedrooms | INTEGER | Number of bedrooms (default: 1) |
| bathrooms | INTEGER | Number of bathrooms (default: 1) |
| max_guests | INTEGER | Maximum number of guests |
| amenities | TEXT | Comma-separated list of amenities |
| main_image | STRING(255) | Main property image URL |
| created_at | TIMESTAMP | Auto-generated timestamp |
| updated_at | TIMESTAMP | Auto-generated timestamp |

**Relationships:**
- Belongs to User (owner)
- Has many Bookings
- Has many Favorites

---

### 3. **bookings** Table
Stores booking/reservation information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK, Auto-increment) | Unique booking identifier |
| property_id | INTEGER (FK → properties.id) | Property being booked |
| traveler_id | INTEGER (FK → users.id) | User making the booking |
| start_date | DATE | Check-in date |
| end_date | DATE | Check-out date |
| num_guests | INTEGER | Number of guests |
| status | ENUM('pending', 'accepted', 'cancelled') | Booking status (default: 'pending') |
| total_price | DECIMAL(10,2) | Total booking price |
| created_at | TIMESTAMP | Auto-generated timestamp |
| updated_at | TIMESTAMP | Auto-generated timestamp |

**Relationships:**
- Belongs to Property
- Belongs to User (traveler)

---

### 4. **favorites** Table
Stores user's favorite properties.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK, Auto-increment) | Unique favorite identifier |
| traveler_id | INTEGER (FK → users.id) | User who favorited |
| property_id | INTEGER (FK → properties.id) | Property that was favorited |
| created_at | TIMESTAMP | Auto-generated timestamp |
| updated_at | TIMESTAMP | Auto-generated timestamp |

**Relationships:**
- Belongs to User (traveler)
- Belongs to Property

---

### 5. **sessions** Table
Stores user session data (managed by express-session with Sequelize store).

| Column | Type | Description |
|--------|------|-------------|
| sid | STRING (PK) | Session ID |
| sess | TEXT | Session data (JSON) |
| expire | DATETIME | Expiration timestamp |

---

## Database Relationships Diagram

```
users
  ├── hasMany → properties (as owner)
  ├── hasMany → bookings (as traveler)
  └── hasMany → favorites

properties
  ├── belongsTo → users (owner)
  ├── hasMany → bookings
  └── hasMany → favorites

bookings
  ├── belongsTo → properties
  └── belongsTo → users (traveler)

favorites
  ├── belongsTo → users (traveler)
  └── belongsTo → properties
```

---

## Notes

- All tables use `underscored: true` naming convention (snake_case)
- All tables have automatic `created_at` and `updated_at` timestamps
- User passwords are automatically hashed using bcrypt before saving
- The database name is configured in `.env` as `DB_NAME=hostly`
- Session store is automatically synced on server startup

---

## To View Actual Data

Once MySQL password is configured, you can run:

```sql
-- Show all databases
SHOW DATABASES;

-- Use the hostly database
USE hostly;

-- Show all tables
SHOW TABLES;

-- View users
SELECT * FROM users;

-- View properties
SELECT * FROM properties;

-- View bookings
SELECT * FROM bookings;

-- View favorites
SELECT * FROM favorites;

-- View sessions
SELECT * FROM sessions;
```

