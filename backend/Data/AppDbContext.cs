using backend.Domain;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();

    public DbSet<TeamGroup> TeamGroups => Set<TeamGroup>();

    public DbSet<TeamMemberGroup> TeamMemberGroups => Set<TeamMemberGroup>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.ToTable("TeamMembers");
            entity.HasKey(x => x.TeamMemberId);
            entity.Property(x => x.FirstName).HasMaxLength(80).IsRequired();
            entity.Property(x => x.LastName).HasMaxLength(80).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(120).IsRequired();
            entity.Property(x => x.JobTitle).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Department).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Country).HasMaxLength(80).IsRequired();
            entity.Property(x => x.CreatedDate).IsRequired();
            entity.HasIndex(x => x.Email).IsUnique();
        });

        modelBuilder.Entity<TeamGroup>(entity =>
        {
            entity.ToTable("TeamGroups");
            entity.HasKey(x => x.TeamGroupId);
            entity.Property(x => x.Name).HasMaxLength(80).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(250).IsRequired();
            entity.Property(x => x.CreatedDate).IsRequired();
            entity.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder.Entity<TeamMemberGroup>(entity =>
        {
            entity.ToTable("TeamMemberGroups");
            entity.HasKey(x => x.TeamMemberGroupId);
            entity.HasIndex(x => new { x.TeamMemberId, x.TeamGroupId }).IsUnique();

            entity
                .HasOne(x => x.TeamMember)
                .WithMany(x => x.TeamMemberGroups)
                .HasForeignKey(x => x.TeamMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(x => x.TeamGroup)
                .WithMany(x => x.TeamMemberGroups)
                .HasForeignKey(x => x.TeamGroupId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
