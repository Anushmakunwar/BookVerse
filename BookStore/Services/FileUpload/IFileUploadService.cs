using Microsoft.AspNetCore.Http;

namespace BookStore.Services.FileUpload;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(IFormFile file, string folderName);
    Task<bool> DeleteFileAsync(string filePath);
}
