using backend.Data;
using backend.Domain;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend.Tests.Services;

public sealed class TeamMemberServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<AppDbContext> _options;

    public TeamMemberServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        using var context = new AppDbContext(_options);
        context.Database.EnsureCreated();
    }

    public void Dispose() => _connection.Dispose();

    private AppDbContext CreateContext() => new(_options);

    [Fact]
    public async Task GetMembersAsync_ReturnsOnlyDeletedMembers_WhenIncludeDeletedIsTrue()
    {
        using var seedContext = CreateContext();

        seedContext.TeamMembers.AddRange(
            new TeamMember
            {
                FirstName = "Active",
                LastName = "Member",
                Email = "active@example.com",
                JobTitle = "Engineer",
                Department = "Backend",
                Country = "UK",
                CreatedDate = DateTimeOffset.UtcNow,
                DeletedDate = null,
            },
            new TeamMember
            {
                FirstName = "Deleted",
                LastName = "Member",
                Email = "deleted@example.com",
                JobTitle = "Engineer",
                Department = "Backend",
                Country = "UK",
                CreatedDate = DateTimeOffset.UtcNow,
                DeletedDate = DateTimeOffset.UtcNow,
            });

        await seedContext.SaveChangesAsync();

        using var readContext = CreateContext();
        var service = new TeamMemberService(readContext);

        var result = await service.GetMembersAsync(includeDeleted: true);

        var member = Assert.Single(result);
        Assert.Equal("deleted@example.com", member.Email);
        Assert.NotNull(member.DeletedDate);
    }
}