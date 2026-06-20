import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import SignUpScreen from "../sign-up";

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

const mockUseSignUp = jest.fn();

jest.mock("@clerk/clerk-expo", () => ({
  useSignUp: () => mockUseSignUp(),
}));

describe("SignUpScreen", () => {
  let signUpCreate: jest.Mock;
  let prepareEmailAddressVerification: jest.Mock;
  let attemptEmailAddressVerification: jest.Mock;
  let setActive: jest.Mock;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    signUpCreate = jest.fn().mockResolvedValue({});
    prepareEmailAddressVerification = jest.fn().mockResolvedValue({});
    attemptEmailAddressVerification = jest.fn().mockResolvedValue({
      status: "complete",
      createdSessionId: "sess_new",
    });
    setActive = jest.fn().mockResolvedValue(undefined);

    mockUseSignUp.mockReturnValue({
      signUp: {
        create: signUpCreate,
        prepareEmailAddressVerification,
        attemptEmailAddressVerification,
      },
      setActive,
      isLoaded: true,
    });

    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  async function reachVerificationStep() {
    fireEvent.changeText(screen.getByTestId("email-input"), "new@example.com");
    fireEvent.changeText(
      screen.getByTestId("password-input"),
      "Strongpass1!",
    );
    fireEvent.press(screen.getByTestId("sign-up-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("code-input")).toBeTruthy();
    });
  }

  it("creates the account and advances to the email verification step", async () => {
    render(<SignUpScreen />);
    fireEvent.changeText(screen.getByTestId("email-input"), "new@example.com");
    fireEvent.changeText(
      screen.getByTestId("password-input"),
      "Strongpass1!",
    );
    fireEvent.press(screen.getByTestId("sign-up-btn"));

    await waitFor(() => {
      expect(signUpCreate).toHaveBeenCalledWith({
        emailAddress: "new@example.com",
        password: "Strongpass1!",
      });
    });
    expect(prepareEmailAddressVerification).toHaveBeenCalledWith({
      strategy: "email_code",
    });
    expect(screen.getByTestId("code-input")).toBeTruthy();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("verifies the code, activates the session, and navigates into the app", async () => {
    render(<SignUpScreen />);
    await reachVerificationStep();

    fireEvent.changeText(screen.getByTestId("code-input"), "123456");
    fireEvent.press(screen.getByTestId("verify-btn"));

    await waitFor(() => {
      expect(attemptEmailAddressVerification).toHaveBeenCalledWith({
        code: "123456",
      });
    });
    expect(setActive).toHaveBeenCalledWith({ session: "sess_new" });
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
  });

  it("shows the verification error when the code is incorrect", async () => {
    attemptEmailAddressVerification.mockRejectedValue({
      errors: [{ message: "Incorrect code." }],
    });

    render(<SignUpScreen />);
    await reachVerificationStep();

    fireEvent.changeText(screen.getByTestId("code-input"), "000000");
    fireEvent.press(screen.getByTestId("verify-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("code-error")).toBeTruthy();
    });
    expect(screen.getByTestId("code-error").props.children).toBe(
      "Incorrect code.",
    );
    expect(setActive).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  describe("password strength meter", () => {
    it("rates a short, simple password as Weak", () => {
      render(<SignUpScreen />);
      fireEvent.changeText(screen.getByTestId("password-input"), "abc");

      expect(screen.getByTestId("password-strength")).toBeTruthy();
      expect(screen.getByText("Weak")).toBeTruthy();
    });

    it("rates a longer mixed password as Medium", () => {
      render(<SignUpScreen />);
      fireEvent.changeText(screen.getByTestId("password-input"), "Password1");

      expect(screen.getByText("Medium")).toBeTruthy();
    });

    it("rates a long, complex password as Strong", () => {
      render(<SignUpScreen />);
      fireEvent.changeText(
        screen.getByTestId("password-input"),
        "Str0ng!Passw0rd",
      );

      expect(screen.getByText("Strong")).toBeTruthy();
    });

    it("hides the strength meter when the password is empty", () => {
      render(<SignUpScreen />);
      expect(screen.queryByTestId("password-strength")).toBeNull();
    });
  });

  it("shows a friendly inline email error when the address is already registered", async () => {
    signUpCreate.mockRejectedValue({
      errors: [{ code: "form_identifier_exists" }],
    });

    render(<SignUpScreen />);
    fireEvent.changeText(
      screen.getByTestId("email-input"),
      "taken@example.com",
    );
    fireEvent.changeText(
      screen.getByTestId("password-input"),
      "Strongpass1!",
    );
    fireEvent.press(screen.getByTestId("sign-up-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("email-error")).toBeTruthy();
    });
    expect(screen.getByTestId("email-error").props.children).toBe(
      "Ye email pehle se registered hai. Sign in karein.",
    );
    expect(screen.queryByTestId("code-input")).toBeNull();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("shows a friendly inline password error when the password was found in a breach", async () => {
    signUpCreate.mockRejectedValue({
      errors: [{ code: "form_password_pwned" }],
    });

    render(<SignUpScreen />);
    fireEvent.changeText(screen.getByTestId("email-input"), "new@example.com");
    fireEvent.changeText(
      screen.getByTestId("password-input"),
      "Password123",
    );
    fireEvent.press(screen.getByTestId("sign-up-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("password-error")).toBeTruthy();
    });
    expect(screen.getByTestId("password-error").props.children).toBe(
      "Ye password ek data breach mein mila hai. Koi aur chunein.",
    );
    expect(screen.queryByTestId("code-input")).toBeNull();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("shows a friendly inline password error when the password is not strong enough", async () => {
    signUpCreate.mockRejectedValue({
      errors: [{ code: "form_password_not_strong_enough" }],
    });

    render(<SignUpScreen />);
    fireEvent.changeText(screen.getByTestId("email-input"), "new@example.com");
    fireEvent.changeText(
      screen.getByTestId("password-input"),
      "password123",
    );
    fireEvent.press(screen.getByTestId("sign-up-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("password-error")).toBeTruthy();
    });
    expect(screen.getByTestId("password-error").props.children).toBe(
      "Password thoda aur mazboot banayein.",
    );
  });

  it("falls back to an alert for unrecognized sign-up errors", async () => {
    signUpCreate.mockRejectedValue({
      errors: [{ message: "Something unexpected." }],
    });

    render(<SignUpScreen />);
    fireEvent.changeText(screen.getByTestId("email-input"), "new@example.com");
    fireEvent.changeText(
      screen.getByTestId("password-input"),
      "Strongpass1!",
    );
    fireEvent.press(screen.getByTestId("sign-up-btn"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Sign-up Failed",
        "Something unexpected.",
      );
    });
    expect(screen.queryByTestId("code-input")).toBeNull();
  });

  describe("client-side guards", () => {
    it("blocks submission and shows an inline error for an invalid email", () => {
      render(<SignUpScreen />);
      fireEvent.changeText(screen.getByTestId("email-input"), "not-an-email");
      fireEvent.changeText(
        screen.getByTestId("password-input"),
        "Strongpass1!",
      );
      fireEvent.press(screen.getByTestId("sign-up-btn"));

      expect(screen.getByTestId("email-error").props.children).toBe(
        "Sahi email address daalein.",
      );
      expect(signUpCreate).not.toHaveBeenCalled();
    });

    it("blocks submission and shows an inline error for a too-short password", () => {
      render(<SignUpScreen />);
      fireEvent.changeText(screen.getByTestId("email-input"), "new@example.com");
      fireEvent.changeText(screen.getByTestId("password-input"), "short");
      fireEvent.press(screen.getByTestId("sign-up-btn"));

      expect(screen.getByTestId("password-error").props.children).toBe(
        "Kam se kam 8 characters ka password rakhein.",
      );
      expect(signUpCreate).not.toHaveBeenCalled();
    });

    it("requires an email before attempting sign-up", () => {
      render(<SignUpScreen />);
      fireEvent.changeText(
        screen.getByTestId("password-input"),
        "Strongpass1!",
      );
      fireEvent.press(screen.getByTestId("sign-up-btn"));

      expect(screen.getByTestId("email-error").props.children).toBe(
        "Email zaroori hai.",
      );
      expect(signUpCreate).not.toHaveBeenCalled();
    });
  });
});
