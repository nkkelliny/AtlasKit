CREATE DATABASE IF NOT EXISTS atlaskit CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE atlaskit;

CREATE TABLE IF NOT EXISTS users (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email        VARCHAR(190) NOT NULL UNIQUE,
  pass_hash    VARCHAR(200) NOT NULL,
  plan         ENUM('starter','pro','business') NOT NULL DEFAULT 'starter',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS maps (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  name         VARCHAR(190) NOT NULL,
  cfg_json     JSON NOT NULL,
  visibility   ENUM('private','unlisted','public') NOT NULL DEFAULT 'unlisted',
  slug         VARCHAR(200) NOT NULL UNIQUE,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_maps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_maps_user ON maps(user_id);
CREATE INDEX idx_maps_slug ON maps(slug);
