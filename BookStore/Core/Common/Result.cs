namespace BookStore.Core.Common;

/// <summary>
/// Represents the result of an operation with a standardized format
/// </summary>
/// <typeparam name="T">The type of data returned by the operation</typeparam>
public class Result<T>
{
    public bool Success { get; private set; }
    public T? Data { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public List<string> Errors { get; private set; } = new();
    
    /// <summary>
    /// Creates a successful result with data
    /// </summary>
    public static Result<T> SuccessResult(T data, string message = "Operation completed successfully")
    {
        return new Result<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }
    
    /// <summary>
    /// Creates a failed result with error message
    /// </summary>
    public static Result<T> FailureResult(string message, List<string>? errors = null)
    {
        return new Result<T>
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }
    
    /// <summary>
    /// Creates a failed result with error messages
    /// </summary>
    public static Result<T> FailureResult(List<string> errors)
    {
        return new Result<T>
        {
            Success = false,
            Message = "Operation failed",
            Errors = errors
        };
    }
}

/// <summary>
/// Non-generic version of Result for operations that don't return data
/// </summary>
public class Result
{
    public bool Success { get; private set; }
    public string Message { get; private set; } = string.Empty;
    public List<string> Errors { get; private set; } = new();
    
    /// <summary>
    /// Creates a successful result
    /// </summary>
    public static Result SuccessResult(string message = "Operation completed successfully")
    {
        return new Result
        {
            Success = true,
            Message = message
        };
    }
    
    /// <summary>
    /// Creates a failed result with error message
    /// </summary>
    public static Result FailureResult(string message, List<string>? errors = null)
    {
        return new Result
        {
            Success = false,
            Message = message,
            Errors = errors ?? new List<string>()
        };
    }
    
    /// <summary>
    /// Creates a failed result with error messages
    /// </summary>
    public static Result FailureResult(List<string> errors)
    {
        return new Result
        {
            Success = false,
            Message = "Operation failed",
            Errors = errors
        };
    }
}
