using System.Linq.Expressions;

namespace BookStore.Core.Repository;

/// <summary>
/// Generic repository interface that defines standard operations for working with entities
/// </summary>
/// <typeparam name="TEntity">The entity type this repository works with</typeparam>
public interface IRepository<TEntity> where TEntity : class
{
    /// <summary>
    /// Gets all entities
    /// </summary>
    Task<IEnumerable<TEntity>> GetAllAsync();
    
    /// <summary>
    /// Gets entities based on a predicate
    /// </summary>
    Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate);
    
    /// <summary>
    /// Gets a single entity by its ID
    /// </summary>
    Task<TEntity?> GetByIdAsync(object id);
    
    /// <summary>
    /// Gets a single entity based on a predicate
    /// </summary>
    Task<TEntity?> SingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate);
    
    /// <summary>
    /// Adds a new entity
    /// </summary>
    Task<TEntity> AddAsync(TEntity entity);
    
    /// <summary>
    /// Adds a range of entities
    /// </summary>
    Task AddRangeAsync(IEnumerable<TEntity> entities);
    
    /// <summary>
    /// Updates an existing entity
    /// </summary>
    Task<TEntity?> UpdateAsync(TEntity entity);
    
    /// <summary>
    /// Removes an entity
    /// </summary>
    Task<bool> RemoveAsync(TEntity entity);
    
    /// <summary>
    /// Removes an entity by its ID
    /// </summary>
    Task<bool> RemoveByIdAsync(object id);
    
    /// <summary>
    /// Removes a range of entities
    /// </summary>
    Task RemoveRangeAsync(IEnumerable<TEntity> entities);
    
    /// <summary>
    /// Gets a queryable for the entity
    /// </summary>
    IQueryable<TEntity> Query();
    
    /// <summary>
    /// Gets a paginated list of entities
    /// </summary>
    Task<(IEnumerable<TEntity> Items, int TotalCount)> GetPagedAsync(int page, int pageSize);
}
