using MangalFoods.Models;
using MangalFoods.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class SavouriesModel : PageModel
{
    private readonly IProductService productService;

    public SavouriesModel(IProductService productService)
    {
        this.productService = productService;
    }

    public IReadOnlyList<Product> Products { get; private set; } = [];

    public async Task OnGetAsync()
    {
        var all = await productService.GetAllAsync();
        Products = all.Where(p => p.Category == ProductCategories.Savouries).ToList();

        ViewData["Title"] = "Savouries";
        ViewData["Description"] = "Discover premium savoury snacks crafted with quality ingredients.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/savouries";
        ViewData["OgImage"] = "/images/categories/savouries.webp";
    }
}
