-- Ver 0.1 | 06-02-2026

-- Tabla de usuarios, almacena clientes, técnicos y administradores
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    public_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL, -- cliente, técnico, administrador
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Tabla de incidencias, es la entidad principal del sistema
CREATE TABLE incidents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    public_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    title NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    priority NVARCHAR(20) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'open', -- abierta, en_progreso, resuelta, cerrada
    client_id INT NOT NULL,
    technician_id INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    resolved_at DATETIME2 NULL,

    CONSTRAINT chk_incident_priority
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),

    CONSTRAINT fk_incident_client
        FOREIGN KEY (client_id) REFERENCES users(id),

    CONSTRAINT fk_incident_technician
        FOREIGN KEY (technician_id) REFERENCES users(id)
);

-- Tabla de comentarios de incidencias, donde se guardan comentarios y seguimiento técnico
CREATE TABLE incident_comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    public_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    incident_id INT NOT NULL,
    user_id INT NOT NULL,
    comment NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT fk_comment_incident
        FOREIGN KEY (incident_id) REFERENCES incidents(id),

    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Historial de estados de incidencias, donde se almacenan los cambios de estado
CREATE TABLE incident_status_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    incident_id INT NOT NULL,
    old_status NVARCHAR(20) NOT NULL,
    new_status NVARCHAR(20) NOT NULL,
    changed_by INT NOT NULL,
    changed_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT fk_status_incident
        FOREIGN KEY (incident_id) REFERENCES incidents(id),

    CONSTRAINT fk_status_user
        FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Tabla de adjuntos de incidencias, donde se guardan archivos o evidencias
CREATE TABLE incident_attachments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    public_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    incident_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_url NVARCHAR(500) NOT NULL,
    uploaded_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

    CONSTRAINT fk_attachment_incident
        FOREIGN KEY (incident_id) REFERENCES incidents(id)
);
