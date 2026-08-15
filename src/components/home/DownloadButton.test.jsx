import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PentaContext from "../../context/PentaContext";
import { render, screen, userEvent } from "../../test/utils";
import DownloadButton from "./DownloadButton";

describe("DownloadButton", () => {
  it("opens the export format menu", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <PentaContext.Provider
          value={{
            isDownloading: false,
            setIsDownloading: vi.fn(),
            urlCreator: vi.fn(),
            fetchAPI: vi.fn(),
            inventoryGroups: [],
          }}
        >
          <DownloadButton />
        </PentaContext.Provider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Export inventory" }));

    expect(await screen.findByRole("menuitem", { name: ".csv" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: ".xlsx" })).toBeInTheDocument();
  });
});