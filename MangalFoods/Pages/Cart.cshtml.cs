using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class CartModel : PageModel
{
    public void OnGet()
    {
        ViewData["Title"] = "Cart";
        ViewData["Description"] = "Review your selected sweets, savouries, and gift hampers.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/cart";
    }
}
