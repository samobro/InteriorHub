using InteriorHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InteriorHub.Infrastructure.Persistence;

public sealed class InteriorHubDbContext(DbContextOptions<InteriorHubDbContext> options) : DbContext(options)
{
    public DbSet<Engineer> Engineers => Set<Engineer>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectImage> ProjectImages => Set<ProjectImage>();
    public DbSet<ContactRequest> ContactRequests => Set<ContactRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Engineer>(entity =>
        {
            entity.ToTable("Engineers");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.FullName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Bio).HasColumnType("text").IsRequired();
            entity.Property(x => x.Specialization).HasMaxLength(200).IsRequired();
            entity.Property(x => x.ProfileImageUrl).HasMaxLength(1000);
            entity.Property(x => x.City).HasMaxLength(120).IsRequired();
            entity.Property(x => x.PhoneNumber).HasMaxLength(50);
            entity.Property(x => x.Email).HasMaxLength(256).IsRequired();
            entity.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired().HasDefaultValue("");
            entity.Property(x => x.Role).HasMaxLength(50).IsRequired().HasDefaultValue("Engineer");
            entity.Property(x => x.Status)
                .HasConversion<string>()
                .HasMaxLength(20)
                .HasDefaultValue(EngineerStatus.Pending);
            entity.Property(x => x.IsApproved).HasDefaultValue(false);
            entity.Property(x => x.IsTrialActive).HasDefaultValue(false);
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasIndex(x => x.Status);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Name).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(150).IsRequired();
            entity.HasIndex(x => x.Name).IsUnique();
            entity.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(200).IsRequired();
            entity.Property(x => x.Description).HasColumnType("text").IsRequired();
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasOne(x => x.Category)
                .WithMany(x => x.Projects)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Engineer)
                .WithMany(x => x.Projects)
                .HasForeignKey(x => x.EngineerId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.CategoryId);
            entity.HasIndex(x => x.EngineerId);
        });

        modelBuilder.Entity<ProjectImage>(entity =>
        {
            entity.ToTable("ProjectImages");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ImageUrl).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.DisplayOrder).HasDefaultValue(0);
            entity.HasOne(x => x.Project)
                .WithMany(x => x.ProjectImages)
                .HasForeignKey(x => x.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.ProjectId);
        });

        modelBuilder.Entity<ContactRequest>(entity =>
        {
            entity.ToTable("ContactRequests");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.CustomerName).HasMaxLength(200).IsRequired();
            entity.Property(x => x.CustomerEmail).HasMaxLength(256).IsRequired();
            entity.Property(x => x.CustomerPhone).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Message).HasColumnType("text").IsRequired();
            entity.Property(x => x.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.Property(x => x.IsRead).HasDefaultValue(false);
            entity.HasOne(x => x.Engineer)
                .WithMany(x => x.ContactRequests)
                .HasForeignKey(x => x.EngineerId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(x => x.EngineerId);
            entity.HasIndex(x => x.IsRead);
        });
    }
}
