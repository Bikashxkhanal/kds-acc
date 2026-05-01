CREATE DATABASE IF NOT EXISTS kds_db;
USE kds_db;


CREATE TABLE IF NOT EXISTS sys_user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(10) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULl,
    address TEXT NOT NULL,
    hashed_password VARCHAR(100) NOT NULL
);



CREATE TABLE IF NOT EXISTS company_info(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(100) NOT NULL,
    pan VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS staff(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(10) NOT NULL,
    address VARCHAR(100) ,
    dob DATE NOT NULL,
    salary INT UNSIGNED NOT NULL  
);

CREATE TABLE IF NOT EXISTS staff_credit_debit_tbh(
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    title ENUM('salary credited', 'bhatta credited', 'payment debited'),
    discription TEXT ,
    amount INT UNSIGNED NOT NULL,
    date DATE NOT NULL,

    CONSTRAINT fk_staff 
    FOREIGN KEY (staff_id) 
    REFERENCES staff(id)

);


CREATE TABLE IF NOT EXISTS staff_remunation_tbh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    title ENUM('salary' , 'bhatta')NOT NULL,
    discription TEXT ,
    amount INT UNSIGNED NOT NULL,
    date DATE NOT NULL,

    CONSTRAINT fk_remunation_staff 
    FOREIGN KEY (staff_id) 
    REFERENCES staff(id)


);

CREATE TABLE IF NOT EXISTS staff_payment_tbh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    staff_id INT NOT NULL,
    discription TEXT ,
    amount INT UNSIGNED NOT NULL,

    CONSTRAINT fk_payment_staff 
    FOREIGN KEY (staff_id) 
    REFERENCES staff(id)


);

CREATE TABLE IF NOT EXISTS vehicle(
    id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_number VARCHAR(100) NOT NULL,
    type VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS customer_personal_details_tbh(
    id  INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(10) NOT NULL,
    address VARCHAR(100)  
);

CREATE TABLE IF NOT EXISTS customer_payment_details_tbh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    pay_amount INT UNSIGNED NOT NULL,
    payment_mode ENUM('cheque', 'cash', 'mobile banking') NOT NULL DEFAULT 'cash',
    payers_name VARCHAR(100) NOT NULL DEFAULT 'self',

    payment_date DATE NOT NULL ,

    CONSTRAINT fk_customer_payment
    FOREIGN KEY (customer_id)
    REFERENCES customer_personal_details_tbh(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_work_details_tbh(
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    title TEXT NOT NULL,
    quantity VARCHAR(10) NOT NULL,
    quantity_unit_notation VARCHAR(10) NOT NULL,
    rate INT UNSIGNED NOT NULL,
    total INT UNSIGNED NOT NULL,
    work_date DATE NOT NULL ,
    entry_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer_work 
    FOREIGN KEY (customer_id) REFERENCES customer_personal_details_tbh(id),

    CONSTRAINT fk_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(id)

);


CREATE TABLE IF NOT EXISTS billings(
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    bill_issuing_company_id INT NOT NULL, 
    customer_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    bill_created_date TIMESTAMP NOT NULL,
    work_completed_data TIMESTAMP,

    CONSTRAINT fk_company_id 
    FOREIGN KEY (bill_issuing_company_id)
    REFERENCES company_info(id)

);

CREATE TABLE IF NOT EXISTS bill_info(
    id INT PRIMARY KEY AUTO_INCREMENT,
    billing_id INT NOT NULL,
    discription VARCHAR(100) NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    quantity_unit_notation VARCHAR(10) NOT NULL,
    rate INT UNSIGNED NOT NULL

);





