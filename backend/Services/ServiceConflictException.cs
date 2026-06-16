namespace backend.Services;

public sealed class ServiceConflictException : Exception
{
    public ServiceConflictException(string message)
        : base(message)
    {
    }
}
