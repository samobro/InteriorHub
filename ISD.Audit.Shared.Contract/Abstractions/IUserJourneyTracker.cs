using ISD.Audit.Shared.Contract.Events;

namespace ISD.Audit.Shared.Contract.Abstractions;

public interface IUserJourneyTracker
{
    Task TrackAsync(UserJourneyTrackedEvent journeyEvent, CancellationToken cancellationToken = default);
}
