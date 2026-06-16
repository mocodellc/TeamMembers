CREATE TABLE TeamMembers (
    TeamMemberId INTEGER NOT NULL CONSTRAINT PK_TeamMembers PRIMARY KEY AUTOINCREMENT,
    FirstName TEXT NOT NULL,
    LastName TEXT NOT NULL,
    Email TEXT NOT NULL,
    JobTitle TEXT NOT NULL,
    Department TEXT NOT NULL,
    Country TEXT NOT NULL,
    CreatedDate TEXT NOT NULL,
    LastEditDate TEXT NULL,
    DeletedDate TEXT NULL
);

CREATE UNIQUE INDEX IX_TeamMembers_Email ON TeamMembers (Email);

CREATE TABLE TeamGroups (
    TeamGroupId INTEGER NOT NULL CONSTRAINT PK_TeamGroups PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT NOT NULL,
    CreatedDate TEXT NOT NULL
);

CREATE UNIQUE INDEX IX_TeamGroups_Name ON TeamGroups (Name);

CREATE TABLE TeamMemberGroups (
    TeamMemberGroupId INTEGER NOT NULL CONSTRAINT PK_TeamMemberGroups PRIMARY KEY AUTOINCREMENT,
    TeamMemberId INTEGER NOT NULL,
    TeamGroupId INTEGER NOT NULL,
    CONSTRAINT FK_TeamMemberGroups_TeamMembers_TeamMemberId FOREIGN KEY (TeamMemberId) REFERENCES TeamMembers (TeamMemberId) ON DELETE CASCADE,
    CONSTRAINT FK_TeamMemberGroups_TeamGroups_TeamGroupId FOREIGN KEY (TeamGroupId) REFERENCES TeamGroups (TeamGroupId) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IX_TeamMemberGroups_TeamMemberId_TeamGroupId
    ON TeamMemberGroups (TeamMemberId, TeamGroupId);
