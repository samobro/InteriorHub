using InteriorHub.Domain.Entities;
using InteriorHub.Domain.Interfaces;

namespace InteriorHub.Application.Interfaces;

public interface IUnitOfWork
{
    IGenericRepository<Engineer> Engineers { get; }
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<Project> Projects { get; }
    IGenericRepository<ProjectImage> ProjectImages { get; }
    IGenericRepository<ContactRequest> ContactRequests { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
