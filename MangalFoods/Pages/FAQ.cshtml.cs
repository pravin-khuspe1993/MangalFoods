using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class FaqModel : PageModel
{
    public void OnGet()
    {
        ViewData["Title"] = "FAQ";
        ViewData["Description"] = "Frequently asked questions about delivery, freshness, and gifting.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/faq";
    }
}
