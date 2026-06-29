import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Copy,
  MessageCircle,
  Send,
  Smartphone,
  Sparkles,
  Check,
} from "lucide-react";

export function InvitePage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [customMsgCopied, setCustomMsgCopied] = useState(false);

  const websiteUrl = typeof window !== "undefined" ? window.location.origin : "https://loankhatam.schand.store";

  const promoMessage = `Tension Khatam, Loan Khatam! 💸\n\nउधार और पर्सनल लोन का हिसाब भूल जाते हो? 'LoanKhatam' का इस्तेमाल करें — यह बिल्कुल फ्री और सुरक्षित है। ब्याज, EMI और रसीदों का पूरा हिसाब रखें।\n\nयहाँ से शुरू करें: ${websiteUrl}`;

  const handleCopyMainLink = async () => {
    try {
      await navigator.clipboard.writeText(websiteUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Website link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const getCustomMessage = () => {
    const nameStr = friendName ? `Hi ${friendName}, ` : "Hi, ";
    const amtStr = amount ? `₹${amount} ` : "";
    return `${nameStr}मैंने हमारे उधार का हिसाब रखने के लिए 'LoanKhatam' ऐप का उपयोग किया है। हमारा ${amtStr}लेन-देन यहाँ दर्ज है। आप भी अपना अकाउंट बनाकर इसे फ्री में ट्रैक कर सकते हैं: ${websiteUrl}`;
  };

  const handleCopyCustomMessage = async () => {
    try {
      await navigator.clipboard.writeText(getCustomMessage());
      setCustomMsgCopied(true);
      toast({
        title: "Message Copied!",
        description: "Personalized invitation message copied.",
      });
      setTimeout(() => setCustomMsgCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(promoMessage)}`;
    window.open(url, "_blank");
  };

  const handleWhatsAppCustomShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(getCustomMessage())}`;
    window.open(url, "_blank");
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(websiteUrl)}&text=${encodeURIComponent(promoMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      {/* Hero Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full px-4 py-1.5 text-sm font-bold">
          <Sparkles className="h-4 w-4 animate-pulse" />
          हिसाब साफ़, दोस्ती पक्की!
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
          Spread the Word & <span className="text-indigo-600">Promote LoanKhatam</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          अपने दोस्तों, परिवार और ग्राहकों के साथ LoanKhatam साझा करें ताकि वे भी बिना किसी उलझन के अपने उधार, लोन और भुगतान का हिसाब रख सकें।
        </p>
      </div>

      {/* Main Sharing Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* WhatsApp Share Card */}
        <Card className="hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2 shadow-sm">
              <MessageCircle className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">WhatsApp Share</CardTitle>
            <CardDescription className="text-xs">
              व्हाट्सएप पर सीधे दोस्तों और ग्रुप्स में शेयर करें।
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={handleWhatsAppShare}
              className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
            >
              Send on WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Telegram Share Card */}
        <Card className="hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center mb-2 shadow-sm">
              <Send className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Telegram Share</CardTitle>
            <CardDescription className="text-xs">
              टेलीग्राम चैनल या कॉन्टैक्ट्स के साथ शेयर करें।
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={handleTelegramShare}
              className="w-full rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold h-11"
            >
              Send on Telegram
            </Button>
          </CardContent>
        </Card>

        {/* Copy Link Card */}
        <Card className="hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex flex-col justify-between">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mb-2 shadow-sm">
              {copied ? <Check className="h-6 w-6 text-indigo-500" /> : <Copy className="h-6 w-6" />}
            </div>
            <CardTitle className="text-xl font-bold">Copy App Link</CardTitle>
            <CardDescription className="text-xs">
              वेबसाइट लिंक कॉपी करके इंस्टाग्राम या कहीं भी पेस्ट करें।
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={handleCopyMainLink}
              variant={copied ? "outline" : "default"}
              className={`w-full rounded-2xl font-bold h-11 transition-all ${
                copied
                  ? "border-emerald-500 text-emerald-500 hover:bg-emerald-500/5"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Personalized Invitation Builder */}
      <Card className="border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent">
        <CardHeader className="p-6 sm:p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black">Personalized Invite Builder</CardTitle>
              <CardDescription className="text-sm">
                दोस्त का नाम और अमाउंट डालकर सीधे याद दिलाने या इनवाइट करने का मैसेज बनाएं।
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="friendName" className="font-bold text-xs text-slate-500">
                Friend's Name / दोस्त का नाम
              </Label>
              <Input
                id="friendName"
                placeholder="e.g. Rahul"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="rounded-xl h-11 border-slate-200 dark:border-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-bold text-xs text-slate-500">
                Loan Amount / लोन की राशि (optional)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl h-11 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850">
            <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
              Message Preview / मैसेज का प्रीव्यू
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed italic">
              "{getCustomMessage()}"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleCopyCustomMessage}
              variant="outline"
              className={`rounded-xl font-bold h-11 flex-1 ${
                customMsgCopied ? "border-emerald-500 text-emerald-500" : ""
              }`}
            >
              {customMsgCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" /> Message Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" /> Copy Custom Message
                </>
              )}
            </Button>
            <Button
              onClick={handleWhatsAppCustomShare}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Share on WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PWA / App Installation Guide */}
      <Card className="border border-slate-200 dark:border-slate-800 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40">
        <CardHeader className="p-6 sm:p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black">Add shortcut to Mobile / Home Screen</CardTitle>
              <CardDescription className="text-sm">
                वेबसाइट को ऐप की तरह अपने फोन की स्क्रीन पर सेट करें ताकि एक क्लिक में खुल जाए।
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                For Android (Chrome / Brave)
              </h3>
              <ol className="list-decimal list-inside text-sm text-slate-500 dark:text-slate-400 space-y-2 pl-2">
                <li>गूगल क्रोम में <span className="font-semibold text-slate-700 dark:text-slate-350">loankhatam.schand.store</span> खोलें।</li>
                <li>ऊपर दाईं तरफ बने तीन डॉट्स <span className="font-bold">(⋮)</span> पर टैप करें।</li>
                <li>सूची में से <span className="font-bold text-indigo-600">"Add to Home screen"</span> या <span className="font-bold text-indigo-600">"Install App"</span> चुनें।</li>
                <li>अब आपकी होम स्क्रीन पर LoanKhatam का शॉर्टकट ऐप बन जाएगा।</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                For iOS (Safari / Apple iPhone)
              </h3>
              <ol className="list-decimal list-inside text-sm text-slate-500 dark:text-slate-400 space-y-2 pl-2">
                <li>सफ़ारी ब्राउज़र में <span className="font-semibold text-slate-700 dark:text-slate-350">loankhatam.schand.store</span> खोलें।</li>
                <li>नीचे बने शेयर बटन <span className="font-bold">(📤)</span> पर टैप करें।</li>
                <li>थोड़ा नीचे स्क्रॉल करके <span className="font-bold text-indigo-600">"Add to Home Screen"</span> पर टैप करें।</li>
                <li>अब यह आपके आईफोन की स्क्रीन पर ऐप की तरह इंस्टॉल हो जाएगा।</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
