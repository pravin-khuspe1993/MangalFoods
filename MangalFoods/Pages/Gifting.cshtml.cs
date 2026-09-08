using MangalFoods.Models;
using MangalFoods.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class GiftingModel : PageModel
{
    private readonly IProductService productService;

    public GiftingModel(IProductService productService)
    {
        this.productService = productService;
    }

    public IReadOnlyList<Product> Products { get; private set; } = [];

    public async Task OnGetAsync()
    {
        var all = await productService.GetAllAsync();
        Products = all.Where(p => p.Category == ProductCategories.GiftHampers).ToList();

        ViewData["Title"] = "Gifting";
        ViewData["Description"] = "Elegant gift hampers for festive, personal, and corporate occasions.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/gifting";
        ViewData["OgImage"] = "/images/categories/gifting.webp";
    }
}
