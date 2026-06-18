using backend.Contracts;
using backend.Data;
using backend.Domain;
using backend.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend.Tests.Services;

public sealed class TeamGroupServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<AppDbContext> _options;

    public TeamGroupServiceTests()
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

    // ── GetGroupsAsync ──────────────────────────────────────────────────────

    [Fact]
    public async Task GetGroupsAsync_ReturnsEmptyList_WhenNoGroupsExist()
    {
        using var context = CreateContext();
        var service = new TeamGroupService(context);

        var result = await service.GetGroupsAsync();

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetGroupsAsync_ReturnsGroupsOrderedByName()
    {
        using var seedContext = CreateContext();
        seedContext.TeamGroups.AddRange(
            new TeamGroup { Name = "Zeta", Description = "Z team", CreatedDate = DateTimeOffset.UtcNow },
            new TeamGroup { Name = "Alpha", Description = "A team", CreatedDate = DateTimeOffset.UtcNow });
        await seedContext.SaveChangesAsync();

        using var readContext = CreateContext();
        var service = new TeamGroupService(readContext);

        var result = await service.GetGroupsAsync();

        Assert.Equal(2, result.Count);
        Assert.Equal("Alpha", result[0].Name);
        Assert.Equal("Zeta", result[1].Name);
    }

    // ── CreateGroupAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task CreateGroupAsync_CreatesAndReturnsDto()
    {
        using var context = CreateContext();
        var service = new TeamGroupService(context);

        var result = await service.CreateGroupAsync(
            new TeamGroupUpsertRequestDto { Name = "Backend", Description = "Backend team" });

        Assert.True(result.TeamGroupId > 0);
        Assert.Equal("Backend", result.Name);
        Assert.Equal("Backend team", result.Description);
    }

    [Fact]
    public async Task CreateGroupAsync_ThrowsValidationException_WhenNameIsEmpty()
    {
        using var context = CreateContext();
        var service = new TeamGroupService(context);

        await Assert.ThrowsAsync<ServiceValidationException>(
            () => service.CreateGroupAsync(new TeamGroupUpsertRequestDto { Name = "", Description = "Desc" }));
    }

    [Fact]
    public async Task CreateGroupAsync_ThrowsValidationException_WhenDescriptionIsEmpty()
    {
        using var context = CreateContext();
        var service = new TeamGroupService(context);

        await Assert.ThrowsAsync<ServiceValidationException>(
            () => service.CreateGroupAsync(new TeamGroupUpsertRequestDto { Name = "Valid", Description = "" }));
    }

    [Fact]
    public async Task CreateGroupAsync_ThrowsConflictException_WhenNameIsDuplicate()
    {
        using var seedContext = CreateContext();
        seedContext.TeamGroups.Add(new TeamGroup { Name = "Backend", Description = "Existing", CreatedDate = DateTimeOffset.UtcNow });
        await seedContext.SaveChangesAsync();

        using var writeContext = CreateContext();
        var service = new TeamGroupService(writeContext);

        await Assert.ThrowsAsync<ServiceConflictException>(
            () => service.CreateGroupAsync(new TeamGroupUpsertRequestDto { Name = "Backend", Description = "New" }));
    }

    // ── UpdateGroupAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateGroupAsync_ReturnsNull_WhenGroupNotFound()
    {
        using var context = CreateContext();
        var service = new TeamGroupService(context);

        var result = await service.UpdateGroupAsync(
            999,
            new TeamGroupUpsertRequestDto { Name = "X", Description = "Y" });

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateGroupAsync_UpdatesAndReturnsDto_WhenFound()
    {
        using var seedContext = CreateContext();
        seedContext.TeamGroups.Add(new TeamGroup { Name = "Old Name", Description = "Old Desc", CreatedDate = DateTimeOffset.UtcNow });
        await seedContext.SaveChangesAsync();
        var groupId = seedContext.TeamGroups.First().TeamGroupId;

        using var updateContext = CreateContext();
        var service = new TeamGroupService(updateContext);

        var result = await service.UpdateGroupAsync(
            groupId,
            new TeamGroupUpsertRequestDto { Name = "New Name", Description = "New Desc" });

        Assert.NotNull(result);
        Assert.Equal("New Name", result!.Name);
        Assert.Equal("New Desc", result.Description);
    }

    // ── DeleteGroupAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteGroupAsync_ReturnsFalse_WhenGroupNotFound()
    {
        using var context = CreateContext();
        var service = new TeamGroupService(context);

        var result = await service.DeleteGroupAsync(999);

        Assert.False(result);
    }

    [Fact]
    public async Task DeleteGroupAsync_ReturnsTrue_WhenGroupDeletedSuccessfully()
    {
        using var seedContext = CreateContext();
        seedContext.TeamGroups.Add(new TeamGroup { Name = "Deletable", Description = "Gone", CreatedDate = DateTimeOffset.UtcNow });
        await seedContext.SaveChangesAsync();
        var groupId = seedContext.TeamGroups.First().TeamGroupId;

        using var deleteContext = CreateContext();
        var service = new TeamGroupService(deleteContext);

        var result = await service.DeleteGroupAsync(groupId);

        Assert.True(result);
    }

    [Fact]
    public async Task DeleteGroupAsync_ThrowsConflictException_WhenGroupHasMembers()
    {
        using var seedContext = CreateContext();
        var group = new TeamGroup { Name = "Occupied", Description = "Has members", CreatedDate = DateTimeOffset.UtcNow };
        var member = new TeamMember
        {
            FirstName = "Bob",
            LastName = "Jones",
            Email = "bob@example.com",
            JobTitle = "Dev",
            Department = "Eng",
            Country = "US",
            CreatedDate = DateTimeOffset.UtcNow
        };
        seedContext.TeamGroups.Add(group);
        seedContext.TeamMembers.Add(member);
        await seedContext.SaveChangesAsync();
        seedContext.TeamMemberGroups.Add(new TeamMemberGroup
        {
            TeamMemberId = member.TeamMemberId,
            TeamGroupId = group.TeamGroupId
        });
        await seedContext.SaveChangesAsync();

        using var deleteContext = CreateContext();
        var service = new TeamGroupService(deleteContext);

        await Assert.ThrowsAsync<ServiceConflictException>(
            () => service.DeleteGroupAsync(group.TeamGroupId));
    }
}
