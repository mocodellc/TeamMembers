namespace backend.Contracts;

public sealed record TeamGroupSummaryDto(int TeamGroupId, string Name);

public sealed record TeamMemberResponseDto(
    int TeamMemberId,
    string FirstName,
    string LastName,
    string Email,
    string JobTitle,
    string Department,
    string Country,
    DateTimeOffset CreatedDate,
    DateTimeOffset? LastEditDate,
    DateTimeOffset? DeletedDate,
    IReadOnlyList<TeamGroupSummaryDto> Groups);

public sealed class TeamMemberUpsertRequestDto
{
    public string FirstName { get; init; } = string.Empty;

    public string LastName { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string JobTitle { get; init; } = string.Empty;

    public string Department { get; init; } = string.Empty;

    public string Country { get; init; } = string.Empty;

    public IReadOnlyList<int> GroupIds { get; init; } = [];
}
