import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

const stat = (label: string) => Number(screen.getByText(label).previousSibling?.textContent);
/** Queue Math.random values: two per card (rank index /13, suit index /4). */
const cards = (...ranks: number[]) => {
  const spy = vi.spyOn(Math, "random");
  for (const r of ranks) spy.mockReturnValueOnce((r + 0.5) / 13).mockReturnValueOnce(0);
};

describe("App", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("restores the persisted best streak", () => {
    localStorage.setItem("highlow-best", "7");
    render(<App />);
    expect(stat("Best")).toBe(7);
  });

  it("arrow keys guess and a new best is persisted", () => {
    cards(6, 12); // 7, then K
    render(<App />);
    fireEvent.keyDown(window, { key: "ArrowUp" });
    expect(stat("Streak")).toBe(1);
    expect(localStorage.getItem("highlow-best")).toBe("1");
  });

  it("a tie is a free pass with an accurate message", () => {
    cards(6, 6);
    render(<App />);
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(screen.getByText(/tie, free pass/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /higher/i })).toBeInTheDocument();
  });

  it("Enter starts a new game after losing", () => {
    cards(6, 12);
    render(<App />);
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(screen.getByText(/game over/i)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.queryByText(/game over/i)).not.toBeInTheDocument();
  });
});
