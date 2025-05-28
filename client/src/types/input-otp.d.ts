// Type definition for OTPInputContext value, based on usage in InputOTPSlot
export interface OTPInputContextValue {
  slots: Array<{
    char: string;
    hasFakeCaret: boolean;
    isActive: boolean;
  }>;
}
