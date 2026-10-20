CREATE DATABASE Wallet;


GO
USE Wallet;

CREATE TABLE document_types (
    id   INT          IDENTITY (1, 1) PRIMARY KEY,
    code VARCHAR (10) UNIQUE NOT NULL,
    name VARCHAR (50) NOT NULL
);

INSERT  INTO document_types (
    code,
    name
)
VALUES                     ('DNI', 'Documento Nacional de Identidad'),
('PAS', 'Pasaporte');


GO
CREATE TABLE Users (
    id               INT            IDENTITY (1, 1) PRIMARY KEY,
    name             NVARCHAR (50)  NOT NULL,
    lastname         NVARCHAR (50) ,
    document_type_id INT            NOT NULL,
    document_number  VARCHAR (30)   NOT NULL,
    email            NVARCHAR (250) UNIQUE,
    CONSTRAINT UQ_TypeOfId_UserId UNIQUE (document_type_id, document_number),
    CONSTRAINT FK_Users_DocumentTypes FOREIGN KEY (document_type_id) REFERENCES document_types (id)
);


GO
CREATE TABLE Accounts (
    id INT IDENTITY (1, 1) PRIMARY KEY
);


GO
CREATE TABLE Transactions (
    id        INT IDENTITY (1, 1) PRIMARY KEY,
    AccountId INT NOT NULL,
    CONSTRAINT FK_Transactions_Accounts FOREIGN KEY (AccountId) REFERENCES Accounts (id)
);


GO
ALTER TABLE Users
    ADD password_hash       NVARCHAR (MAX) NULL,
        IsActive            BIT            DEFAULT 1 NOT NULL,
        DebeCambiarPassword BIT            DEFAULT 0 NOT NULL,
        Rol                 NVARCHAR (50)  DEFAULT 'Usuario' NOT NULL;

USE WALLET;

ALTER TABLE AspNetUsers DROP CONSTRAINT DF_AspNetUsers_DebeCambiarPassword;

ALTER TABLE AspNetUsers DROP COLUMN DebeCambiarPassword;

SELECT *
FROM   AspNetUsers
WHERE  Id = 1;

SELECT *
FROM   VirtualCards;

SELECT *
FROM   AspNetUsers;

SELECT *
FROM   Transactions;

SELECT count(*)
FROM   Transactions;

-- Inserta una transferencia donde la Cuenta 1 le envía 1500 a la Cuenta 2
INSERT  INTO Transactions (
    SenderAccountId,
    ReceiverAccountId,
    Amount,
    Date
)
VALUES                   (1, 2, 1500.00, GETUTCDATE());

INSERT  INTO Accounts (
    Id,
    UserId,
    Balance,
    Currency,
    Alias,
    Cvu,
    CreatedAt
)
VALUES               (3, 2, 0.00, 'ARS', 'usuario2.alias', '0000003100000000000002', GETDATE());

INSERT  INTO Transactions (
    AccountId,
    CounterpartAccountId,
    Amount,
    CreatedAt
)
VALUES                   (1, 2, 1500.50, GETDATE()),
(2, 1, 350.00, DATEADD(minute, -30, GETDATE())),
(1, 3, 120.75, DATEADD(hour, -2, GETDATE())),
(3, 1, 5000.00, DATEADD(hour, -5, GETDATE())),
(2, 3, 450.20, DATEADD(day, -1, GETDATE())),
(3, 2, 89.99, DATEADD(day, -1, GETDATE())),
(1, 2, 2300.00, DATEADD(day, -2, GETDATE())),
(2, 1, 150.00, DATEADD(day, -2, GETDATE())),
(3, 1, 750.50, DATEADD(day, -3, GETDATE())),
(1, 3, 300.00, DATEADD(day, -3, GETDATE())),
(2, 3, 1200.00, DATEADD(day, -4, GETDATE())),
(3, 2, 65.00, DATEADD(day, -4, GETDATE())),
(1, 2, 430.25, DATEADD(day, -5, GETDATE())),
(2, 1, 920.00, DATEADD(day, -5, GETDATE())),
(3, 1, 110.00, DATEADD(day, -6, GETDATE())),
(1, 3, 2500.00, DATEADD(day, -6, GETDATE())),
(2, 3, 400.00, DATEADD(day, -7, GETDATE())),
(3, 2, 75.50, DATEADD(day, -7, GETDATE())),
(1, 2, 1800.00, DATEADD(day, -8, GETDATE())),
(2, 1, 95.00, DATEADD(day, -8, GETDATE()));

USE Wallet;


GO
ALTER TABLE Transactions
    ADD CreatedAt DATETIME2 DEFAULT GETUTCDATE() NOT NULL;

ALTER TABLE Transactions
    ADD Description NVARCHAR (MAX) NULL;

ALTER TABLE Transactions
    ADD Type NVARCHAR (MAX) NULL;

INSERT  INTO Transactions (
    AccountId,
    Amount,
    Type,
    Description,
    CreatedAt,
    CounterpartAccountId,
    RelatedTransactionId
)
VALUES                   -- Transferencias salientes y entrantes (con contraparte)
(1, 1500.50, 'debit', 'Pago de alquiler', GETDATE(), 2, NULL),
(2, 1500.50, 'credit', 'Cobro de alquiler', GETDATE(), 1, NULL),
(1, 350.00, 'debit', 'Cena con amigos', DATEADD(minute, -30, GETDATE()), 3, NULL),
(3, 350.00, 'credit', 'Recibo cena', DATEADD(minute, -30, GETDATE()), 1, NULL),
(2, 120.75, 'debit', 'Supermercado', DATEADD(hour, -2, GETDATE()), 3, NULL),
(3, 120.75, 'credit', 'Venta kiosco', DATEADD(hour, -2, GETDATE()), 2, NULL),
(1, 5000.00, 'debit', 'Prestamo personal', DATEADD(hour, -5, GETDATE()), 2, NULL),
(2, 5000.00, 'credit', 'Devolucion prestamo', DATEADD(hour, -5, GETDATE()), 1, NULL),
(3, 450.20, 'debit', 'Regalo cumpleaños', DATEADD(day, -1, GETDATE()), 1, NULL),
(1, 450.20, 'credit', 'Recibo regalo', DATEADD(day, -1, GETDATE()), 3, NULL),
(2, 89.99, 'debit', 'Servicios', DATEADD(day, -1, GETDATE()), 3, NULL),
(3, 89.99, 'credit', 'Pago servicios', DATEADD(day, -1, GETDATE()), 2, NULL),
-- Depósitos y Entradas de dinero (Credit)
(1, 10000.00, 'credit', 'Carga de saldo por MercadoPago', DATEADD(day, -2, GETDATE()), NULL, NULL),
(2, 5500.00, 'credit', 'Depósito en efectivo', DATEADD(day, -2, GETDATE()), NULL, NULL),
(3, 2000.00, 'credit', 'Transferencia desde banco externo', DATEADD(day, -3, GETDATE()), NULL, NULL),
(3, 3000.00, 'credit', 'Sueldo mensual', DATEADD(day, -4, GETDATE()), NULL, NULL),
(2, 1200.00, 'credit', 'Venta de artículo usado', DATEADD(day, -7, GETDATE()), NULL, NULL),
(3, 920.00, 'credit', 'Reintegro de compra', DATEADD(day, -8, GETDATE()), NULL, NULL),
-- Extracciones y Pagos (Debit)
(1, 1500.00, 'debit', 'Extracción cajero automático', DATEADD(day, -3, GETDATE()), NULL, NULL),
(2, 500.00, 'debit', 'Extracción Rapipago', DATEADD(day, -4, GETDATE()), NULL, NULL),
(1, 300.00, 'debit', 'Pago de suscripción streaming', DATEADD(day, -6, GETDATE()), NULL, NULL),
(3, 65.00, 'debit', 'Compra kiosco', DATEADD(day, -7, GETDATE()), NULL, NULL),
(1, 2300.00, 'debit', 'Compra de componentes PC', DATEADD(day, -5, GETDATE()), 3, NULL),
(3, 2300.00, 'credit', 'Venta hardware', DATEADD(day, -5, GETDATE()), 1, NULL),
(2, 150.00, 'debit', 'Cafetería', DATEADD(day, -5, GETDATE()), 1, NULL),
(1, 150.00, 'credit', 'Venta café', DATEADD(day, -5, GETDATE()), 2, NULL),
(3, 750.50, 'debit', 'Compra libros', DATEADD(day, -6, GETDATE()), 2, NULL),
(2, 750.50, 'credit', 'Venta libros', DATEADD(day, -6, GETDATE()), 3, NULL),
(1, 430.25, 'debit', 'Nafta', DATEADD(day, -8, GETDATE()), 2, NULL),
(2, 430.25, 'credit', 'Estación de servicio', DATEADD(day, -8, GETDATE()), 1, NULL),
(1, 1500.50, 'debit', 'Pago de alquiler', GETDATE(), 2, NULL),
(1, 350.00, 'debit', 'Cena con amigos', DATEADD(minute, -30, GETDATE()), 3, NULL),
(1, 5000.00, 'debit', 'Prestamo personal', DATEADD(hour, -5, GETDATE()), 2, NULL),
(1, 450.20, 'credit', 'Recibo regalo', DATEADD(day, -1, GETDATE()), 3, NULL),
(1, 10000.00, 'credit', 'Carga de saldo por MercadoPago', DATEADD(day, -2, GETDATE()), NULL, NULL),
(1, 1500.00, 'debit', 'Extracción cajero automático', DATEADD(day, -3, GETDATE()), NULL, NULL),
(1, 2300.00, 'debit', 'Compra de componentes PC', DATEADD(day, -5, GETDATE()), 3, NULL),
(1, 150.00, 'credit', 'Venta café', DATEADD(day, -5, GETDATE()), 2, NULL),
(1, 300.00, 'debit', 'Pago de suscripción streaming', DATEADD(day, -6, GETDATE()), NULL, NULL),
(1, 430.25, 'debit', 'Nafta', DATEADD(day, -8, GETDATE()), 2, NULL),
(1, 1200.00, 'credit', 'Cobro de honorarios', DATEADD(day, -9, GETDATE()), 3, NULL),
(1, 85.00, 'debit', 'Compra en farmacia', DATEADD(day, -10, GETDATE()), NULL, NULL),
(1, 3400.00, 'credit', 'Transferencia recibida de familiar', DATEADD(day, -11, GETDATE()), 2, NULL),
(1, 600.00, 'debit', 'Pago de luz', DATEADD(day, -12, GETDATE()), NULL, NULL),
(1, 210.00, 'debit', 'Compra de ropa', DATEADD(day, -13, GETDATE()), 3, NULL),
(1, 750.00, 'credit', 'Reintegro de compra online', DATEADD(day, -14, GETDATE()), NULL, NULL),
(1, 120.00, 'debit', 'Pago de transporte público', DATEADD(day, -15, GETDATE()), NULL, NULL),
(1, 4500.00, 'credit', 'Venta de celular usado', DATEADD(day, -16, GETDATE()), 2, NULL),
(1, 95.50, 'debit', 'Compra de café y facturas', DATEADD(day, -17, GETDATE()), NULL, NULL),
(1, 1500.00, 'credit', 'Ayuda económica familiar', DATEADD(day, -18, GETDATE()), 3, NULL);

TRUNCATE TABLE Transactions;