using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace MangalFoods.Pages;

public class CheckoutModel : PageModel
{
    [BindProperty]
    public CheckoutInput Input { get; set; } = new();

    public void OnGet()
    {
        ViewData["Title"] = "Checkout";
        ViewData["Description"] = "Enter delivery details and place your order on WhatsApp.";
        ViewData["CanonicalUrl"] = $"{Request.Scheme}://{Request.Host}/checkout";
    }

    public IActionResult OnPost()
    {
        if (!ModelState.IsValid)
        {
            return Page();
        }

        return Page();
    }

    public sealed class CheckoutInput
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^[6-9][0-9]{9}$", ErrorMessage = "Enter a valid Indian mobile number.")]
        public string MobileNumber { get; set; } = string.Empty;

        [RegularExpression("^$|^[6-9][0-9]{9}$", ErrorMessage = "Enter a valid WhatsApp number.")]
        public string WhatsAppNumber { get; set; } = string.Empty;

        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        public string Landmark { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string State { get; set; } = string.Empty;

        [Required]
        [RegularExpression("^[0-9]{6}$", ErrorMessage = "PIN code must be exactly 6 digits.")]
        public string PinCode { get; set; } = string.Empty;

        public string GiftMessage { get; set; } = string.Empty;

        public string SpecialInstructions { get; set; } = string.Empty;
    }
}
