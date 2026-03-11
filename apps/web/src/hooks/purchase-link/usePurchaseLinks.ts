import type { PurchaseLinkItem } from "@repo/ui/components";

const PURCHASE_LINKS_MAP: Record<string, PurchaseLinkItem[]> = {
  cmm2wbg1000121hcvsawr75o2: [
    {
      name: "해남 달망 밤고구마, 5kg(한입), 1박스",
      purchaseUrl:
        "https://www.coupang.com/vp/products/9094592549?vendorItemId=85226038740&sourceType=HOME_GW_PROMOTION&searchId=feed-045c31dc47c045b99b345fd4843dfd73-3.33.107%3Agw_promotion://www.google.com",
      imageUrl: "/images/product-01.png",
      price: 10000,
      discount: 10,
    },
  ],
};

export function usePurchaseLinks(missionId: string): PurchaseLinkItem[] | null {
  return PURCHASE_LINKS_MAP[missionId] ?? null;
}
