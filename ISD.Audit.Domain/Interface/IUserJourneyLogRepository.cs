using ISD.Audit.Domain.Models;

namespace ISD.Aduit.Infrastructure.Persistence;
public interface IUserJourneyLogRepository 
{
    Task AddAsync(UserJourneyLog log, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<UserJourneyLog> logs, CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}