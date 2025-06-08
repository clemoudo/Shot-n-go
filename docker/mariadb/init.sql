CREATE DATABASE IF NOT EXISTS shotngo;
USE shotngo;

CREATE TABLE Wallet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL UNIQUE,
    user_email VARCHAR(128) NOT NULL UNIQUE,
    credit DECIMAL(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE Machine (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Shot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price FLOAT NOT NULL,
    image VARCHAR(255) NOT NULL,
    category VARCHAR(50)
);

CREATE TABLE Machine_Shot (
    machine_id INT,
    shot_id INT,
    stock FLOAT NOT NULL DEFAULT 0,
    PRIMARY KEY (machine_id, shot_id),
    FOREIGN KEY (machine_id) REFERENCES Machine(id) ON DELETE RESTRICT,
    FOREIGN KEY (shot_id) REFERENCES Shot(id) ON DELETE RESTRICT
);

CREATE TABLE Commande (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    user_id VARCHAR(128) NOT NULL,
    machine_id INT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    state VARCHAR(50) NOT NULL,
    FOREIGN KEY (wallet_id) REFERENCES Wallet(id) ON DELETE RESTRICT,
    FOREIGN KEY (machine_id) REFERENCES Machine(id) ON DELETE RESTRICT
);

CREATE TABLE Com_Shot (
    commande_id INT,
    shot_id INT,
    quantity INT NOT NULL,
    PRIMARY KEY (commande_id, shot_id),
    FOREIGN KEY (commande_id) REFERENCES Commande(id) ON DELETE RESTRICT,
    FOREIGN KEY (shot_id) REFERENCES Shot(id) ON DELETE RESTRICT
);

CREATE TABLE News (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(64) NOT NULL,
    content VARCHAR(512) NOT NULL,
    publish_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)