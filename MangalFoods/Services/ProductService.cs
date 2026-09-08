using System.Text.Json;
using MangalFoods.Models;

namespace MangalFoods.Services;

public interface IProductService
{
    Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Product?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}

public sealed class ProductService : IProductService
{
    private readonly IWebHostEnvironment webHostEnvironment;
    private readonly JsonSerializerOptions jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private IReadOnlyList<Product>? products;
    private readonly SemaphoreSlim loadLock = new(1, 1);

    public ProductService(IWebHostEnvironment webHostEnvironment)
    {
        this.webHostEnvironment = webHostEnvironment;
    }

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        if (products is not null)
        {
            return products;
        }

        await loadLock.WaitAsync(cancellationToken);
        try
        {
            if (products is not null)
            {
                return products;
            }

            var filePath = Path.Combine(webHostEnvironment.WebRootPath, "data", "products.json");
            if (!File.Exists(filePath))
            {
                products = [];
                return products;
            }

            await using var stream = File.OpenRead(filePath);
            var loaded = await JsonSerializer.DeserializeAsync<List<Product>>(stream, jsonOptions, cancellationToken);
            products = loaded ?? [];
            return products;
        }
        finally
        {
            loadLock.Release();
        }
    }

    public async Task<Product?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return null;
        }

        var allProducts = await GetAllAsync(cancellationToken);
        return allProducts.FirstOrDefault(p => p.Slug.Equals(slug, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<Product?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var allProducts = await GetAllAsync(cancellationToken);
        return allProducts.FirstOrDefault(p => p.Id == id);
    }
}
