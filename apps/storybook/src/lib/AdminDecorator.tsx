// import "@/app/admin/admin.css";
import type { Decorator } from "@storybook/react";

export const AdminDecorator: Decorator = Story => (
  <div className="admin-root">
    <Story />
  </div>
);
