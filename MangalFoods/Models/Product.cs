namespace MangalFoods.Models;

public sealed class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public List<string> Images { get; set; } = [];
    public List<ProductVariant> Variants { get; set; } = [];
    public List<string> Tags { get; set; } = [];
    public bool IsFeatured { get; set; }
    public bool IsBestseller { get; set; }
    public decimal Rating { get; set; }
    public string Ingredients { get; set; } = string.Empty;
    public string ShelfLife { get; set; } = string.Empty;
    public string StorageInstructions { get; set; } = string.Empty;
    public bool Vegetarian { get; set; }
}
