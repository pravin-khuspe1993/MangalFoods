namespace MangalFoods.Models;

public sealed class Order
{
    public string Reference { get; set; } = string.Empty;
    public List<CartItem> Items { get; set; } = [];
    public Customer Customer { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal DeliveryCharge { get; set; }
    public decimal GrandTotal { get; set; }
}
