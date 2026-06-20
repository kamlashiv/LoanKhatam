import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import SignInScreen from "../sign-in";

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
const mockUseSSO = jest.fn();

jest.mock("@clerk/clerk-expo", () => ({
  useSignIn: () => mockUseSignIn(),
  useSSO: () => mockUseSSO(),
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  warmUpAsync: jest.fn(),
  coolDownAsync: jest.fn(),
}));

jest.mock("expo-auth-session", () => ({
  makeRedirectUri: jest.fn(() => "ledger://redirect"),
}));

describe("SignInScreen", () => {
  let signInCreate: jest.Mock;
  let setActive: jest.Mock;
  let startSSOFlow: jest.Mock;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    signInCreate = jest.fn();
    setActive = jest.fn().mockResolvedValue(undefined);
    startSSOFlow = jest.fn();

    mockUseSignIn.mockReturnValue({
      signIn: { create: signInCreate },
      setActive,
      isLoaded: true,
    });
    mockUseSSO.mockReturnValue({ startSSOFlow });

    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("signs in and navigates to the app on success", async () => {
    signInCreate.mockResolvedValue({
      status: "complete",
      createdSessionId: "sess_123",
    });

    render(<SignInScreen />);
    fireEvent.changeText(screen.getByTestId("email-input"), "user@example.com");
    fireEvent.changeText(screen.getByTestId("password-input"), "password123");
    fireEvent.press(screen.getByTestId("sign-in-btn"));

    await waitFor(() => {
      expect(setActive).toHaveBeenCalledWith({ session: "sess_123" });
    });
    expect(signInCreate).toHaveBeenCalledWith({
      identifier: "user@example.com",
      password: "password123",
    });
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("shows an error alert and does not navigate on failure", async () => {
    signInCreate.mockRejectedValue({
      errors: [{ message: "Incorrect password." }],
    });

    render(<SignInScreen />);
    fireEvent.changeText(screen.getByTestId("email-input"), "user@example.com");
    fireEvent.changeText(screen.getByTestId("password-input"), "wrongpass");
    fireEvent.press(screen.getByTestId("sign-in-btn"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Sign-in Failed",
        "Incorrect password.",
      );
    });
    expect(setActive).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("requires email and password before attempting sign-in", () => {
    render(<SignInScreen />);
    fireEvent.press(screen.getByTestId("sign-in-btn"));

    expect(alertSpy).toHaveBeenCalledWith(
      "Required",
      "Please enter your email and password.",
    );
    expect(signInCreate).not.toHaveBeenCalled();
  });
});
