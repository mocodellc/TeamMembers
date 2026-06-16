namespace backend.Contracts;

public sealed record TeamGroupResponseDto(int TeamGroupId, string Name, string Description, DateTimeOffset CreatedDate);

public sealed class TeamGroupUpsertRequestDto
{
    public string Name { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;
}
