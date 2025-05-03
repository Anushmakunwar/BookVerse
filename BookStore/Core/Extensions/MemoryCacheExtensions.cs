using System.Reflection;
using Microsoft.Extensions.Caching.Memory;

namespace BookStore.Core.Extensions;

/// <summary>
/// Extension methods for IMemoryCache
/// </summary>
public static class MemoryCacheExtensions
{
    private static readonly Func<MemoryCache, object>? GetEntriesCollection = CreateCacheEntriesCollectionMethod();
    
    /// <summary>
    /// Gets all keys from the memory cache
    /// </summary>
    public static IEnumerable<T> GetKeys<T>(this IMemoryCache memoryCache)
    {
        if (memoryCache is not MemoryCache cache)
        {
            return Enumerable.Empty<T>();
        }
        
        var entriesCollection = GetEntriesCollection?.Invoke(cache);
        if (entriesCollection == null)
        {
            return Enumerable.Empty<T>();
        }
        
        var keys = new List<T>();
        
        var type = entriesCollection.GetType();
        var entries = type.GetProperty("Entries", BindingFlags.Instance | BindingFlags.NonPublic);
        
        if (entries?.GetValue(entriesCollection) is IDictionary<object, object> collection)
        {
            foreach (var item in collection)
            {
                if (item.Key is T key)
                {
                    keys.Add(key);
                }
            }
        }
        
        return keys;
    }
    
    private static Func<MemoryCache, object>? CreateCacheEntriesCollectionMethod()
    {
        var field = typeof(MemoryCache).GetProperty("EntriesCollection", BindingFlags.NonPublic | BindingFlags.Instance);
        if (field == null)
        {
            return null;
        }
        
        return cache => field.GetValue(cache)!;
    }
}
