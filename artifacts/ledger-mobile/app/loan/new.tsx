import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import {
  useCreateLoan,
  getListLoansQueryKey,
  getGetRecentLoansQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

interface RateChangeEntry {
  effectiveDate: string;
  newRate: string;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function addMonthsISO(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

export default function NewLoanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: createLoan, isPending } = useCreateLoan();

  const [borrowerName, setBorrowerName] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(addMonthsISO(6));
  const [description, setDescription] = useState("");
  const [rateChanges, setRateChanges] = useState<RateChangeEntry[]>([]);
  const [scanning, setScanning] = useState(false);

  const addRateChange = () => {
    setRateChanges((prev) => [
      ...prev,
      { effectiveDate: todayISO(), newRate: "" },
    ]);
  };

  const removeRateChange = (index: number) => {
    setRateChanges((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRateChange = (
    index: number,
    field: keyof RateChangeEntry,
    value: string
  ) => {
    setRateChanges((prev) =>
      prev.map((rc, i) => (i === index ? { ...rc, [field]: value } : rc))
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    scanBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary + "18",
      borderWidth: 1,
      borderColor: colors.primary + "44",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
    },
    scanBtnText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    scanBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.primary + "12",
      borderWidth: 1,
      borderColor: colors.primary + "33",
      borderRadius: colors.radius,
      padding: 12,
      marginBottom: 12,
    },
    scanBannerText: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
      flex: 1,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 40 + insets.bottom,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      marginBottom: 6,
      marginTop: 16,
      fontFamily: "Inter_600SemiBold",
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      height: 46,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    inputFilled: {
      borderColor: colors.primary + "66",
      backgroundColor: colors.primary + "08",
    },
    textArea: {
      height: 80,
      paddingTop: 12,
      paddingBottom: 12,
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    halfField: {
      flex: 1,
    },
    helpText: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 4,
      fontFamily: "Inter_400Regular",
    },
    rateSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
    },
    rateSectionTitle: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    rateSectionSub: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
      maxWidth: 220,
    },
    addRateBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
    },
    addRateBtnText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    rateList: {
      marginTop: 10,
      gap: 8,
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 10,
    },
    rateRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    rateInputLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginBottom: 4,
      fontFamily: "Inter_400Regular",
    },
    rateInput: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius - 2,
      paddingHorizontal: 10,
      height: 40,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    removeRateBtn: {
      width: 40,
      height: 40,
      borderRadius: colors.radius - 2,
      backgroundColor: colors.destructive + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 28,
    },
    submitBtnDisabled: {
      opacity: 0.6,
    },
    submitBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
  });

  const handleScan = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow photo access to scan loan documents."
      );
      return;
    }

    Alert.alert("Scan Document", "How would you like to add the photo?", [
      {
        text: "Camera",
        onPress: () => openCamera(),
      },
      {
        text: "Photo Library",
        onPress: () => openLibrary(),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow camera access to scan documents.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      await extractFromImage(result.assets[0]);
    }
  };

  const openLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      await extractFromImage(result.assets[0]);
    }
  };

  const extractFromImage = async (
    asset: ImagePicker.ImagePickerAsset
  ) => {
    if (!asset.base64) {
      Alert.alert("Error", "Could not read image data.");
      return;
    }
    setScanning(true);
    try {
      const mimeType = asset.mimeType ?? "image/jpeg";
      const resp = await fetch("/api/extract-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: asset.base64, mimeType }),
      });
      if (!resp.ok) {
        throw new Error("Extraction failed");
      }
      const data = (await resp.json()) as {
        borrowerName?: string | null;
        principalAmount?: number | null;
        interestRate?: number | null;
        startDate?: string | null;
        dueDate?: string | null;
        description?: string | null;
      };

      let filled = 0;
      if (data.borrowerName) { setBorrowerName(data.borrowerName); filled++; }
      if (data.principalAmount != null) { setPrincipalAmount(String(data.principalAmount)); filled++; }
      if (data.interestRate != null) { setInterestRate(String(data.interestRate)); filled++; }
      if (data.startDate) { setStartDate(data.startDate); filled++; }
      if (data.dueDate) { setDueDate(data.dueDate); filled++; }
      if (data.description) { setDescription(data.description); filled++; }

      if (filled === 0) {
        Alert.alert(
          "Nothing found",
          "Could not extract loan details from this image. Try a clearer photo of the document."
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      Alert.alert("Error", "Could not extract loan details. Please try again or fill in manually.");
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async () => {
    const name = borrowerName.trim();
    const principal = parseFloat(principalAmount);
    const rate = parseFloat(interestRate);

    if (!name) {
      Alert.alert("Required", "Enter the borrower's name.");
      return;
    }
    if (isNaN(principal) || principal <= 0) {
      Alert.alert("Required", "Enter a valid principal amount.");
      return;
    }
    if (isNaN(rate) || rate < 0) {
      Alert.alert("Required", "Enter a valid interest rate (0 or more).");
      return;
    }
    if (!startDate || !dueDate) {
      Alert.alert("Required", "Enter start and due dates.");
      return;
    }

    const validRateChanges = rateChanges
      .filter((rc) => rc.effectiveDate && rc.newRate !== "")
      .map((rc) => ({
        effectiveDate: rc.effectiveDate,
        newRate: parseFloat(rc.newRate),
      }))
      .filter((rc) => !isNaN(rc.newRate) && rc.newRate >= 0)
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

    try {
      await createLoan({
        data: {
          borrowerName: name,
          principalAmount: principal,
          interestRate: rate,
          startDate,
          dueDate,
          description: description.trim() || undefined,
          rateChanges: validRateChanges,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
      await queryClient.invalidateQueries({
        queryKey: getGetRecentLoansQueryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: getGetDashboardSummaryQueryKey(),
      });
      router.back();
    } catch {
      Alert.alert("Error", "Could not create loan. Please try again.");
    }
  };

  const hasExtracted = borrowerName || principalAmount || interestRate;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Loan</Text>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={handleScan}
          disabled={scanning}
        >
          {scanning ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="camera" size={14} color={colors.primary} />
          )}
          <Text style={styles.scanBtnText}>
            {scanning ? "Scanning…" : "Scan"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {hasExtracted && !scanning && (
          <View style={styles.scanBanner}>
            <Feather name="check-circle" size={16} color={colors.primary} />
            <Text style={styles.scanBannerText}>
              Details extracted from document — review and adjust below.
            </Text>
          </View>
        )}

        <Text style={styles.fieldLabel}>Borrower Name</Text>
        <TextInput
          style={[styles.input, borrowerName ? styles.inputFilled : undefined]}
          value={borrowerName}
          onChangeText={setBorrowerName}
          placeholder="e.g. Rahul Sharma"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          testID="borrower-name"
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Principal (₹)</Text>
            <TextInput
              style={[styles.input, principalAmount ? styles.inputFilled : undefined]}
              value={principalAmount}
              onChangeText={setPrincipalAmount}
              placeholder="50000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              testID="principal-amount"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Interest Rate (%)</Text>
            <TextInput
              style={[styles.input, interestRate ? styles.inputFilled : undefined]}
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder="12"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              testID="interest-rate"
            />
            <Text style={styles.helpText}>Annual %</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Start Date</Text>
            <TextInput
              style={[styles.input, startDate !== todayISO() ? styles.inputFilled : undefined]}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              testID="start-date"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Due Date</Text>
            <TextInput
              style={[styles.input, dueDate !== addMonthsISO(6) ? styles.inputFilled : undefined]}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              testID="due-date"
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea, description ? styles.inputFilled : undefined]}
          value={description}
          onChangeText={setDescription}
          placeholder="Notes about this loan..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
          testID="description"
        />

        <View style={styles.rateSectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rateSectionTitle}>Rate Change Events</Text>
            <Text style={styles.rateSectionSub}>
              Add dates when the interest rate changed (e.g. RBI rate revision)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addRateBtn}
            onPress={addRateChange}
            testID="add-rate-change"
          >
            <Feather name="plus" size={14} color={colors.primary} />
            <Text style={styles.addRateBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {rateChanges.length > 0 && (
          <View style={styles.rateList}>
            {rateChanges.map((rc, index) => (
              <View key={index} style={styles.rateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rateInputLabel}>Effective Date</Text>
                  <TextInput
                    style={styles.rateInput}
                    value={rc.effectiveDate}
                    onChangeText={(v) =>
                      updateRateChange(index, "effectiveDate", v)
                    }
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.mutedForeground}
                    testID={`rate-change-date-${index}`}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rateInputLabel}>New Rate (%)</Text>
                  <TextInput
                    style={styles.rateInput}
                    value={rc.newRate}
                    onChangeText={(v) => updateRateChange(index, "newRate", v)}
                    placeholder="10"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="decimal-pad"
                    testID={`rate-change-rate-${index}`}
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeRateBtn}
                  onPress={() => removeRateChange(index)}
                  testID={`remove-rate-change-${index}`}
                >
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
          testID="submit-loan"
        >
          <Text style={styles.submitBtnText}>
            {isPending ? "Saving..." : "Create Loan"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
