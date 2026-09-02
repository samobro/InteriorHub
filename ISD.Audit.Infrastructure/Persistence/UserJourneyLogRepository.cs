using ISD.Aduit.Infrastructure.Persistence;
using ISD.Audit.Domain.Models;

namespace ISD.Audit.Infrastructure.Persistence;

public sealed class UserJourneyLogRepository : IUserJourneyLogRepository
{
    private readonly AuditDbContext _context;

    public UserJourneyLogRepository(AuditDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(UserJourneyLog log, CancellationToken cancellationToken = default)
    {
        await _context.UserJourneyLogs.AddAsync(log, cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<UserJourneyLog> logs, CancellationToken cancellationToken = default)
    {
        await _context.UserJourneyLogs.AddRangeAsync(logs, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}