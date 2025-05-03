namespace BookStore.Core.Common;

/// <summary>
/// Represents a paginated result of an operation
/// </summary>
/// <typeparam name="T">The type of data returned by the operation</typeparam>
public class PaginatedResult<T>
{
    public bool Success { get; private set; }
    public List<T>? Data { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public List<string> Errors { get; private set; } = new();
    public int Page { get; private set; }
    public int PageSize { get; private set; }
    public int TotalCount { get; private set; }
    public int TotalPages { get; private set; }
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    /// <summary>
    /// Creates a successful paginated result
    /// </summary>
    public static PaginatedResult<T> SuccessResult(
        List<T> data,
        int page,
        int pageSize,
        int totalCount,
        string message = "Operation completed successfully")
    {
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PaginatedResult<T>
        {
            Success = true,
            Data = data,
            Message = message,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages
        };
    }

    /// <summary>
    /// Creates a failed paginated result with error message
    /// </summary>
    public static PaginatedResult<T> FailureResult(string message, List<string>? errors = null)
    {
        return new PaginatedResult<T>
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }

    /// <summary>
    /// Creates a failed paginated result with error messages
    /// </summary>
    public static PaginatedResult<T> FailureResult(List<string> errors)
    {
        return new PaginatedResult<T>
        {
            Success = false,
            Message = "Operation failed",
            Errors = errors
        };
    }
}
