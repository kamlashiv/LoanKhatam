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

// A realistic statement spans several categories at once. Two are plain
// single-value rows with no month breakdown (rent, utilities) and two carry a
// multi-month breakdown that gets averaged (food, fuel). The categories are
// chosen so the review card renders them in field order: rent, utilities, food,
// fuel.
function multiCategoryProfile(): ExtractedProfile {
  return {
    name: null,
    monthlyIncome: null,
    additionalIncome: null,
    rent: 15000, // single value, no breakdown
    insurance: null,
    utilities: 2000, // single value, no breakdown
    internet: null,
    schoolFees: null,
    food: 6000, // avg of the three months below
    fuel: 4000, // avg of the two months below
    travel: null,
    entertainment: null,
    shopping: null,
    medical: null,
    confidence: "high",
    notes: "Multi-category statement",
    breakdown: {
      food: [
        { month: "2026-01", total: 9000 },
        { month: "2026-02", total: 6000 },
        { month: "2026-03", total: 3000 },
      ],
      fuel: [
        { month: "2026-01", total: 5000 },
        { month: "2026-02", total: 3000 },
      ],
    },
  };
}

// Render the modal and drive the (mocked) upload to reach the review state with
// the multi-category profile.
async function renderMultiReviewing(onApply = jest.fn()) {
  mockExtract.mockResolvedValue(multiCategoryProfile());
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
  await screen.findByLabelText("Food value");
  return { onApply, onClose };
}

describe("ImportProfileModal multi-category review card", () => {
  beforeEach(() => mockExtract.mockReset());

  it("renders every extracted category with its seeded value", async () => {
    await renderMultiReviewing();
    expect(screen.getByLabelText("Rent value")).toHaveValue(15000);
    expect(screen.getByLabelText("Utilities value")).toHaveValue(2000);
    expect(screen.getByLabelText("Food value")).toHaveValue(6000);
    expect(screen.getByLabelText("Fuel value")).toHaveValue(4000);
    // Single-value rows have no breakdown chips; only the averaged ones do.
    expect(screen.getByLabelText("Food amount for Jan")).toBeInTheDocument();
    expect(screen.getByLabelText("Fuel amount for Jan")).toBeInTheDocument();
  });

  it("starts with the button counting every checked, non-empty field", async () => {
    await renderMultiReviewing();
    expect(
      screen.getByRole("button", { name: /Apply 4 fields to profile/ }),
    ).toBeInTheDocument();
  });

  it("unchecking a category disables its inputs and drops it from the count", async () => {
    await renderMultiReviewing();
    // Uncheck Food.
    fireEvent.click(screen.getByLabelText("Apply Food"));
    // Its value input and every month chip become disabled.
    expect(screen.getByLabelText("Food value")).toBeDisabled();
    expect(screen.getByLabelText("Food amount for Jan")).toBeDisabled();
    expect(screen.getByLabelText("Food amount for Feb")).toBeDisabled();
    expect(screen.getByLabelText("Food amount for Mar")).toBeDisabled();
    // Other categories stay enabled.
    expect(screen.getByLabelText("Rent value")).not.toBeDisabled();
    expect(screen.getByLabelText("Fuel value")).not.toBeDisabled();
    // The count drops from 4 to 3.
    expect(
      screen.getByRole("button", { name: /Apply 3 fields to profile/ }),
    ).toBeInTheDocument();
  });

  it("button label tracks the number of checked, non-empty fields", async () => {
    await renderMultiReviewing();
    // 4 -> uncheck Rent -> 3.
    fireEvent.click(screen.getByLabelText("Apply Rent"));
    expect(
      screen.getByRole("button", { name: /Apply 3 fields to profile/ }),
    ).toBeInTheDocument();
    // -> uncheck Utilities -> 2.
    fireEvent.click(screen.getByLabelText("Apply Utilities"));
    expect(
      screen.getByRole("button", { name: /Apply 2 fields to profile/ }),
    ).toBeInTheDocument();
    // Clearing a checked field's value also drops it from the count (singular
    // wording kicks in at 1).
    fireEvent.change(screen.getByLabelText("Food value"), {
      target: { value: "" },
    });
    expect(
      screen.getByRole("button", { name: /Apply 1 field to profile/ }),
    ).toBeInTheDocument();
  });

  it("editing one category's months does not affect another's value", async () => {
    await renderMultiReviewing();
    // Edit Fuel Jan 5000 -> 1000: avg(1000, 3000) = 2000.
    fireEvent.change(screen.getByLabelText("Fuel amount for Jan"), {
      target: { value: "1000" },
    });
    await waitFor(() =>
      expect(screen.getByLabelText("Fuel value")).toHaveValue(2000),
    );
    // Food (a different category) is untouched.
    expect(screen.getByLabelText("Food value")).toHaveValue(6000);
    expect(screen.getByLabelText("Food amount for Jan")).toHaveValue(9000);
  });

  it("only checked, non-empty rows land in the applied patch", async () => {
    const onApply = jest.fn();
    await renderMultiReviewing(onApply);
    // Uncheck Utilities so it's excluded from the patch entirely.
    fireEvent.click(screen.getByLabelText("Apply Utilities"));
    // Edit Food's Mar 3000 -> excluded so kept Jan(9000) + Feb(6000) = 7500.
    fireEvent.click(screen.getByLabelText("Exclude Mar"));
    await waitFor(() =>
      expect(screen.getByLabelText("Food value")).toHaveValue(7500),
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Apply 3 fields to profile/ }),
    );
    expect(onApply).toHaveBeenCalledTimes(1);
    // Rent and Fuel keep their seeded values, Food carries its recomputed
    // average, and unchecked Utilities is absent.
    expect(onApply).toHaveBeenCalledWith({
      rent: 15000,
      food: 7500,
      fuel: 4000,
    });
  });
});

// A profile where extraction produced nothing usable: every field is null and
// there is no month breakdown. Drives the "No income or expense values were
// found" empty state inside the success branch.
function emptyProfile(): ExtractedProfile {
  return {
    name: null,
    monthlyIncome: null,
    additionalIncome: null,
    rent: null,
    insurance: null,
    utilities: null,
    internet: null,
    schoolFees: null,
    food: null,
    fuel: null,
    travel: null,
    entertainment: null,
    shopping: null,
    medical: null,
    confidence: "low",
    notes: "Nothing recognizable",
    breakdown: {},
  };
}

// Drive the (mocked) upload to reach whatever state the resolved/rejected
// extraction lands in, without asserting on the review card.
function uploadFile(container: HTMLElement) {
  const fileInput = container.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  const file = new File(["statement"], "statement.csv", { type: "text/csv" });
  fireEvent.change(fileInput, { target: { files: [file] } });
}

describe("ImportProfileModal error and empty states", () => {
  beforeEach(() => mockExtract.mockReset());

  it("shows the error card on a failed extraction and 'Try again' returns to the idle uploader", async () => {
    mockExtract.mockRejectedValue(new Error("Couldn't read the file"));
    const { container } = render(
      <ImportProfileModal onClose={jest.fn()} onApply={jest.fn()} />,
    );
    uploadFile(container);

    // The extraction-failed card surfaces with the thrown message.
    await screen.findByText("Extraction failed");
    expect(screen.getByText("Couldn't read the file")).toBeInTheDocument();

    // "Try again" clears the error and returns to the idle dropzone.
    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    await screen.findByText("Upload or drag a file");
    expect(screen.queryByText("Extraction failed")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });

  it("shows the empty message and hides Apply when no values were extracted", async () => {
    mockExtract.mockResolvedValue(emptyProfile());
    const { container } = render(
      <ImportProfileModal onClose={jest.fn()} onApply={jest.fn()} />,
    );
    uploadFile(container);

    // The all-null profile lands in the success branch but with no review rows.
    await screen.findByText(/No income or expense values were found/);
    // The Apply button is absent (no rows to apply).
    expect(
      screen.queryByRole("button", { name: /to profile/ }),
    ).not.toBeInTheDocument();
    // No category value inputs render either.
    expect(screen.queryByLabelText("Food value")).not.toBeInTheDocument();
  });

  it("'Upload another file' resets the review card back to the idle dropzone", async () => {
    mockExtract.mockResolvedValue(foodProfile());
    const { container } = render(
      <ImportProfileModal onClose={jest.fn()} onApply={jest.fn()} />,
    );
    uploadFile(container);
    // Confirm we reached the review card with seeded per-field/per-month state.
    await screen.findByText(/Avg of 3 months/);
    expect(screen.getByLabelText("Food value")).toHaveValue(6000);

    // Reset wipes status/data/enabled/edits/monthEdits and shows the dropzone.
    fireEvent.click(screen.getByRole("button", { name: /Upload another file/ }));
    await screen.findByText("Upload or drag a file");
    expect(screen.queryByText(/Avg of 3 months/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Food value")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument();
  });
});
