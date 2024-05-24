CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    salt VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    publicKey TEXT
);


CREATE TABLE Global (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, -- ID do utilizador que envia a mensagem
    file BLOB NOT NULL, -- ficheiro cifrado
    key_used VARCHAR(255) NOT NULL, -- Chave utilizada para cifrar o ficheiro (em hexadecimal)
    iv_used VARCHAR(255) NOT NULL, -- Vetor de inicialização (IV) utilizado para cifrar o ficheiro (em hexadecimal)
    cipher VARCHAR(50) NOT NULL, -- Algoritmo de cifra utilizado, vem do formulário html da página message.hbs
    mac VARCHAR(64) NOT NULL -- Código de autenticação de mensagens (MAC) calculado com o uso do HMAC-SHA256
);

CREATE TABLE Grupo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    diffieGrp VARCHAR(255) NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE TABLE Chat (
    id INT PRIMARY KEY AUTO_INCREMENT,
    idUser1 INT NOT NULL,
    idUser2 INT NOT NULL,
    diffieCht VARCHAR(255) NOT NULL,
    FOREIGN KEY (idUser1) REFERENCES User(id),
    FOREIGN KEY (idUser2) REFERENCES User(id)
);
