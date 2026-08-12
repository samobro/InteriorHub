namespace AuthModule.Domain.Entities;

public sealed class AuthUser
{
    public int Id { get; private set; }
    public int EngineerId { get; private set; }
    public string PasswordHash { get; private set; } = string.Empty;
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockoutEnd { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastLoginAt { get; private set; }

    private AuthUser()
    {
    }

    public static AuthUser Create(int engineerId, string passwordHash)
    {
        if (engineerId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(engineerId));
        }

        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new ArgumentException("Password hash is required.", nameof(passwordHash));
        }

        return new AuthUser
        {
            EngineerId = engineerId,
            PasswordHash = passwordHash,
            FailedLoginAttempts = 0,
            CreatedAt = DateTime.UtcNow
        };
    }

    public void UpdatePasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new ArgumentException("Password hash is required.", nameof(passwordHash));
        }

        PasswordHash = passwordHash;
    }

    public bool IsLockedOut(DateTime utcNow)
        => LockoutEnd.HasValue && LockoutEnd.Value > utcNow;

    public void RegisterFailedLoginAttempt(int maxFailedAttempts, TimeSpan lockoutDuration, DateTime utcNow)
    {
        if (maxFailedAttempts <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(maxFailedAttempts));
        }

        if (lockoutDuration <= TimeSpan.Zero)
        {
            throw new ArgumentOutOfRangeException(nameof(lockoutDuration));
        }

        FailedLoginAttempts++;

        if (FailedLoginAttempts >= maxFailedAttempts)
        {
            LockoutEnd = utcNow.Add(lockoutDuration);
            FailedLoginAttempts = 0;
        }
    }

    public void RegisterSuccessfulLogin(DateTime utcNow)
    {
        FailedLoginAttempts = 0;
        LockoutEnd = null;
        LastLoginAt = utcNow;
    }

    public void MarkLoggedIn(DateTime utcNow)
        => RegisterSuccessfulLogin(utcNow);
}
