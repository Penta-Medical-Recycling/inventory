import { describe, expect, it } from "vitest";
import { render, screen, userEvent } from "../../test/utils";
import InventoryGroupCard from "./InventoryGroupCard";

describe("InventoryGroupCard", () => {
  const group = {
    key: "adb-m",
    title: "Double Adapter - Male",
    imageUrl: "https://example.com/adb-m.png",
    skuCodes: ["ADB-M"],
  };

  it("renders the group image and opens the group", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<InventoryGroupCard group={group} onSelect={onSelect} />);

    expect(screen.getByAltText("Double Adapter - Male inventory")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Browse Double Adapter - Male" }));
    expect(onSelect).toHaveBeenCalledWith(group);
  });

  it("renders every image as a cross-fade slide when the group has multiple", () => {
    render(
      <InventoryGroupCard
        group={{
          ...group,
          imageUrls: ["https://example.com/a.png", "https://example.com/b.png"],
        }}
        onSelect={() => {}}
      />
    );

    expect(screen.getByAltText("Double Adapter - Male inventory 1")).toBeInTheDocument();
    expect(screen.getByAltText("Double Adapter - Male inventory 2")).toBeInTheDocument();
  });

  it("renders a placeholder when no image is configured", () => {
    render(
      <InventoryGroupCard
        group={{ ...group, imageUrl: null }}
        onSelect={() => {}}
      />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Double Adapter - Male")).toBeInTheDocument();
  });
});
