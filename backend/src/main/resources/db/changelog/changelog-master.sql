--liquibase formatted sql

-- changeset EduConnect:1
-- comment: Schema for Users Table
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    username VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    identity_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150),
    created_at DATETIME2 DEFAULT GETDATE(),
    role VARCHAR(50),
    tipe_guru VARCHAR(50),
    special_subject VARCHAR(100),
    student_status VARCHAR(50),
    classroom_id UNIQUEIDENTIFIER
);

-- changeset EduConnect:2
-- comment: Schema for Classrooms Table
CREATE TABLE classrooms (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    grade_class VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    academic_year VARCHAR(50),
    homeroom_teacher_id UNIQUEIDENTIFIER
);

-- changeset EduConnect:3
-- comment: Add Foreign Keys for Users and Classrooms
ALTER TABLE users ADD CONSTRAINT FK_user_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id);
ALTER TABLE classrooms ADD CONSTRAINT FK_classroom_teacher FOREIGN KEY (homeroom_teacher_id) REFERENCES users(id);
