using MangalFoods.Models;
using MangalFoods.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class ShopModel : PageModel
{
    private readonly IProductService productService;

    public ShopModel(IProductService productService)
    {
        this.productService = productService;
    }

    [BindProperty(SupportsGet = true)]
    public string? Q { get; set; }

    [BindProperty(SupportsGet = true)]
    public string? Category { get; set; }

    [BindProperty(SupportsGet = true)]
    public decimal? MaxPrice { get; set; }

    [BindProperty(SupportsGet = true)]
    public bool Bestseller { get; set; }

    [BindProperty(SupportsGet = true)]
    public bool Featured { get; set; }

    [BindProperty(SupportsGet = true)]
    public bool Vegetarian { get; set; }

    [BindProperty(SupportsGet = true)]
    public string Sort { get; set; } = "featured";

    public IReadOnlyList<Product> Products { get; private set; } = [];

    public async Task OnGetAsync()
    {
        IEnumerable<Product> query = await productService.GetAllAsync();

        if (!string.IsNullOrWhiteSpace(Q))
        {
            var term = Q.Trim();
            query = query.Where(p =>
                p.Name.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                p.Category.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                p.Description.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                p.Tags.Any(t => t.Contains(term, StringComparison.OrdinalIgnoreCase)));
        }

        if (!string.IsNullOrWhiteSpace(Category) && ProductCategories.All.Contains(Category))
        {
            query = query.Where(p => p.Category.Equals(Category, StringComparison.OrdinalIgnoreCase));
        }

        if (MaxPrice is > 0)
        {
            query = query.Where(p => p.Price <= MaxPrice.Value);
        }

        if (Bestseller)
        {
            query = query.Where(p => p.IsBestseller);
        }

        if (Featured)
        {
            query = query.Where(p => p.IsFeatured);
        }

        if (Vegetarian)
        {
            query = query.Where(p => p.Vegetarian);
        }

        query = Sort switch
        {
            "bestseller" => query.OrderByDescending(p => p.IsBestseller).ThenByDescending(p => p.Rating),
            "price-asc" => query.OrderBy(p => p.Price),
            "price-desc" => query.OrderByDescending(p => p.Price),
            "name-asc" => query.OrderBy(p => p.Name),
            _ => query.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.Rating)
        };

        Products = query.ToList();

        ViewData["Title"] = "Shop";
        ViewData["Description"] = "Explore premium Indian sweets, savouries, and gifting collections.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/shop";
        ViewData["OgImage"] = "/images/categories/gifting.webp";
    }
}
