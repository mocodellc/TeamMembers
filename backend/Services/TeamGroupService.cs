using backend.Contracts;
using backend.Data;
using backend.Domain;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public sealed class TeamGroupService : ITeamGroupService
{
    private readonly AppDbContext _context;

    public TeamGroupService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<TeamGroupResponseDto>> GetGroupsAsync(CancellationToken cancellationToken = default)
    {
        return await _context.TeamGroups
            .AsNoTracking()
            .OrderBy(group => group.Name)
            .Select(group => new TeamGroupResponseDto(
                group.TeamGroupId,
                group.Name,
                group.Description,
                group.CreatedDate))
            .ToListAsync(cancellationToken);
    }

    public async Task<TeamGroupResponseDto> CreateGroupAsync(TeamGroupUpsertRequestDto request, CancellationToken cancellationToken = default)
    {
        ValidateRequest(request);
        await EnsureNameIsUniqueAsync(request.Name, cancellationToken);

        var entity = new TeamGroup
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            CreatedDate = DateTimeOffset.UtcNow,
        };

        await _context.TeamGroups.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return new TeamGroupResponseDto(entity.TeamGroupId, entity.Name, entity.Description, entity.CreatedDate);
    }

    public async Task<TeamGroupResponseDto?> UpdateGroupAsync(int teamGroupId, TeamGroupUpsertRequestDto request, CancellationToken cancellationToken = default)
    {
        ValidateRequest(request);

        var entity = await _context.TeamGroups.FirstOrDefaultAsync(group => group.TeamGroupId == teamGroupId, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        await EnsureNameIsUniqueAsync(request.Name, cancellationToken, teamGroupId);

        entity.Name = request.Name.Trim();
        entity.Description = request.Description.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        return new TeamGroupResponseDto(entity.TeamGroupId, entity.Name, entity.Description, entity.CreatedDate);
    }

    public async Task<bool> DeleteGroupAsync(int teamGroupId, CancellationToken cancellationToken = default)
    {
        var group = await _context.TeamGroups.FirstOrDefaultAsync(item => item.TeamGroupId == teamGroupId, cancellationToken);
        if (group is null)
        {
            return false;
        }

        var hasMembers = await _context.TeamMemberGroups
            .AsNoTracking()
            .AnyAsync(item => item.TeamGroupId == teamGroupId, cancellationToken);

        if (hasMembers)
        {
            throw new ServiceConflictException("Cannot delete group while members are assigned.");
        }

        _context.TeamGroups.Remove(group);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static void ValidateRequest(TeamGroupUpsertRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ServiceValidationException("Group Name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            throw new ServiceValidationException("Group Description is required.");
        }
    }

    private async Task EnsureNameIsUniqueAsync(string name, CancellationToken cancellationToken, int? currentGroupId = null)
    {
        var normalizedName = name.Trim();
        var exists = await _context.TeamGroups
            .AsNoTracking()
            .AnyAsync(
                group => group.Name == normalizedName && (!currentGroupId.HasValue || group.TeamGroupId != currentGroupId.Value),
                cancellationToken);

        if (exists)
        {
            throw new ServiceConflictException("A group with this Name already exists.");
        }
    }
}
