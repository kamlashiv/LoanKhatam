import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import ForgotPasswordScreen from "../forgot-password";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
    back: mockBack,
  }),
}));

const mockUseSignIn = jest.fn();

jest.mock("@clerk/clerk-expo", () => ({
  useSignIn: () => mockUseSignIn(),
}));

describe("ForgotPasswordScreen", () => {
  let signInCreate: jest.Mock;
  let attemptFirstFactor: jest.Mock;
  let setActive: jest.Mock;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    signInCreate = jest.fn().mockResolvedValue({});
    attemptFirstFactor = jest.fn().mockResolvedValue({
      status: "complete",
      createdSessionId: "sess_reset",
    });
    setActive = jest.fn().mockResolvedValue(undefined);

    mockUseSignIn.mockReturnValue({
      signIn: { create: signInCreate, attemptFirstFactor },
      setActive,
      isLoaded: true,
    });

    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  async function reachResetStep() {
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "user@example.com",
    );
    fireEvent.press(screen.getByTestId("send-code-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("code-input")).toBeTruthy();
    });
  }

  it("sends a reset code and advances to the reset step on success", async () => {
    render(<ForgotPasswordScreen />);
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "user@example.com",
    );
    fireEvent.press(screen.getByTestId("send-code-btn"));

    await waitFor(() => {
      expect(signInCreate).toHaveBeenCalledWith({
        strategy: "reset_password_email_code",
        identifier: "user@example.com",
      });
    });
    expect(alertSpy).toHaveBeenCalledWith(
      "Code sent",
      "Check your email for a password reset code.",
    );
    expect(screen.getByTestId("code-input")).toBeTruthy();
  });

  it("shows an error and stays on the request step when sending fails", async () => {
    signInCreate.mockRejectedValue({
      errors: [{ message: "Couldn't find your account." }],
    });

    render(<ForgotPasswordScreen />);
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "missing@example.com",
    );
    fireEvent.press(screen.getByTestId("send-code-btn"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Could not send code",
        "Couldn't find your account.",
      );
    });
    expect(screen.queryByTestId("code-input")).toBeNull();
  });

  it("completes the reset with a valid code and new password, then navigates", async () => {
    render(<ForgotPasswordScreen />);
    await reachResetStep();

    fireEvent.changeText(screen.getByTestId("code-input"), "123456");
    fireEvent.changeText(
      screen.getByTestId("new-password-input"),
      "newpassword123",
    );
    fireEvent.press(screen.getByTestId("reset-password-btn"));

    await waitFor(() => {
      expect(attemptFirstFactor).toHaveBeenCalledWith({
        strategy: "reset_password_email_code",
        code: "123456",
        password: "newpassword123",
      });
    });
    expect(setActive).toHaveBeenCalledWith({ session: "sess_reset" });
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("shows an error for an invalid or expired code", async () => {
    attemptFirstFactor.mockRejectedValue({
      errors: [{ message: "Incorrect code." }],
    });

    render(<ForgotPasswordScreen />);
    await reachResetStep();

    fireEvent.changeText(screen.getByTestId("code-input"), "000000");
    fireEvent.changeText(
      screen.getByTestId("new-password-input"),
      "newpassword123",
    );
    fireEvent.press(screen.getByTestId("reset-password-btn"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Reset Failed",
        "Incorrect code.",
      );
    });
    expect(setActive).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("guards against a password shorter than 8 characters", async () => {
    render(<ForgotPasswordScreen />);
    await reachResetStep();

    fireEvent.changeText(screen.getByTestId("code-input"), "123456");
    fireEvent.changeText(screen.getByTestId("new-password-input"), "short");
    fireEvent.press(screen.getByTestId("reset-password-btn"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Weak password",
      "Use a password with at least 8 characters.",
    );
    expect(attemptFirstFactor).not.toHaveBeenCalled();
  });
});
