using MangalFoods.Models;
using MangalFoods.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class SweetsModel : PageModel
{
    private readonly IProductService productService;

    public SweetsModel(IProductService productService)
    {
        this.productService = productService;
    }

    public IReadOnlyList<Product> Products { get; private set; } = [];

    public async Task OnGetAsync()
    {
        var all = await productService.GetAllAsync();
        Products = all.Where(p => p.Category == ProductCategories.Sweets).ToList();

        ViewData["Title"] = "Sweets";
        ViewData["Description"] = "Handcrafted premium Indian sweets made for gifting and celebrations.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/sweets";
        ViewData["OgImage"] = "/images/categories/sweets.webp";
    }
}
