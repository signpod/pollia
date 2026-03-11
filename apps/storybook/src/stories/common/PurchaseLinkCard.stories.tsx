import { PurchaseLinkCard } from "@repo/ui/components";
import type { Meta, StoryObj } from "@storybook/nextjs";

const MOCK_ITEM = {
  purchaseUrl: "https://example.com/1",
  imageUrl: "https://picsum.photos/seed/product1/200",
  name: "[이연복의 목란] 짜장면 2인분",
  price: 8982,
  discount: 10,
};

const MOCK_ITEMS = [
  MOCK_ITEM,
  {
    purchaseUrl: "https://example.com/2",
    imageUrl: "https://picsum.photos/seed/product2/200",
    name: "양장피 3인분",
    price: 15900,
    discount: 15,
  },
  {
    purchaseUrl: "https://example.com/3",
    imageUrl: "https://picsum.photos/seed/product3/200",
    name: "탕수육 2인분",
    price: 12500,
  },
  {
    purchaseUrl: "https://example.com/4",
    imageUrl: "https://picsum.photos/seed/product4/200",
    name: "깐풍기 1인분",
    price: 9800,
    discount: 5,
  },
];

const meta: Meta<typeof PurchaseLinkCard> = {
  title: "Common/PurchaseLinkCard",
  component: PurchaseLinkCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div style={{ width: 375, padding: 16 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleItem: Story = {
  args: {
    items: [MOCK_ITEMS[0]!],
  },
};

export const TwoItems: Story = {
  args: {
    items: MOCK_ITEMS.slice(0, 2),
  },
};

export const ThreeItems: Story = {
  args: {
    items: MOCK_ITEMS.slice(0, 3),
  },
};

export const FourItems: Story = {
  args: {
    items: MOCK_ITEMS,
  },
};

export const WithoutDiscount: Story = {
  args: {
    items: [
      {
        purchaseUrl: "https://example.com/1",
        imageUrl: "https://picsum.photos/seed/product1/200",
        name: "[이연복의 목란] 짜장면 2인분",
        price: 9980,
      },
    ],
  },
};
