CREATE TYPE oauth_provider_enum AS ENUM ('42', 'github', 'multiple');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    oauth_provider oauth_provider_enum DEFAULT NULL,
    oauth_id VARCHAR(100),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);