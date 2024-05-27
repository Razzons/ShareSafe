-- Create User table
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    salt VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    public_key TEXT
);

-- Create Grupo table
CREATE TABLE Grupo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Global (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    file BLOB NOT NULL,
    key_used VARCHAR(255) NOT NULL,
    iv_used VARCHAR(255) NOT NULL,
    cipher VARCHAR(50) NOT NULL,
    mac VARCHAR(64) NOT NULL,
    viewer VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id), -- Adiciona a chave estrangeira para user_id
);