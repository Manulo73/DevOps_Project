-- Ver 0.1 | 06-02-2026

-- Create database
CREATE DATABASE IncidentManagementDB;
GO

-- Use the database
USE IncidentManagementDB;
GO

-- User table, it stores clients, technicians and admins
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    public_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL, -- client, technician, admin
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Incidents table, which is the main entity of the system
CREATE TABLE incidents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    public_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    title NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    priority NVARCHAR(20) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
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

-- Incidents comments table, which is where we keep the comments and follow the incident technicaly
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

-- Incident status history, where we store the changes of incident's states
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

-- Incident attachments table, where we store files or evidences of the incidents
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