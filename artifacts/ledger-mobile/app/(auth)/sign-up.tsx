import { useSignUp } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const STRENGTH_AMBER = "#E0A106";

interface ClerkFieldError {
  code?: string;
  message?: string;
  meta?: { paramName?: string };
}

function getClerkErrors(err: unknown): ClerkFieldError[] {
  if (err && typeof err === "object" && "errors" in err) {
    const errors = (err as { errors: unknown }).errors;
    if (Array.isArray(errors)) return errors as ClerkFieldError[];
  }
  return [];
}

interface PasswordStrength {
  level: 0 | 1 | 2 | 3;
  label: string;
  color: string;
}

function getPasswordStrength(
  pw: string,
  colors: ReturnType<typeof useColors>,
): PasswordStrength {
  if (!pw) return { level: 0, label: "", color: colors.border };

  let bits = 0;
  if (pw.length >= MIN_PASSWORD_LENGTH) bits++;
  if (pw.length >= 12) bits++;
  if (/[A-Z]/.test(pw)) bits++;
  if (/[a-z]/.test(pw)) bits++;
  if (/\d/.test(pw)) bits++;
  if (/[^A-Za-z0-9]/.test(pw)) bits++;

  if (pw.length < MIN_PASSWORD_LENGTH || bits <= 2) {
    return { level: 1, label: "Weak", color: colors.destructive };
  }
  if (bits <= 4) {
    return { level: 2, label: "Medium", color: STRENGTH_AMBER };
  }
  return { level: 3, label: "Strong", color: colors.success };
}

export default function SignUpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const strength = useMemo(
    () => getPasswordStrength(password, colors),
    [password, colors],
  );

  const validateForm = (): boolean => {
    let ok = true;
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Email is required.");
      ok = false;
    } else if (!EMAIL_RE.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      ok = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Password is required.");
      ok = false;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(
        `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      ok = false;
    } else {
      setPasswordError(null);
    }

    return ok;
  };

  // Maps known Clerk errors to friendly, field-level copy.
  // Returns true if at least one error was surfaced inline.
  const applyClerkFieldErrors = (err: unknown): boolean => {
    const errors = getClerkErrors(err);
    let handled = false;

    for (const e of errors) {
      const codeName = e.code ?? "";
      const param = e.meta?.paramName ?? "";

      if (codeName === "form_identifier_exists") {
        setEmailError("This email is already registered. Please sign in.");
        handled = true;
      } else if (codeName === "form_password_pwned") {
        setPasswordError(
          "This password was found in a data breach. Choose a different one.",
        );
        handled = true;
      } else if (codeName === "form_password_length_too_short") {
        setPasswordError(
          `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.`,
        );
        handled = true;
      } else if (codeName === "form_password_not_strong_enough") {
        setPasswordError("Please choose a stronger password.");
        handled = true;
      } else if (param === "email_address") {
        setEmailError(e.message ?? "Enter a valid email address.");
        handled = true;
      } else if (param === "password") {
        setPasswordError(e.message ?? "Password is invalid.");
        handled = true;
      }
    }

    return handled;
  };

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      const handled = applyClerkFieldErrors(err);
      if (!handled) {
        const fallback = getClerkErrors(err)[0]?.message;
        Alert.alert(
          "Sign-up Failed",
          fallback ?? "Sign-up failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    if (!code.trim()) {
      setCodeError("Enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setCodeError("Sign-up could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      const fallback = getClerkErrors(err)[0]?.message;
      setCodeError(fallback ?? "Incorrect code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded) return;
    setCodeError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert("Code Sent", "A new verification code has been sent.");
    } catch (err: unknown) {
      const fallback = getClerkErrors(err)[0]?.message;
      Alert.alert(
        "Could Not Resend",
        fallback ?? "Failed to resend code. Please try again.",
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0),
      paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0),
    },
    inner: {
      flex: 1,
      paddingHorizontal: 28,
      justifyContent: "center",
    },
    logoRow: {
      alignItems: "center",
      marginBottom: 40,
    },
    logoCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    appName: {
      fontSize: 28,
      fontWeight: "700" as const,
      color: colors.foreground,
      letterSpacing: -0.5,
      fontFamily: "Inter_700Bold",
    },
    tagline: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginTop: 4,
      fontFamily: "Inter_400Regular",
    },
    label: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      marginBottom: 6,
      fontFamily: "Inter_600SemiBold",
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
    },
    inputWrapperError: {
      borderColor: colors.destructive,
    },
    fieldSpacer: {
      marginBottom: 16,
    },
    input: {
      flex: 1,
      height: 48,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    eyeBtn: {
      padding: 4,
    },
    errorText: {
      fontSize: 12,
      color: colors.destructive,
      marginTop: 6,
      fontFamily: "Inter_400Regular",
    },
    strengthRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 10,
    },
    strengthBars: {
      flex: 1,
      flexDirection: "row",
      gap: 6,
    },
    strengthBar: {
      flex: 1,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.border,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
      minWidth: 54,
      textAlign: "right",
    },
    primaryBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    primaryBtnDisabled: {
      opacity: 0.7,
    },
    primaryBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    helperText: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 20,
      fontFamily: "Inter_400Regular",
    },
    linkBtn: {
      alignItems: "center",
      marginTop: 16,
    },
    linkText: {
      fontSize: 14,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 32,
    },
    footerText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    footerLink: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
  });

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.inner}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Feather name="mail" size={32} color={colors.primaryForeground} />
            </View>
            <Text style={styles.appName}>Verify Email</Text>
            <Text style={styles.tagline}>Enter the code we sent you</Text>
          </View>

          <Text style={styles.helperText}>
            We've sent a code to {email.trim()}.
          </Text>

          <Text style={styles.label}>Verification Code</Text>
          <View
            style={[
              styles.inputWrapper,
              codeError ? styles.inputWrapperError : null,
            ]}
          >
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={(t) => {
                setCode(t);
                if (codeError) setCodeError(null);
              }}
              keyboardType="number-pad"
              autoCapitalize="none"
              placeholder="123456"
              placeholderTextColor={colors.mutedForeground}
              testID="code-input"
            />
          </View>
          {codeError ? (
            <Text style={styles.errorText} testID="code-error">
              {codeError}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { marginTop: 24 },
              loading && styles.primaryBtnDisabled,
            ]}
            onPress={handleVerify}
            disabled={loading}
            testID="verify-btn"
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={styles.primaryBtnText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={handleResend}
            disabled={loading}
            testID="resend-code-btn"
          >
            <Text style={styles.linkText}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Feather name="book" size={32} color={colors.primaryForeground} />
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.tagline}>Loan tracking, simplified</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <View
          style={[
            styles.inputWrapper,
            emailError ? styles.inputWrapperError : null,
          ]}
        >
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (emailError) setEmailError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedForeground}
            testID="email-input"
          />
        </View>
        {emailError ? (
          <Text style={styles.errorText} testID="email-error">
            {emailError}
          </Text>
        ) : null}

        <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
        <View
          style={[
            styles.inputWrapper,
            passwordError ? styles.inputWrapperError : null,
          ]}
        >
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (passwordError) setPasswordError(null);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            testID="password-input"
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>

        {password.length > 0 ? (
          <View style={styles.strengthRow} testID="password-strength">
            <View style={styles.strengthBars}>
              {[1, 2, 3].map((seg) => (
                <View
                  key={seg}
                  style={[
                    styles.strengthBar,
                    strength.level >= seg
                      ? { backgroundColor: strength.color }
                      : null,
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>
        ) : null}

        {passwordError ? (
          <Text style={styles.errorText} testID="password-error">
            {passwordError}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { marginTop: 24 },
            loading && styles.primaryBtnDisabled,
          ]}
          onPress={handleSignUp}
          disabled={loading}
          testID="sign-up-btn"
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={styles.primaryBtnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View nativeID="clerk-captcha" />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => router.replace("/sign-in")}
            testID="go-to-sign-in"
          >
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
