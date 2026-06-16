using backend.Contracts;

namespace backend.Services;

public interface ITeamGroupService
{
    Task<IReadOnlyList<TeamGroupResponseDto>> GetGroupsAsync(CancellationToken cancellationToken = default);

    Task<TeamGroupResponseDto> CreateGroupAsync(TeamGroupUpsertRequestDto request, CancellationToken cancellationToken = default);

    Task<TeamGroupResponseDto?> UpdateGroupAsync(int teamGroupId, TeamGroupUpsertRequestDto request, CancellationToken cancellationToken = default);

    Task<bool> DeleteGroupAsync(int teamGroupId, CancellationToken cancellationToken = default);
}
