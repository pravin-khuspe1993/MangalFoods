namespace MangalFoods.Models;

public sealed class CartItem
{
    public int ProductId { get; set; }
    public string Variant { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
