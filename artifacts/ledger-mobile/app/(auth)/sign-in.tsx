import { useSSO, useSignIn } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
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

WebBrowser.maybeCompleteAuthSession();

function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

export default function SignInScreen() {
  useWarmUpBrowser();

  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<"google" | "apple" | null>(null);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password.trim()) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "errors" in err
          ? (err as { errors: Array<{ message: string }> }).errors[0]?.message
          : "Sign-in failed. Please try again.";
      Alert.alert("Sign-in Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      const label = strategy === "oauth_google" ? "google" : "apple";
      setSsoLoading(label);
      try {
        const { createdSessionId, setActive: ssoSetActive } = await startSSOFlow({
          strategy,
          redirectUrl: AuthSession.makeRedirectUri(),
        });

        if (createdSessionId) {
          await ssoSetActive!({ session: createdSessionId });
          router.replace("/(tabs)");
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "errors" in err
            ? (err as { errors: Array<{ message: string }> }).errors[0]?.message
            : `${label === "google" ? "Google" : "Apple"} sign-in failed. Please try again.`;
        Alert.alert("Sign-in Failed", msg);
      } finally {
        setSsoLoading(null);
      }
    },
    [startSSOFlow, router],
  );

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
      marginBottom: 16,
      paddingHorizontal: 14,
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
    forgotBtn: {
      alignSelf: "flex-end",
      paddingVertical: 4,
      marginTop: -4,
      marginBottom: 4,
    },
    forgotText: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
    signInBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    signInBtnDisabled: {
      opacity: 0.7,
    },
    signInBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 24,
      marginBottom: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginHorizontal: 12,
      fontFamily: "Inter_400Regular",
    },
    ssoBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      height: 50,
      marginBottom: 12,
      gap: 10,
    },
    ssoBtnDisabled: {
      opacity: 0.6,
    },
    ssoBtnText: {
      fontSize: 15,
      fontWeight: "500" as const,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    footer: {
      alignItems: "center",
      marginTop: 32,
    },
    footerText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
  });

  const anyLoading = loading || ssoLoading !== null;

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
          <Text style={styles.appName}>Ledger</Text>
          <Text style={styles.tagline}>Loan tracking, simplified</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedForeground}
            testID="email-input"
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
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

        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() => router.push("/(auth)/forgot-password")}
          disabled={anyLoading}
          testID="forgot-password-link"
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signInBtn, anyLoading && styles.signInBtnDisabled]}
          onPress={handleSignIn}
          disabled={anyLoading}
          testID="sign-in-btn"
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={styles.signInBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ya phir</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={[styles.ssoBtn, anyLoading && styles.ssoBtnDisabled]}
          onPress={() => handleSSO("oauth_google")}
          disabled={anyLoading}
          testID="google-sign-in-btn"
        >
          {ssoLoading === "google" ? (
            <ActivityIndicator size="small" color={colors.mutedForeground} />
          ) : (
            <>
              <GoogleIcon size={20} />
              <Text style={styles.ssoBtnText}>Google se sign in karein</Text>
            </>
          )}
        </TouchableOpacity>

        {Platform.OS === "ios" && (
          <TouchableOpacity
            style={[styles.ssoBtn, anyLoading && styles.ssoBtnDisabled]}
            onPress={() => handleSSO("oauth_apple")}
            disabled={anyLoading}
            testID="apple-sign-in-btn"
          >
            {ssoLoading === "apple" ? (
              <ActivityIndicator size="small" color={colors.mutedForeground} />
            ) : (
              <>
                <AppleIcon size={20} color={colors.foreground} />
                <Text style={styles.ssoBtnText}>Apple se sign in karein</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Account nahi hai? Web app par sign up karein.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: size * 0.8, lineHeight: size, fontWeight: "700" }}>G</Text>
    </View>
  );
}

function AppleIcon({ size = 20, color = "#000" }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: size * 0.85, lineHeight: size, color, fontWeight: "700" }}>
        
      </Text>
    </View>
  );
}
