/**
 * @jest-environment jsdom
 *
 * Unit tests for the budget warning banners — SurplusCaution and OverspendAlert.
 * Both are pure-prop presentational components (no API hooks), so these render
 * them directly against simple inputs and assert on the visibility rules and
 * copy paths that drive the personalized guidance. The focus is the edge cases
 * that are easy to regress: empty profile, exact-fit contribution, zero surplus,
 * negative surplus, and expenses equal to income.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SurplusCaution, OverspendAlert } from "../budget-warnings";
import { formatRupees } from "@/lib/loan-utils";

describe("SurplusCaution", () => {
  it("renders nothing when the profile isn't set up (active=false)", () => {
    const { container } = render(
      <SurplusCaution planned={5000} surplus={1000} active={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the planned amount is zero or negative", () => {
    const { container } = render(
      <SurplusCaution planned={0} surplus={1000} active />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the plan fits comfortably within the surplus", () => {
    const { container } = render(
      <SurplusCaution planned={500} surplus={1000} active />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the plan exactly equals the surplus (exact fit)", () => {
    const { container } = render(
      <SurplusCaution planned={1000} surplus={1000} active />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the over-by-surplus copy when planned exceeds a positive surplus", () => {
    render(<SurplusCaution planned={5000} surplus={2000} active />);

    // Surfaces the planned amount, the overshoot, and the surplus figure.
    expect(screen.getByText(/more than your estimated monthly/i)).toBeInTheDocument();
    expect(screen.getByText(formatRupees(5000))).toBeInTheDocument();
    expect(screen.getByText(formatRupees(3000))).toBeInTheDocument(); // 5000 - 2000
    expect(screen.getByText(formatRupees(2000))).toBeInTheDocument();
  });

  it("uses the custom noun in the message when provided", () => {
    render(
      <SurplusCaution planned={5000} surplus={2000} active noun="SIP" />,
    );
    expect(screen.getByText(/This SIP of/i)).toBeInTheDocument();
  });

  it("shows the no-room copy when surplus is zero", () => {
    render(<SurplusCaution planned={5000} surplus={0} active />);
    expect(
      screen.getByText(/expenses already meet or exceed your income/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/more than your estimated monthly/i)).not.toBeInTheDocument();
  });

  it("shows the no-room copy when surplus is negative", () => {
    render(<SurplusCaution planned={5000} surplus={-1500} active />);
    expect(
      screen.getByText(/expenses already meet or exceed your income/i),
    ).toBeInTheDocument();
  });

  it("offers a safe-amount action (floored) when surplus is positive and a handler is given", async () => {
    const onUseSafeAmount = jest.fn();
    render(
      <SurplusCaution
        planned={5000}
        surplus={2000.9}
        active
        onUseSafeAmount={onUseSafeAmount}
      />,
    );

    const button = screen.getByRole("button", {
      name: new RegExp(`Use a safe amount`, "i"),
    });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(onUseSafeAmount).toHaveBeenCalledWith(2000); // Math.floor(2000.9)
  });

  it("hides the safe-amount action when surplus is zero even if a handler is given", () => {
    render(
      <SurplusCaution
        planned={5000}
        surplus={0}
        active
        onUseSafeAmount={() => {}}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("OverspendAlert", () => {
  it("renders nothing when expenses are below income", () => {
    const { container } = render(<OverspendAlert income={50000} expenses={30000} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when expenses exactly equal income", () => {
    const { container } = render(<OverspendAlert income={50000} expenses={50000} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when active is false even if overspending", () => {
    const { container } = render(
      <OverspendAlert income={30000} expenses={50000} active={false} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the shortfall when expenses exceed income", () => {
    render(<OverspendAlert income={30000} expenses={50000} />);

    expect(screen.getByText(/spending more than you earn/i)).toBeInTheDocument();
    expect(screen.getByText(formatRupees(20000))).toBeInTheDocument(); // 50000 - 30000
  });
});
