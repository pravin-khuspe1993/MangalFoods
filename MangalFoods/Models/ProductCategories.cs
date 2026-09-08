namespace MangalFoods.Models;

public static class ProductCategories
{
    public const string Sweets = "Sweets";
    public const string Savouries = "Savouries";
    public const string GiftHampers = "Gift Hampers";
    public const string FestiveCollection = "Festive Collection";
    public const string CorporateGifting = "Corporate Gifting";

    public static readonly IReadOnlyList<string> All =
    [
        Sweets,
        Savouries,
        GiftHampers,
        FestiveCollection,
        CorporateGifting
    ];
}
