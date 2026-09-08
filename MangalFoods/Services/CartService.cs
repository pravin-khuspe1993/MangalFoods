namespace MangalFoods.Services;

public interface ICartService
{
    decimal CalculateDeliveryCharge(decimal subtotal, decimal deliveryCharge, decimal freeDeliveryThreshold);
    decimal CalculateGrandTotal(decimal subtotal, decimal deliveryCharge);
}

public sealed class CartService : ICartService
{
    public decimal CalculateDeliveryCharge(decimal subtotal, decimal deliveryCharge, decimal freeDeliveryThreshold)
    {
        if (subtotal <= 0)
        {
            return 0;
        }

        return subtotal >= freeDeliveryThreshold ? 0 : deliveryCharge;
    }

    public decimal CalculateGrandTotal(decimal subtotal, decimal deliveryCharge)
    {
        return subtotal + deliveryCharge;
    }
}
