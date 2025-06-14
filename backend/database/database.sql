-- Table: users
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- e.g., 'C001'
    username TEXT UNIQUE NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    phone_no TEXT,
    email TEXT,
    license TEXT -- path or filename of the uploaded PDF
    mnemonic TEXT;
    password TEXT;

);

-- Table: roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL
);

-- Table: user_roles
CREATE TABLE user_roles (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
