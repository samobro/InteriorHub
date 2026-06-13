namespace InteriorHub.Application.Common.Exceptions;

public sealed class ForbiddenException(string message) : AppException(message);
