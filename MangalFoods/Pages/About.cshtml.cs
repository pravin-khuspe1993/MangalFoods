using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class AboutModel : PageModel
{
    public void OnGet()
    {
        ViewData["Title"] = "About";
        ViewData["Description"] = "Learn about our brand story and craftsmanship approach.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/about";
        ViewData["OgImage"] = "/images/brand/about-story.webp";
    }
}
