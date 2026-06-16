using backend.Domain;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context, CancellationToken cancellationToken = default)
    {
        if (await context.TeamGroups.AnyAsync(cancellationToken) || await context.TeamMembers.AnyAsync(cancellationToken))
        {
            return;
        }

        var createdDate = DateTimeOffset.UtcNow;
        var groups = new List<TeamGroup>
        {
            new() { Name = "Engineering", Description = "Product engineering and platform delivery", CreatedDate = createdDate },
            new() { Name = "Design", Description = "UX and product design organization", CreatedDate = createdDate },
            new() { Name = "Operations", Description = "Support and internal operations", CreatedDate = createdDate },
            new() { Name = "Leadership", Description = "People and strategy leadership", CreatedDate = createdDate },
        };

        await context.TeamGroups.AddRangeAsync(groups, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var members = new List<TeamMember>
        {
            new() { FirstName = "Avery", LastName = "Cole", Email = "avery.cole@example.com", JobTitle = "Staff Engineer", Department = "Platform", Country = "United States", CreatedDate = createdDate.AddMinutes(-90) },
            new() { FirstName = "Harper", LastName = "Diaz", Email = "harper.diaz@example.com", JobTitle = "Product Designer", Department = "Design", Country = "Canada", CreatedDate = createdDate.AddMinutes(-80) },
            new() { FirstName = "Noah", LastName = "Bennett", Email = "noah.bennett@example.com", JobTitle = "Engineering Manager", Department = "Engineering", Country = "United Kingdom", CreatedDate = createdDate.AddMinutes(-70) },
            new() { FirstName = "Mia", LastName = "Ahmed", Email = "mia.ahmed@example.com", JobTitle = "DevOps Engineer", Department = "Operations", Country = "Germany", CreatedDate = createdDate.AddMinutes(-60) },
            new() { FirstName = "Lucas", LastName = "Kim", Email = "lucas.kim@example.com", JobTitle = "Backend Engineer", Department = "Platform", Country = "South Korea", CreatedDate = createdDate.AddMinutes(-50) },
            new() { FirstName = "Emma", LastName = "Lopez", Email = "emma.lopez@example.com", JobTitle = "Technical Program Manager", Department = "Operations", Country = "Spain", CreatedDate = createdDate.AddMinutes(-40) },
            new() { FirstName = "Ethan", LastName = "Walker", Email = "ethan.walker@example.com", JobTitle = "Frontend Engineer", Department = "Engineering", Country = "Australia", CreatedDate = createdDate.AddMinutes(-30) },
            new() { FirstName = "Sophia", LastName = "Nguyen", Email = "sophia.nguyen@example.com", JobTitle = "QA Engineer", Department = "Engineering", Country = "Vietnam", CreatedDate = createdDate.AddMinutes(-20) },
            new() { FirstName = "Liam", LastName = "Patel", Email = "liam.patel@example.com", JobTitle = "Data Analyst", Department = "Operations", Country = "India", CreatedDate = createdDate.AddMinutes(-10) },
            new() { FirstName = "Olivia", LastName = "Rossi", Email = "olivia.rossi@example.com", JobTitle = "Director of Product", Department = "Leadership", Country = "Italy", CreatedDate = createdDate },
        };

        await context.TeamMembers.AddRangeAsync(members, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var engineeringGroupId = groups.Single(g => g.Name == "Engineering").TeamGroupId;
        var designGroupId = groups.Single(g => g.Name == "Design").TeamGroupId;
        var operationsGroupId = groups.Single(g => g.Name == "Operations").TeamGroupId;
        var leadershipGroupId = groups.Single(g => g.Name == "Leadership").TeamGroupId;

        var memberGroups = new List<TeamMemberGroup>
        {
            new() { TeamMemberId = members[0].TeamMemberId, TeamGroupId = engineeringGroupId },
            new() { TeamMemberId = members[1].TeamMemberId, TeamGroupId = designGroupId },
            new() { TeamMemberId = members[2].TeamMemberId, TeamGroupId = engineeringGroupId },
            new() { TeamMemberId = members[2].TeamMemberId, TeamGroupId = leadershipGroupId },
            new() { TeamMemberId = members[3].TeamMemberId, TeamGroupId = operationsGroupId },
            new() { TeamMemberId = members[4].TeamMemberId, TeamGroupId = engineeringGroupId },
            new() { TeamMemberId = members[5].TeamMemberId, TeamGroupId = operationsGroupId },
            new() { TeamMemberId = members[6].TeamMemberId, TeamGroupId = engineeringGroupId },
            new() { TeamMemberId = members[7].TeamMemberId, TeamGroupId = engineeringGroupId },
            new() { TeamMemberId = members[8].TeamMemberId, TeamGroupId = operationsGroupId },
            new() { TeamMemberId = members[9].TeamMemberId, TeamGroupId = leadershipGroupId },
        };

        await context.TeamMemberGroups.AddRangeAsync(memberGroups, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }
}
