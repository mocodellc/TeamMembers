namespace backend.Domain;

public sealed class TeamMemberGroup
{
    public int TeamMemberGroupId { get; set; }

    public int TeamMemberId { get; set; }

    public TeamMember TeamMember { get; set; } = null!;

    public int TeamGroupId { get; set; }

    public TeamGroup TeamGroup { get; set; } = null!;
}
