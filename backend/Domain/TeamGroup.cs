namespace backend.Domain;

public sealed class TeamGroup
{
    public int TeamGroupId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTimeOffset CreatedDate { get; set; }

    public ICollection<TeamMemberGroup> TeamMemberGroups { get; set; } = new List<TeamMemberGroup>();
}
