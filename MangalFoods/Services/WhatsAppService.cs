using System.Globalization;
using System.Text;
using MangalFoods.Configuration;
using MangalFoods.Models;
using Microsoft.Extensions.Options;

namespace MangalFoods.Services;

public interface IWhatsAppService
{
    string BuildOrderUrl(Order order, IEnumerable<(Product Product, string Variant, int Quantity, decimal UnitPrice)> lines);
}

public sealed class WhatsAppService : IWhatsAppService
{
    private readonly SiteSettings siteSettings;

    public WhatsAppService(IOptions<SiteSettings> siteSettings)
    {
        this.siteSettings = siteSettings.Value;
    }

    public string BuildOrderUrl(Order order, IEnumerable<(Product Product, string Variant, int Quantity, decimal UnitPrice)> lines)
    {
        var message = BuildMessage(order, lines);
        return $"https://wa.me/{siteSettings.WhatsAppNumber}?text={Uri.EscapeDataString(message)}";
    }

    private static string BuildMessage(Order order, IEnumerable<(Product Product, string Variant, int Quantity, decimal UnitPrice)> lines)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Hello, I would like to place an order.");
        sb.AppendLine();
        sb.AppendLine($"Order Ref: {order.Reference}");
        sb.AppendLine();
        sb.AppendLine("ORDER DETAILS");
        sb.AppendLine("------------------------");

        foreach (var line in lines)
        {
            var lineSubtotal = line.UnitPrice * line.Quantity;
            sb.AppendLine($"Product: {line.Product.Name}");
            sb.AppendLine($"Variant: {line.Variant}");
            sb.AppendLine($"Quantity: {line.Quantity}");
            sb.AppendLine($"Unit Price: {FormatInr(line.UnitPrice)}");
            sb.AppendLine($"Subtotal: {FormatInr(lineSubtotal)}");
            sb.AppendLine();
        }

        sb.AppendLine("------------------------");
        sb.AppendLine($"Subtotal: {FormatInr(order.Subtotal)}");
        sb.AppendLine($"Delivery: {(order.DeliveryCharge == 0 ? "FREE" : FormatInr(order.DeliveryCharge))}");
        sb.AppendLine($"TOTAL: {FormatInr(order.GrandTotal)}");
        sb.AppendLine();

        sb.AppendLine("CUSTOMER DETAILS");
        sb.AppendLine("------------------------");
        sb.AppendLine($"Name: {order.Customer.FullName}");
        sb.AppendLine($"Mobile: {order.Customer.MobileNumber}");
        sb.AppendLine($"WhatsApp: {order.Customer.WhatsAppNumber}");
        sb.AppendLine($"Email: {order.Customer.Email}");
        sb.AppendLine();

        sb.AppendLine("DELIVERY ADDRESS");
        sb.AppendLine("------------------------");
        sb.AppendLine($"Address: {order.Customer.Address}");
        sb.AppendLine($"Landmark: {order.Customer.Landmark}");
        sb.AppendLine($"City: {order.Customer.City}");
        sb.AppendLine($"State: {order.Customer.State}");
        sb.AppendLine($"PIN: {order.Customer.PinCode}");
        sb.AppendLine();

        sb.AppendLine("GIFT MESSAGE");
        sb.AppendLine("------------------------");
        sb.AppendLine(string.IsNullOrWhiteSpace(order.Customer.GiftMessage) ? "N/A" : order.Customer.GiftMessage);
        sb.AppendLine();

        sb.AppendLine("SPECIAL INSTRUCTIONS");
        sb.AppendLine("------------------------");
        sb.AppendLine(string.IsNullOrWhiteSpace(order.Customer.SpecialInstructions) ? "N/A" : order.Customer.SpecialInstructions);
        sb.AppendLine();

        sb.AppendLine("Please confirm my order.");

        return sb.ToString();
    }

    private static string FormatInr(decimal amount)
    {
        return string.Format(CultureInfo.GetCultureInfo("en-IN"), "₹{0:N0}", amount);
    }
}
