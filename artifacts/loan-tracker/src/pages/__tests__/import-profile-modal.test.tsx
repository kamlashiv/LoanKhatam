/**
 * @jest-environment jsdom
 *
 * Interaction test for the statement-import review card (ImportProfileModal).
 *
 * The pure averaging logic is unit-tested in
 * `src/lib/__tests__/month-breakdown.test.ts`; this test covers the interactive
 * wiring that lives inside the (auth-gated) upload modal and is otherwise only
 * checked by typecheck:
 *   - the month chips are seeded from the extracted `breakdown`,
 *   - editing a chip and excluding a month both update the displayed
 *     "Avg of N month(s)" header and the category's recomputed value, and
 *   - that recomputed value is what `handleApply` carries into the profile.
 *
 * `extractProfileFromFile` is stubbed to return a fixed multi-month breakdown so
 * no real file parsing (pdfjs/OCR/etc.) runs; everything else is the real
 * component.
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// wouter ships untranspiled ESM and is pulled in by profile.tsx's imports; the
// modal under test never uses it, so stub it out to keep jest's parser happy.
jest.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useLocation: () => ["/", () => {}],
}));

// Keep the real file-extract module (labels, types) but stub the one async
// entry point so the test drives a deterministic extracted profile.
jest.mock("@/lib/file-extract", () => {
  const actual = jest.requireActual("@/lib/file-extract");
  return { ...actual, extractProfileFromFile: jest.fn() };
});

import { ImportProfileModal } from "../profile";
import { extractProfileFromFile, type ExtractedProfile } from "@/lib/file-extract";

const mockExtract = extractProfileFromFile as jest.MockedFunction<
  typeof extractProfileFromFile
>;

// Only `food` is populated so the review card has a single row whose final
// value is unambiguous; its breakdown spans three months within one year (so
// labels stay as plain month names: "Jan", "Feb", "Mar").
function foodProfile(): ExtractedProfile {
  return {
    name: null,
    monthlyIncome: null,
    additionalIncome: null,
    rent: null,
    insurance: null,
    utilities: null,
    internet: null,
    schoolFees: null,
    food: 6000, // aggregate average of the months below
    fuel: null,
    travel: null,
    entertainment: null,
    shopping: null,
    medical: null,
    confidence: "high",
    notes: "Test statement",
    breakdown: {
      food: [
        { month: "2026-01", total: 9000 },
        { month: "2026-02", total: 6000 },
        { month: "2026-03", total: 3000 },
      ],
    },
  };
}

// Render the modal and drive the (mocked) upload to reach the review state.
async function renderReviewing(onApply = jest.fn()) {
  mockExtract.mockResolvedValue(foodProfile());
  const onClose = jest.fn();
  const { container } = render(
    <ImportProfileModal onClose={onClose} onApply={onApply} />,
  );
  const fileInput = container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  const file = new File(["statement"], "statement.csv", { type: "text/csv" });
  fireEvent.change(fileInput, { target: { files: [file] } });
  // Wait for the async extraction to resolve and the review card to render.
  await screen.findByText(/Avg of 3 months/);
  return { onApply, onClose };
}

describe("ImportProfileModal review card", () => {
  beforeEach(() => mockExtract.mockReset());

  it("seeds the month chips and category value from the breakdown", async () => {
    await renderReviewing();
    // Header reflects all three kept months.
    expect(screen.getByText(/Avg of 3 months/)).toBeInTheDocument();
    // Each month chip is seeded with its extracted total.
    expect(screen.getByLabelText("Food amount for Jan")).toHaveValue(9000);
    expect(screen.getByLabelText("Food amount for Feb")).toHaveValue(6000);
    expect(screen.getByLabelText("Food amount for Mar")).toHaveValue(3000);
    // Category row shows the seeded average.
    expect(screen.getByLabelText("Food value")).toHaveValue(6000);
  });

  it("recomputes the category value when a month chip is edited", async () => {
    await renderReviewing();
    // Edit Jan 9000 -> 3000: avg(3000, 6000, 3000) = 4000.
    fireEvent.change(screen.getByLabelText("Food amount for Jan"), {
      target: { value: "3000" },
    });
    // Count is unchanged (no month excluded), value recomputes.
    expect(screen.getByText(/Avg of 3 months/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByLabelText("Food value")).toHaveValue(4000),
    );
  });

  it("drops an excluded month from the count and the recomputed value", async () => {
    await renderReviewing();
    // Exclude Mar (3000): kept Jan(9000) + Feb(6000), avg = 7500.
    fireEvent.click(screen.getByLabelText("Exclude Mar"));
    await screen.findByText(/Avg of 2 months/);
    expect(screen.getByLabelText("Food value")).toHaveValue(7500);
  });

  it("carries the recomputed value into the applied profile patch", async () => {
    const onApply = jest.fn();
    await renderReviewing(onApply);
    // Edit Jan 9000 -> 3000 and exclude Mar(3000): kept Jan(3000) + Feb(6000),
    // avg = 4500.
    fireEvent.change(screen.getByLabelText("Food amount for Jan"), {
      target: { value: "3000" },
    });
    fireEvent.click(screen.getByLabelText("Exclude Mar"));
    await waitFor(() =>
      expect(screen.getByLabelText("Food value")).toHaveValue(4500),
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Apply 1 field to profile/ }),
    );
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({ food: 4500 });
  });
});
