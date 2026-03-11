import { cn } from "../../lib/utils";

export interface PurchaseLinkItem {
  purchaseUrl: string;
  imageUrl: string;
  name: string;
  price: number;
  discount?: number;
}

export interface PurchaseLinkCardProps {
  items: PurchaseLinkItem[];
}

function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

function SingleItem({ item }: { item: PurchaseLinkItem }) {
  return (
    <a
      href={item.purchaseUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 flex-col items-center gap-2"
    >
      <div className="size-[120px] shrink-0 overflow-hidden rounded-xl border border-default">
        <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
      </div>
      <div className="flex flex-col items-center text-[14px] leading-[1.5] w-full">
        <p className="font-bold truncate max-w-full">{item.name}</p>
        <div className="flex items-center gap-1 font-semibold">
          {item.discount != null && item.discount > 0 && (
            <span className="text-red-500">{item.discount}%</span>
          )}
          <span>{formatPrice(item.price)}</span>
        </div>
      </div>
    </a>
  );
}

function GridItem({ item }: { item: PurchaseLinkItem }) {
  return (
    <a
      href={item.purchaseUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 flex-col items-start gap-2 min-w-0"
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-default">
        <img src={item.imageUrl} alt={item.name} className="size-full object-cover" />
      </div>
      <div className="flex flex-col items-start text-[14px] leading-[1.5] w-full">
        <p className="font-bold truncate max-w-full">{item.name}</p>
        <div className="flex items-center gap-1 font-semibold">
          {item.discount != null && item.discount > 0 && (
            <span className="text-red-500">{item.discount}%</span>
          )}
          <span>{formatPrice(item.price)}</span>
        </div>
      </div>
    </a>
  );
}

export function PurchaseLinkCard({ items }: PurchaseLinkCardProps) {
  if (items.length === 0) return null;

  if (items.length === 1) {
    return (
      <div
        className={cn(
          "flex items-center rounded-2xl bg-white px-2 py-3",
          "shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]",
        )}
      >
        <SingleItem item={items[0]!} />
      </div>
    );
  }

  if (items.length <= 3) {
    return (
      <div
        className={cn(
          "flex gap-2 items-center rounded-2xl bg-white p-2",
          "shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]",
        )}
      >
        {items.map(item => (
          <GridItem key={item.purchaseUrl} item={item} />
        ))}
      </div>
    );
  }

  const displayItems = items.slice(0, 4);
  return (
    <div
      className={cn(
        "flex flex-col gap-4 items-start justify-center rounded-2xl bg-white p-2",
        "shadow-[0px_4px_20px_0px_rgba(9,9,11,0.08)]",
      )}
    >
      <div className="flex gap-2 w-full">
        {displayItems.slice(0, 2).map(item => (
          <GridItem key={item.purchaseUrl} item={item} />
        ))}
      </div>
      <div className="flex gap-2 w-full">
        {displayItems.slice(2, 4).map(item => (
          <GridItem key={item.purchaseUrl} item={item} />
        ))}
      </div>
    </div>
  );
}
