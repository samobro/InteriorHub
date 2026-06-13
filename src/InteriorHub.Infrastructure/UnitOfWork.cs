using InteriorHub.Application.Interfaces;
using InteriorHub.Domain.Entities;
using InteriorHub.Domain.Interfaces;
using InteriorHub.Infrastructure.Persistence;
using InteriorHub.Infrastructure.Repositories;

namespace InteriorHub.Infrastructure;

public sealed class UnitOfWork(InteriorHubDbContext context) : IUnitOfWork
{
    private IGenericRepository<Engineer>? _engineers;
    private IGenericRepository<Category>? _categories;
    private IGenericRepository<Project>? _projects;
    private IGenericRepository<ProjectImage>? _projectImages;
    private IGenericRepository<ContactRequest>? _contactRequests;

    public IGenericRepository<Engineer> Engineers => _engineers ??= new GenericRepository<Engineer>(context);
    public IGenericRepository<Category> Categories => _categories ??= new GenericRepository<Category>(context);
    public IGenericRepository<Project> Projects => _projects ??= new GenericRepository<Project>(context);
    public IGenericRepository<ProjectImage> ProjectImages => _projectImages ??= new GenericRepository<ProjectImage>(context);
    public IGenericRepository<ContactRequest> ContactRequests => _contactRequests ??= new GenericRepository<ContactRequest>(context);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => context.SaveChangesAsync(cancellationToken);
}
