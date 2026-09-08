using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class ContactModel : PageModel
{
    public void OnGet()
    {
        ViewData["Title"] = "Contact";
        ViewData["Description"] = "Connect with us for orders, gifting, and bulk requirements.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/contact";
    }
}
