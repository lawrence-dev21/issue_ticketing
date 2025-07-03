-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 02, 2025 at 11:34 AM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ministry_ticketing`
--

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` varchar(36) NOT NULL,
  `requesterName` varchar(255) NOT NULL,
  `requesterEmail` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(255) NOT NULL,
  `issueDescription` text NOT NULL,
  `attachmentName` varchar(255) DEFAULT NULL,
  `status` enum('NEW','ASSIGNED','IN_PROGRESS','RESOLVED','OVERDUE') NOT NULL DEFAULT 'NEW',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `assignedToUserId` varchar(36) DEFAULT NULL,
  `assignedToUserName` varchar(255) DEFAULT NULL,
  `resolutionDetails` text DEFAULT NULL,
  `dueDate` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `requesterName`, `requesterEmail`, `phone`, `department`, `issueDescription`, `attachmentName`, `status`, `createdAt`, `updatedAt`, `assignedToUserId`, `assignedToUserName`, `resolutionDetails`, `dueDate`) VALUES
('1d9f2df1-0eda-4e9b-9c66-a73a1582ed88', 'john', 'john@gmail.com', NULL, 'Information Technology', 'network', NULL, 'NEW', '2025-06-26 13:15:56', '2025-06-26 13:15:56', NULL, NULL, NULL, '2025-06-29 13:15:56'),
('3b16408c-38ca-4650-b1cc-2d633d917c31', 'James phiri', 'peter@gmail.com', '0976345678', 'Finance', 'Test', NULL, 'NEW', '2025-06-26 13:19:56', '2025-06-26 13:19:56', NULL, NULL, NULL, '2025-06-29 13:19:56'),
('417d17e2-ec37-4177-aacd-8635f1041d16', 'Jones', 'Jones@gmail.com', NULL, 'Planning & Development', 'No internet in 45', NULL, 'RESOLVED', '2025-06-07 14:30:10', '2025-06-17 20:22:38', 'a36a7a16-ae46-4f97-88ae-7265824ba503', 'Luckson Black', 'done', '2025-06-10 14:30:10'),
('44818260-5baf-4b85-a34d-f32a5a769e97', 'Jones', 'Jones@gmail.com', NULL, 'Operations', 'Wifi unaccessible', NULL, 'NEW', '2025-06-17 20:20:38', '2025-06-17 20:20:38', NULL, NULL, NULL, '2025-06-20 20:20:38'),
('5134aec6-b55c-46ea-9821-feef2e016d60', 'James phiri', 'phiri@gmail.com', NULL, 'Crop Management', 'requesting for password reset', NULL, 'NEW', '2025-06-25 12:39:50', '2025-06-25 12:39:50', NULL, NULL, NULL, '2025-06-28 12:39:50'),
('56829845-fb87-4a45-a31e-75ab0acaf161', 'Mary Banda', 'banda@gmail.com', NULL, 'Human Resources', 'Network issue', 'apple1.PNG', 'ASSIGNED', '2025-06-25 12:07:07', '2025-06-25 12:08:04', 'a36a7a16-ae46-4f97-88ae-7265824ba503', 'Luckson Black', NULL, '2025-06-28 12:07:07'),
('6cffc35a-da01-44f6-81bf-64ab91b0ff4a', 'James phiri', 'phiri@gmail.com', '0977689001', 'Information Technology', 'testing', NULL, 'NEW', '2025-06-27 06:44:32', '2025-06-27 06:44:32', NULL, NULL, NULL, '2025-06-30 06:44:32'),
('6d12942a-9731-4d60-9522-b52728ebbc7c', 'Natasha Dee', 'natasha@gmail.com', '0976345677', 'Human Resources', 'testing', NULL, 'NEW', '2025-07-02 07:28:08', '2025-07-02 07:28:08', NULL, NULL, NULL, '2025-07-05 07:28:08'),
('c85d9ff5-48bb-47e2-a17c-cd49be8f9aa1', 'James phiri', 'banda@gmail.com', '0977689001', 'Information Technology', 'testing', NULL, 'NEW', '2025-06-26 13:30:23', '2025-06-26 13:30:23', NULL, NULL, NULL, '2025-06-29 13:30:23'),
('cc04538e-59c5-4394-8394-cf528eb0c8ad', 'Bwalya', 'bwalya@gmail.com', NULL, 'Crop Management', 'We asking for payslips', NULL, 'NEW', '2025-06-20 05:34:12', '2025-06-20 05:34:12', NULL, NULL, NULL, '2025-06-23 05:34:12'),
('e7ecc966-c219-4cb9-be18-f7e132e26d68', 'Febby', 'Febb@gmail.com', NULL, 'Finance', 'No internet Room 15', NULL, 'ASSIGNED', '2025-06-23 08:41:54', '2025-06-23 08:44:28', 'a36a7a16-ae46-4f97-88ae-7265824ba503', 'Luckson Black', NULL, '2025-06-26 08:41:54'),
('e8cded38-db7e-4684-8d38-bddfee5cb1ca', 'Lawrence Kasonde', 'admin@ministry.gov.ag', NULL, 'Livestock Development', 'Unable to connect to the printer', NULL, 'RESOLVED', '2025-06-06 21:35:20', '2025-06-23 08:47:13', 'a36a7a16-ae46-4f97-88ae-7265824ba503', 'Luckson Black', 'Done late because I was on leave', '2025-06-09 21:35:20'),
('f06a9085-5b40-4879-b5fc-5027a25b4c38', 'peter', 'peter@gmail.com', NULL, 'Operations', 'password reset', NULL, 'NEW', '2025-06-26 13:02:31', '2025-06-26 13:02:31', NULL, NULL, NULL, '2025-06-29 13:02:31'),
('f87bb83f-5a0b-4752-aaa9-0ccc8bb8a53d', 'Joe Benzo', 'benzo@gmail.com', NULL, 'Planning & Development', 'Framer transfer', NULL, 'RESOLVED', '2025-06-23 14:42:40', '2025-06-23 14:47:37', '02578398-41fd-4f00-954d-05b1d6d06350', 'Frank Banda', 'This is done', '2025-06-26 14:42:40');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','OFFICER') NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
('02578398-41fd-4f00-954d-05b1d6d06350', 'Frank Banda', 'banda@officer.com', '$2b$10$CoJFy3bHc7m2h/K1QbEiDOeQboTQRUmQkGcZg1xodEmzk7gi2GkZq', 'OFFICER', '2025-06-07 14:42:54', '2025-07-02 07:31:04'),
('a36a7a16-ae46-4f97-88ae-7265824ba503', 'Luckson Black', 'luckson@officer.com', '$2b$10$2mOoSuPNNLUmXBMLHn9DTOLBAAR8hepCFEVZ3pr3XiEli8.H3fs7W', 'OFFICER', '2025-06-07 14:40:58', '2025-06-07 14:40:58'),
('a3a75c45-7b71-416a-8b3f-c25073679b31', 'Admin User', 'admin@ministry.gov.ag', '$2b$10$bTnq0OtujHmBIHlrGjo4yeyQDIxUWK9Z8ZnvcmsHq4AFEOkYmh4Cu', 'ADMIN', '2025-06-06 21:33:11', '2025-06-06 21:33:11'),
('b0586a1c-e99a-4fb3-a936-a40a52de613f', 'Lawrence Kasonde', 'Lawrence.Kasonde@agriculture.gov.zm', '$2b$10$YFoaRehpdwxaclmck3NL8efGSkpYUZoSq1R/KpKzZXlFlOpA4Hy/K', 'ADMIN', '2025-06-06 22:18:06', '2025-06-06 22:18:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignedToUserId` (`assignedToUserId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`assignedToUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
