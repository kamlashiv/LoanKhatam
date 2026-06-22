import React, { useState } from "react";
import { ArrowLeft, TrendingUp, ChevronRight, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import "./_group.css";

export function ConversationalWizard() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col font-outfit text-slate-900">
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      {/* Header / Top bar */}
      <header className="p-6 flex items-center justify-between">
        <button aria-label="Go back" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-600 hover:bg-slate-200 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-sm relative overflow-hidden">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 max-w-md w-full mx-auto pb-12 justify-center">
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-1 flex-1 bg-emerald-400 rounded-full"></div>
          <div className="h-1 flex-1 bg-emerald-400 rounded-full"></div>
          <div className="h-1 flex-1 bg-slate-200 rounded-full"></div>
        </div>

        {/* The Conversation */}
        <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
          
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
              Namaste 👋<br/> Let's get you in.
            </h1>
            <p className="text-slate-500 text-lg">We found your account.</p>
          </div>

          {/* User's Input Chip */}
          <div className="flex items-center">
            <div className="inline-flex items-center gap-3 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-2xl">
              <span className="text-slate-700 font-medium">raj.patel@example.com</span>
              <button className="text-indigo-600 hover:text-indigo-700" aria-label="Edit email">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 relative">
            <div className="absolute -top-3 left-8 w-6 h-6 bg-white border-t border-l border-slate-100 rotate-45 transform"></div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label asChild className="text-lg font-medium text-slate-800">
                  <span id="code-label">What's the 6-digit code we just sent you?</span>
                </Label>
                <div role="group" aria-labelledby="code-label" className="flex gap-2 justify-between mt-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <input
                      key={i}
                      id={`code-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-14 text-center text-2xl font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder={i === 1 ? "•" : ""}
                      aria-label={`Digit ${i}`}
                    />
                  ))}
                </div>
              </div>

              <Button className="w-full h-14 text-lg rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center justify-center gap-2">
                Continue
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              <div className="text-center">
                <button className="text-slate-500 font-medium hover:text-indigo-600 transition-colors">
                  Didn't receive it? Resend
                </button>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Alternative Actions */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-slate-400 font-medium text-sm">OR</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          
          <Button variant="outline" className="w-full h-14 text-base rounded-xl border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google instead
          </Button>
        </div>

      </main>
      
      {/* Footer link */}
      <footer className="p-6 text-center">
        <p className="text-slate-500 font-medium">
          New here? <a href="#" className="text-indigo-600 hover:text-indigo-700 ml-1">Create an account</a>
        </p>
      </footer>
    </div>
  );
}
