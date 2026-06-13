using InteriorHub.Domain.Interfaces;
using InteriorHub.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace InteriorHub.Infrastructure.Repositories;

public sealed class GenericRepository<T>(InteriorHubDbContext context) : IGenericRepository<T> where T : class
{
    private readonly DbSet<T> _dbSet = context.Set<T>();

    public async Task<T?> GetByIdAsync(int id)
        => await _dbSet.FindAsync(id);

    public async Task<IEnumerable<T>> GetAllAsync()
        => await Query().ToListAsync();

    public async Task AddAsync(T entity)
        => await _dbSet.AddAsync(entity);

    public void Update(T entity)
        => _dbSet.Update(entity);

    public void Remove(T entity)
        => _dbSet.Remove(entity);

    public IQueryable<T> Query()
        => _dbSet.AsNoTracking();
}
