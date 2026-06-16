using backend.Contracts;

namespace backend.Services;

public interface ITeamMemberService
{
    Task<IReadOnlyList<TeamMemberResponseDto>> GetMembersAsync(bool includeDeleted, CancellationToken cancellationToken = default);

    Task<TeamMemberResponseDto?> GetMemberByIdAsync(int teamMemberId, CancellationToken cancellationToken = default);

    Task<TeamMemberResponseDto> CreateMemberAsync(TeamMemberUpsertRequestDto request, CancellationToken cancellationToken = default);

    Task<TeamMemberResponseDto?> UpdateMemberAsync(int teamMemberId, TeamMemberUpsertRequestDto request, CancellationToken cancellationToken = default);

    Task<TeamMemberResponseDto?> SoftDeleteMemberAsync(int teamMemberId, CancellationToken cancellationToken = default);

    Task<TeamMemberResponseDto?> UndeleteMemberAsync(int teamMemberId, CancellationToken cancellationToken = default);
}
