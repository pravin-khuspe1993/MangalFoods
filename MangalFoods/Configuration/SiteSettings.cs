namespace MangalFoods.Configuration;

public sealed class SiteSettings
{
    public const string SectionName = "SiteSettings";

    public string BusinessName { get; set; } = string.Empty;
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string InstagramUrl { get; set; } = string.Empty;
    public string FacebookUrl { get; set; } = string.Empty;
    public decimal DeliveryCharge { get; set; }
    public decimal FreeDeliveryThreshold { get; set; }
    public bool WhatsAppDryRun { get; set; }
}
