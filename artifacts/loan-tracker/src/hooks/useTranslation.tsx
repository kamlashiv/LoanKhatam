import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";

export const translations = {
  en: {
    dashboard: "Dashboard",
    cardsAccounts: "Cards & Accounts",
    financialProfile: "Financial Profile",
    smartStrategy: "Smart Strategy",
    financialStrategy: "Financial Strategy",
    planningTools: "Planning Tools",
    groupSplit: "Group Split",
    amortization: "Amortization",
    settings: "Settings",
    welcome: "Welcome",
    logout: "Log out",
    addLoan: "Add Loan",
    totalLent: "Total Lent",
    outstanding: "Outstanding",
    collected: "Collected",
    recentLoans: "Recent Loans",
    active: "Active",
    paid: "Paid",
    overdue: "Overdue",
    youAreOnTrack: "You're on track",
    noOverdueLoans: "No overdue loans.",
    stillToBeCollected: "still to be collected across",
    activeLoans: "active loans",
    spendingMoreThanEarn: "You're spending more than you earn",
    recentLoansTitle: "Recent Loans",
    viewAll: "View All",
    interestRate: "Interest Rate",
    principal: "Principal",
    months: "months",
    monthlyIncome: "Monthly Income",
    monthlySurplus: "Monthly Surplus",
    netWorth: "Net Worth",
    riskProfile: "Risk Profile",
    stayOnTop: "Stay on top",
    everyLoanOnTrack: "Every loan is on track. Nice work staying ahead.",
    viewAllLoans: "View All Loans",
    dropStatements: "Drop statements here",
    statementImportHint: "PDF, CSV, or screenshots to auto-import",
    loanType: "Loan Type",
    interestRateType: "Interest Type",
    standardEmi: "Standard Bank EMI",
    desiByaj: "Local Monthly Interest (Desi Byaj)",
    byajHint: "% per month simple interest",
    interestRatePlaceholder: "Interest rate",
    borrower: "Borrower Name",
    bankName: "Bank Name",
    optional: "Optional",
    description: "Description",
    startDate: "Start Date",
    dueDate: "Due Date",
    submit: "Save Loan",
    cancel: "Cancel",
    groups: "Groups",
    createGroup: "Create Group",
    groupName: "Group Name",
    members: "Members",
    commaSeparated: "comma separated, e.g. Self, Amit, Rohan",
    expenseDescription: "Expense Description",
    expenseAmount: "Amount",
    paidBy: "Paid By",
    equally: "Equally",
    splitEqually: "Split Equally",
    addExpense: "Add Expense",
    balances: "Balances",
    owes: "owes",
    to: "to",
    noExpensesYet: "No expenses added yet.",
    noGroupsYet: "No groups created yet.",
    simplifiedDebts: "Simplified Debts",
    amountLent: "Amount Lent",
    amountLentDesc: "Across all active loans",
    toBeCollected: "To be collected",
    safelyReturned: "Safely returned",
    emiVsSip: "EMI vs. SIP Calculator",
    emiVsSipDesc: "Compare if you should prepay your loan or invest the extra money in mutual fund SIPs.",
    expectedSipReturn: "Expected SIP Return (% p.a.)",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    cardsAccounts: "कार्ड्स और खाते",
    financialProfile: "वित्तीय प्रोफाइल",
    smartStrategy: "स्मार्ट रणनीति",
    financialStrategy: "वित्तीय रणनीति",
    planningTools: "प्लानिंग टूल्स",
    groupSplit: "ग्रुप हिसाब (Split)",
    amortization: "ऋण तालिका (EMI)",
    settings: "सेटिंग्स",
    welcome: "स्वागत है",
    logout: "लॉग आउट",
    addLoan: "नया लोन जोड़ें",
    totalLent: "कुल दिया उधार",
    outstanding: "बचा हुआ उधार",
    collected: "वापस मिला",
    recentLoans: "हाल के लोन",
    active: "सक्रिय",
    paid: "चुका दिया",
    overdue: "देरी से बकाया",
    youAreOnTrack: "आप सही ट्रैक पर हैं",
    noOverdueLoans: "कोई भी लोन ओवरड्यू नहीं है।",
    stillToBeCollected: "अभी वापस लेना बचा है",
    activeLoans: "लोन में",
    spendingMoreThanEarn: "आपका खर्च आपकी कमाई से ज्यादा है",
    recentLoansTitle: "हाल के लेनदेन",
    viewAll: "सभी देखें",
    interestRate: "ब्याज दर",
    principal: "मूलधन",
    months: "महीने",
    monthlyIncome: "मासिक आय",
    monthlySurplus: "मासिक बचत",
    netWorth: "कुल संपत्ति",
    riskProfile: "जोखिम प्रोफाइल",
    stayOnTop: "बकाया पर नज़र रखें",
    everyLoanOnTrack: "सभी लोन समय पर हैं। अच्छा काम किया!",
    viewAllLoans: "सभी लोन देखें",
    dropStatements: "यहाँ स्टेटमेंट अपलोड करें",
    statementImportHint: "PDF, CSV या स्क्रीनशॉट से ऑटो-इंपोर्ट",
    loanType: "लोन का प्रकार",
    interestRateType: "ब्याज का प्रकार",
    standardEmi: "बैंक मासिक EMI (चक्रवृद्धि)",
    desiByaj: "स्थानीय मासिक ब्याज (देशी ब्याज)",
    byajHint: "% प्रति माह साधारण ब्याज",
    interestRatePlaceholder: "ब्याज प्रतिशत",
    borrower: "उधार लेने वाले का नाम",
    bankName: "बैंक का नाम",
    optional: "वैकल्पिक",
    description: "विवरण (नोट)",
    startDate: "शुरू होने की तारीख",
    dueDate: "अंतिम तारीख",
    submit: "लोन सुरक्षित करें",
    cancel: "रद्द करें",
    groups: "ग्रुप्स (समूह)",
    createGroup: "नया ग्रुप बनाएं",
    groupName: "ग्रुप का नाम",
    members: "ग्रुप के सदस्य",
    commaSeparated: "कोमा (,) से अलग करें, जैसे: Self, Amit, Rohan",
    expenseDescription: "खर्च का विवरण",
    expenseAmount: "रकम (रुपये)",
    paidBy: "किसने भुगतान किया",
    equally: "बराबर विभाजन",
    splitEqually: "सब में बराबर बांटें",
    addExpense: "खर्च जोड़ें",
    balances: "लेनदेन का हिसाब",
    owes: "को देने हैं",
    to: "को",
    noExpensesYet: "इस ग्रुप में अभी कोई खर्च नहीं जोड़ा गया है।",
    noGroupsYet: "अभी कोई ग्रुप नहीं बनाया गया है।",
    simplifiedDebts: "सरलीकृत हिसाब-किताब",
    amountLent: "कुल दिया उधार",
    amountLentDesc: "सभी चालू लोन मिलाकर",
    toBeCollected: "वापस लेना है",
    safelyReturned: "सुरक्षित वापस मिला",
    emiVsSip: "EMI बनाम SIP कैलकुलेटर",
    emiVsSipDesc: "तुलना करें कि आपको अपना लोन पहले चुकाना चाहिए या बचे हुए पैसे को म्यूचुअल फंड SIP में निवेश करना चाहिए।",
    expectedSipReturn: "अनुमानित SIP रिटर्न (% सालाना)",
  },
} as const;

interface TranslationContextProps {
  t: (key: keyof typeof translations.en) => string;
  lang: Language;
  setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem("lang") as Language) || "en";
  });

  const setLanguage = (newLang: Language) => {
    localStorage.setItem("lang", newLang);
    setLangState(newLang);
    // Force dispatch storage event for potential cross-tab synchronization
    window.dispatchEvent(new Event("storage"));
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, lang, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
