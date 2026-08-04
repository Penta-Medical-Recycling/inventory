import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import PentaContext from "../../context/PentaContext";
import Pagination from "./Pagination";

function renderPagination(context) {
  return render(
    <PentaContext.Provider value={context}>
      <Pagination bottom={false} />
    </PentaContext.Provider>
  );
}

describe("Pagination loading state", () => {
  it("does not render while inventory results are loading", () => {
    const { container } = renderPagination({
      page: "Next",
      offset: 0,
      setOffset: vi.fn(),
      isLoading: true,
      setIsLoading: vi.fn(),
    });

    expect(container.querySelector("#paginator")).not.toBeInTheDocument();
  });

  it("marks results as loading as soon as pagination starts", () => {
    const setIsLoading = vi.fn();
    const setOffset = vi.fn();
    const { container } = renderPagination({
      page: "Next",
      offset: 0,
      setOffset,
      isLoading: false,
      setIsLoading,
    });

    fireEvent.click(container.querySelector(".pag-btn"));

    expect(setIsLoading).toHaveBeenCalledWith(true);
    expect(setOffset).toHaveBeenCalledWith(1);
  });
});