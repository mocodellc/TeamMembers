namespace backend.Domain;

public sealed class TeamMember
{
    public int TeamMemberId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Country { get; set; } = string.Empty;

    public DateTimeOffset CreatedDate { get; set; }

    public DateTimeOffset? LastEditDate { get; set; }

    public DateTimeOffset? DeletedDate { get; set; }

    public ICollection<TeamMemberGroup> TeamMemberGroups { get; set; } = new List<TeamMemberGroup>();
}
