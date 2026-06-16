using backend.Contracts;
using backend.Data;
using backend.Domain;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public sealed class TeamMemberService : ITeamMemberService
{
    private readonly AppDbContext _context;

    public TeamMemberService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<TeamMemberResponseDto>> GetMembersAsync(bool includeDeleted, CancellationToken cancellationToken = default)
    {
        var query = _context.TeamMembers
            .AsNoTracking()
            .Include(member => member.TeamMemberGroups)
            .ThenInclude(memberGroup => memberGroup.TeamGroup)
            .AsQueryable();

        query = includeDeleted
            ? query.Where(member => member.DeletedDate != null)
            : query.Where(member => member.DeletedDate == null);

        var members = await query
            .OrderBy(member => member.LastName)
            .ThenBy(member => member.FirstName)
            .ToListAsync(cancellationToken);

        return members.Select(MapTeamMember).ToList();
    }

    public async Task<TeamMemberResponseDto?> GetMemberByIdAsync(int teamMemberId, CancellationToken cancellationToken = default)
    {
        var member = await _context.TeamMembers
            .AsNoTracking()
            .Include(item => item.TeamMemberGroups)
            .ThenInclude(item => item.TeamGroup)
            .FirstOrDefaultAsync(item => item.TeamMemberId == teamMemberId, cancellationToken);

        return member is null ? null : MapTeamMember(member);
    }

    public async Task<TeamMemberResponseDto> CreateMemberAsync(TeamMemberUpsertRequestDto request, CancellationToken cancellationToken = default)
    {
        await ValidateRequestAsync(request, cancellationToken);

        var utcNow = DateTimeOffset.UtcNow;
        var member = new TeamMember
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            JobTitle = request.JobTitle.Trim(),
            Department = request.Department.Trim(),
            Country = request.Country.Trim(),
            CreatedDate = utcNow,
        };

        await _context.TeamMembers.AddAsync(member, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        await ReplaceGroupAssignmentsAsync(member.TeamMemberId, request.GroupIds, cancellationToken);

        var created = await GetMemberByIdAsync(member.TeamMemberId, cancellationToken);
        return created!;
    }

    public async Task<TeamMemberResponseDto?> UpdateMemberAsync(int teamMemberId, TeamMemberUpsertRequestDto request, CancellationToken cancellationToken = default)
    {
        await ValidateRequestAsync(request, cancellationToken, teamMemberId);

        var member = await _context.TeamMembers
            .FirstOrDefaultAsync(item => item.TeamMemberId == teamMemberId, cancellationToken);

        if (member is null)
        {
            return null;
        }

        member.FirstName = request.FirstName.Trim();
        member.LastName = request.LastName.Trim();
        member.Email = request.Email.Trim();
        member.JobTitle = request.JobTitle.Trim();
        member.Department = request.Department.Trim();
        member.Country = request.Country.Trim();
        member.LastEditDate = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        await ReplaceGroupAssignmentsAsync(member.TeamMemberId, request.GroupIds, cancellationToken);

        var updated = await GetMemberByIdAsync(member.TeamMemberId, cancellationToken);
        return updated;
    }

    public async Task<TeamMemberResponseDto?> SoftDeleteMemberAsync(int teamMemberId, CancellationToken cancellationToken = default)
    {
        var member = await _context.TeamMembers.FirstOrDefaultAsync(item => item.TeamMemberId == teamMemberId, cancellationToken);

        if (member is null)
        {
            return null;
        }

        member.DeletedDate = DateTimeOffset.UtcNow;
        member.LastEditDate = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetMemberByIdAsync(teamMemberId, cancellationToken);
    }

    public async Task<TeamMemberResponseDto?> UndeleteMemberAsync(int teamMemberId, CancellationToken cancellationToken = default)
    {
        var member = await _context.TeamMembers.FirstOrDefaultAsync(item => item.TeamMemberId == teamMemberId, cancellationToken);

        if (member is null)
        {
            return null;
        }

        member.DeletedDate = null;
        member.LastEditDate = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetMemberByIdAsync(teamMemberId, cancellationToken);
    }

    private async Task ValidateRequestAsync(TeamMemberUpsertRequestDto request, CancellationToken cancellationToken, int? currentMemberId = null)
    {
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
        {
            throw new ServiceValidationException("FirstName and LastName are required.");
        }

        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
        {
            throw new ServiceValidationException("A valid Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.JobTitle) || string.IsNullOrWhiteSpace(request.Department) || string.IsNullOrWhiteSpace(request.Country))
        {
            throw new ServiceValidationException("JobTitle, Department, and Country are required.");
        }

        var duplicateEmailExists = await _context.TeamMembers
            .AsNoTracking()
            .AnyAsync(
                item => item.Email == request.Email.Trim() && (!currentMemberId.HasValue || item.TeamMemberId != currentMemberId.Value),
                cancellationToken);

        if (duplicateEmailExists)
        {
            throw new ServiceConflictException("A team member with this Email already exists.");
        }

        var uniqueGroupIds = request.GroupIds.Distinct().ToList();
        if (uniqueGroupIds.Count != request.GroupIds.Count)
        {
            throw new ServiceValidationException("GroupIds must contain unique values.");
        }

        if (uniqueGroupIds.Count == 0)
        {
            return;
        }

        var existingGroupIds = await _context.TeamGroups
            .AsNoTracking()
            .Where(group => uniqueGroupIds.Contains(group.TeamGroupId))
            .Select(group => group.TeamGroupId)
            .ToListAsync(cancellationToken);

        if (existingGroupIds.Count != uniqueGroupIds.Count)
        {
            throw new ServiceValidationException("One or more GroupIds were not found.");
        }
    }

    private async Task ReplaceGroupAssignmentsAsync(int teamMemberId, IReadOnlyList<int> groupIds, CancellationToken cancellationToken)
    {
        var existingLinks = await _context.TeamMemberGroups
            .Where(link => link.TeamMemberId == teamMemberId)
            .ToListAsync(cancellationToken);

        _context.TeamMemberGroups.RemoveRange(existingLinks);

        var uniqueGroupIds = groupIds.Distinct().ToList();
        if (uniqueGroupIds.Count > 0)
        {
            var links = uniqueGroupIds.Select(groupId => new TeamMemberGroup
            {
                TeamMemberId = teamMemberId,
                TeamGroupId = groupId,
            });
            await _context.TeamMemberGroups.AddRangeAsync(links, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private static TeamMemberResponseDto MapTeamMember(TeamMember member)
    {
        var groups = member.TeamMemberGroups
            .Select(link => new TeamGroupSummaryDto(link.TeamGroupId, link.TeamGroup.Name))
            .OrderBy(group => group.Name)
            .ToList();

        return new TeamMemberResponseDto(
            member.TeamMemberId,
            member.FirstName,
            member.LastName,
            member.Email,
            member.JobTitle,
            member.Department,
            member.Country,
            member.CreatedDate,
            member.LastEditDate,
            member.DeletedDate,
            groups);
    }
}
