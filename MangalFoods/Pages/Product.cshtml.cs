using MangalFoods.Models;
using MangalFoods.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class ProductModel : PageModel
{
    private readonly IProductService productService;

    public ProductModel(IProductService productService)
    {
        this.productService = productService;
    }

    public Product? Product { get; private set; }

    public async Task<IActionResult> OnGetAsync(string slug)
    {
        Product = await productService.GetBySlugAsync(slug);
        if (Product is null)
        {
            return NotFound();
        }

        ViewData["Title"] = Product.Name;
        ViewData["Description"] = Product.ShortDescription;
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/product/{Product.Slug}";
        ViewData["OgImage"] = Product.Images.FirstOrDefault();
        return Page();
    }
}
