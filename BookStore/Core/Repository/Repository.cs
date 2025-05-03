using System.Linq.Expressions;
using BookStore.DatabaseContext;
using Microsoft.EntityFrameworkCore;

namespace BookStore.Core.Repository;

/// <summary>
/// Generic repository implementation that provides standard operations for working with entities
/// </summary>
/// <typeparam name="TEntity">The entity type this repository works with</typeparam>
public class Repository<TEntity> : IRepository<TEntity> where TEntity : class
{
    protected readonly BookStoreDBContext Context;
    protected readonly DbSet<TEntity> DbSet;
    
    public Repository(BookStoreDBContext context)
    {
        Context = context;
        DbSet = context.Set<TEntity>();
    }
    
    public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
    {
        return await DbSet.ToListAsync();
    }
    
    public virtual async Task<IEnumerable<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate)
    {
        return await DbSet.Where(predicate).ToListAsync();
    }
    
    public virtual async Task<TEntity?> GetByIdAsync(object id)
    {
        return await DbSet.FindAsync(id);
    }
    
    public virtual async Task<TEntity?> SingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate)
    {
        return await DbSet.SingleOrDefaultAsync(predicate);
    }
    
    public virtual async Task<TEntity> AddAsync(TEntity entity)
    {
        await DbSet.AddAsync(entity);
        await Context.SaveChangesAsync();
        return entity;
    }
    
    public virtual async Task AddRangeAsync(IEnumerable<TEntity> entities)
    {
        await DbSet.AddRangeAsync(entities);
        await Context.SaveChangesAsync();
    }
    
    public virtual async Task<TEntity?> UpdateAsync(TEntity entity)
    {
        // Get the entity type and primary key property
        var entityType = Context.Model.FindEntityType(typeof(TEntity));
        if (entityType == null) return null;
        
        var keyProperty = entityType.FindPrimaryKey()?.Properties.FirstOrDefault();
        if (keyProperty == null) return null;
        
        // Get the primary key value
        var keyPropertyName = keyProperty.Name;
        var keyValue = entity.GetType().GetProperty(keyPropertyName)?.GetValue(entity);
        if (keyValue == null) return null;
        
        // Find the existing entity
        var existingEntity = await DbSet.FindAsync(keyValue);
        if (existingEntity == null) return null;
        
        // Update the entity
        Context.Entry(existingEntity).CurrentValues.SetValues(entity);
        await Context.SaveChangesAsync();
        return existingEntity;
    }
    
    public virtual async Task<bool> RemoveAsync(TEntity entity)
    {
        DbSet.Remove(entity);
        await Context.SaveChangesAsync();
        return true;
    }
    
    public virtual async Task<bool> RemoveByIdAsync(object id)
    {
        var entity = await GetByIdAsync(id);
        if (entity == null) return false;
        
        DbSet.Remove(entity);
        await Context.SaveChangesAsync();
        return true;
    }
    
    public virtual async Task RemoveRangeAsync(IEnumerable<TEntity> entities)
    {
        DbSet.RemoveRange(entities);
        await Context.SaveChangesAsync();
    }
    
    public virtual IQueryable<TEntity> Query()
    {
        return DbSet.AsQueryable();
    }
    
    public virtual async Task<(IEnumerable<TEntity> Items, int TotalCount)> GetPagedAsync(int page, int pageSize)
    {
        var totalCount = await DbSet.CountAsync();
        var items = await DbSet
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        
        return (items, totalCount);
    }
}
