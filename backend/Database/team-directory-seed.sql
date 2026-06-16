INSERT INTO TeamGroups (TeamGroupId, Name, Description, CreatedDate) VALUES
(1, 'Engineering', 'Product engineering and platform delivery', '2026-06-15T10:00:00Z'),
(2, 'Design', 'UX and product design organization', '2026-06-15T10:00:00Z'),
(3, 'Operations', 'Support and internal operations', '2026-06-15T10:00:00Z'),
(4, 'Leadership', 'People and strategy leadership', '2026-06-15T10:00:00Z');

INSERT INTO TeamMembers (
    TeamMemberId,
    FirstName,
    LastName,
    Email,
    JobTitle,
    Department,
    Country,
    CreatedDate,
    LastEditDate,
    DeletedDate)
VALUES
(1, 'Avery', 'Cole', 'avery.cole@example.com', 'Staff Engineer', 'Platform', 'United States', '2026-06-15T08:30:00Z', NULL, NULL),
(2, 'Harper', 'Diaz', 'harper.diaz@example.com', 'Product Designer', 'Design', 'Canada', '2026-06-15T08:40:00Z', NULL, NULL),
(3, 'Noah', 'Bennett', 'noah.bennett@example.com', 'Engineering Manager', 'Engineering', 'United Kingdom', '2026-06-15T08:50:00Z', NULL, NULL),
(4, 'Mia', 'Ahmed', 'mia.ahmed@example.com', 'DevOps Engineer', 'Operations', 'Germany', '2026-06-15T09:00:00Z', NULL, NULL),
(5, 'Lucas', 'Kim', 'lucas.kim@example.com', 'Backend Engineer', 'Platform', 'South Korea', '2026-06-15T09:10:00Z', NULL, NULL),
(6, 'Emma', 'Lopez', 'emma.lopez@example.com', 'Technical Program Manager', 'Operations', 'Spain', '2026-06-15T09:20:00Z', NULL, NULL),
(7, 'Ethan', 'Walker', 'ethan.walker@example.com', 'Frontend Engineer', 'Engineering', 'Australia', '2026-06-15T09:30:00Z', NULL, NULL),
(8, 'Sophia', 'Nguyen', 'sophia.nguyen@example.com', 'QA Engineer', 'Engineering', 'Vietnam', '2026-06-15T09:40:00Z', NULL, NULL),
(9, 'Liam', 'Patel', 'liam.patel@example.com', 'Data Analyst', 'Operations', 'India', '2026-06-15T09:50:00Z', NULL, NULL),
(10, 'Olivia', 'Rossi', 'olivia.rossi@example.com', 'Director of Product', 'Leadership', 'Italy', '2026-06-15T10:00:00Z', NULL, NULL);

INSERT INTO TeamMemberGroups (TeamMemberGroupId, TeamMemberId, TeamGroupId) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 1),
(4, 3, 4),
(5, 4, 3),
(6, 5, 1),
(7, 6, 3),
(8, 7, 1),
(9, 8, 1),
(10, 9, 3),
(11, 10, 4);
