using MangalFoods.Models;
using MangalFoods.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class IndexModel : PageModel
{
    private readonly IProductService productService;

    public IndexModel(IProductService productService)
    {
        this.productService = productService;
    }

    public IReadOnlyList<Product> FeaturedProducts { get; private set; } = [];
    public IReadOnlyList<Product> Bestsellers { get; private set; } = [];
    public IReadOnlyList<Product> PremiumSweets { get; private set; } = [];
    public IReadOnlyList<Product> Savouries { get; private set; } = [];
    public IReadOnlyList<Product> Gifting { get; private set; } = [];
    public IReadOnlyList<Product> FestiveCollection { get; private set; } = [];
    public IReadOnlyList<Product> CorporateGifting { get; private set; } = [];
    public IReadOnlyList<Product> Laddoos { get; private set; } = [];

    public async Task OnGetAsync()
    {
        var allProducts = await productService.GetAllAsync();
        FeaturedProducts = allProducts.Where(p => p.IsFeatured).Take(8).ToList();
        Bestsellers = allProducts.Where(p => p.IsBestseller).Take(8).ToList();
        PremiumSweets = allProducts.Where(p => p.Category == ProductCategories.Sweets).Take(4).ToList();
        Savouries = allProducts.Where(p => p.Category == ProductCategories.Savouries).Take(4).ToList();
        Gifting = allProducts.Where(p => p.Category == ProductCategories.GiftHampers).Take(4).ToList();
        FestiveCollection = allProducts.Where(p => p.Category == ProductCategories.FestiveCollection).Take(4).ToList();
        CorporateGifting = allProducts.Where(p => p.Category == ProductCategories.CorporateGifting).Take(4).ToList();
        Laddoos = allProducts
            .Where(p => p.Tags.Any(tag => tag.Equals("ladoo", StringComparison.OrdinalIgnoreCase) || tag.Equals("laddoo", StringComparison.OrdinalIgnoreCase)))
            .Take(8)
            .ToList();

        ViewData["Title"] = "Premium Indian Sweets, Savouries & Gifting";
        ViewData["Description"] = "Shop premium Indian sweets, savouries, festive collections, and elegant gift hampers.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/";
        ViewData["OgImage"] = "/images/banners/hero-premium-sweets.webp";
    }
}
