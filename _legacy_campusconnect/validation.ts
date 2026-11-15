export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: { path: (string | number)[]; message: string }[] } };

export interface Schema<T> {
  safeParse(input: unknown): SafeParseResult<T>;
}

function success<T>(data: T): SafeParseResult<T> {
  return { success: true, data };
}

function failure(path: (string | number)[], message: string): SafeParseResult<never> {
  return { success: false, error: { issues: [{ path, message }] } };
}

export const usernameSchema: Schema<string> = {
  safeParse(input: unknown): SafeParseResult<string> {
    if (typeof input !== "string") {
      return failure([], "Username must be a string");
    }
    const trimmed = input.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,24}$/.test(trimmed)) {
      return failure([], "Use 3–24 lowercase letters, numbers, or underscores.");
    }
    return success(trimmed);
  },
};

export interface ConedRegisterInput {
  email: string;
  username: string;
  password: string;
  dateOfBirth: string; // YYYY-MM-DD
  termsAccepted: boolean;
  parentalConsentAccepted?: boolean;
}

export function calculateAge(dobString: string): number {
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export const conedRegisterSchema: Schema<ConedRegisterInput> = {
  safeParse(input: unknown): SafeParseResult<ConedRegisterInput> {
    if (!input || typeof input !== "object") {
      return failure([], "Invalid payload");
    }
    const obj = input as Record<string, unknown>;

    // Email
    if (typeof obj.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email.trim())) {
      return failure(["email"], "Please enter a valid email address.");
    }

    // Username
    const uResult = usernameSchema.safeParse(obj.username);
    if (!uResult.success) {
      return failure(["username"], uResult.error.issues[0]?.message || "Invalid username");
    }

    // Password
    if (typeof obj.password !== "string" || obj.password.length < 8) {
      return failure(["password"], "Password must be at least 8 characters long.");
    }
    if (obj.password.length > 128) {
      return failure(["password"], "Password must be at most 128 characters.");
    }

    // Date of Birth & Age Check
    if (typeof obj.dateOfBirth !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(obj.dateOfBirth.trim())) {
      return failure(["dateOfBirth"], "Please enter a valid date of birth (YYYY-MM-DD).");
    }
    const age = calculateAge(obj.dateOfBirth.trim());
    if (age < 13) {
      return failure(["dateOfBirth"], "Students must be at least 13 years old to create an account.");
    }
    if (age > 100) {
      return failure(["dateOfBirth"], "Please enter a valid date of birth.");
    }

    // Minor (13-17) Parental Consent
    if (age >= 13 && age < 18 && obj.parentalConsentAccepted !== true) {
      return failure(["parentalConsentAccepted"], "Parental or guardian consent is required for users aged 13–17.");
    }

    // Terms & Privacy Policy Acceptance
    if (obj.termsAccepted !== true) {
      return failure(["termsAccepted"], "You must agree to the Terms of Service and Privacy Policy.");
    }

    return success({
      email: (obj.email as string).trim().toLowerCase(),
      username: uResult.data,
      password: obj.password as string,
      dateOfBirth: obj.dateOfBirth.trim(),
      termsAccepted: true,
      parentalConsentAccepted: obj.parentalConsentAccepted === true,
    });
  },
};

export interface VerifyEmailInput {
  email: string;
  code: string;
}

export const verifyEmailSchema: Schema<VerifyEmailInput> = {
  safeParse(input: unknown): SafeParseResult<VerifyEmailInput> {
    if (!input || typeof input !== "object") return failure([], "Invalid payload");
    const obj = input as Record<string, unknown>;
    if (typeof obj.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email.trim())) {
      return failure(["email"], "Valid email required.");
    }
    if (typeof obj.code !== "string" || !/^\d{6}$/.test(obj.code.trim())) {
      return failure(["code"], "Please enter a 6-digit verification code.");
    }
    return success({
      email: obj.email.trim().toLowerCase(),
      code: obj.code.trim(),
    });
  },
};

export interface DeleteAccountInput {
  confirmUsername: string;
  reason?: string;
}

export const deleteAccountSchema: Schema<DeleteAccountInput> = {
  safeParse(input: unknown): SafeParseResult<DeleteAccountInput> {
    if (!input || typeof input !== "object") return failure([], "Invalid payload");
    const obj = input as Record<string, unknown>;
    if (typeof obj.confirmUsername !== "string" || !obj.confirmUsername.trim()) {
      return failure(["confirmUsername"], "Please confirm your username to delete your account.");
    }
    return success({
      confirmUsername: obj.confirmUsername.trim().toLowerCase(),
      reason: typeof obj.reason === "string" ? obj.reason.trim() : undefined,
    });
  },
};

export interface ConedLoginInput {
  identifier: string;
  password: string;
}

export const conedLoginSchema: Schema<ConedLoginInput> = {
  safeParse(input: unknown): SafeParseResult<ConedLoginInput> {
    if (!input || typeof input !== "object") {
      return failure([], "Invalid payload");
    }
    const obj = input as Record<string, unknown>;

    if (typeof obj.identifier !== "string" || obj.identifier.trim().length < 3) {
      return failure(["identifier"], "Enter your email address or username.");
    }
    if (obj.identifier.trim().length > 180) {
      return failure(["identifier"], "Identifier is too long.");
    }

    if (typeof obj.password !== "string" || obj.password.length < 1) {
      return failure(["password"], "Please enter your password.");
    }
    if (obj.password.length > 128) {
      return failure(["password"], "Password is too long.");
    }

    return success({
      identifier: (obj.identifier as string).trim(),
      password: obj.password as string,
    });
  },
};

export interface ForgotPasswordInput {
  identifier: string;
}

export const forgotPasswordSchema: Schema<ForgotPasswordInput> = {
  safeParse(input: unknown): SafeParseResult<ForgotPasswordInput> {
    if (!input || typeof input !== "object") {
      return failure([], "Invalid payload");
    }
    const obj = input as Record<string, unknown>;
    if (typeof obj.identifier !== "string" || obj.identifier.trim().length < 3) {
      return failure(["identifier"], "Enter your email address or username.");
    }
    return success({
      identifier: (obj.identifier as string).trim(),
    });
  },
};

// Legacy schemas kept for backward compatibility
export const registerSchema = {
  safeParse(input: unknown) {
    if (!input || typeof input !== "object") return failure([], "Invalid input");
    const obj = input as Record<string, unknown>;
    const uResult = usernameSchema.safeParse(obj.username);
    if (!uResult.success) return uResult;
    if (typeof obj.password !== "string" || obj.password.length < 8) {
      return failure(["password"], "Password must be at least 8 characters long.");
    }
    return success({
      fullName: typeof obj.fullName === "string" ? obj.fullName.trim() : undefined,
      college: typeof obj.college === "string" ? obj.college.trim() : undefined,
      email: typeof obj.email === "string" ? obj.email.trim() : undefined,
      username: uResult.data,
      password: obj.password as string,
      visibility: (obj.visibility === "private" ? "private" : "public") as "public" | "private",
    });
  },
};

export const loginSchema = {
  safeParse(input: unknown) {
    if (!input || typeof input !== "object") return failure([], "Invalid input");
    const obj = input as Record<string, unknown>;
    if (typeof obj.password !== "string" || obj.password.length < 1) {
      return failure(["password"], "Password required.");
    }
    return success({
      username: typeof obj.username === "string" ? obj.username.trim() : undefined,
      identifier: typeof obj.identifier === "string" ? obj.identifier.trim() : undefined,
      college: typeof obj.college === "string" ? obj.college.trim() : undefined,
      password: obj.password as string,
    });
  },
};

export interface PostInput {
  content: string;
  postType: "update" | "project" | "achievement" | "resource" | "poll";
  visibility: "public" | "followers" | "campus" | "private";
}

export const postSchema: Schema<PostInput> = {
  safeParse(input: unknown): SafeParseResult<PostInput> {
    if (!input || typeof input !== "object") return failure([], "Invalid payload");
    const obj = input as Record<string, unknown>;
    if (typeof obj.content !== "string" || !obj.content.trim()) {
      return failure(["content"], "Content is required.");
    }
    if (obj.content.length > 5000) {
      return failure(["content"], "Content exceeds 5,000 characters.");
    }
    const validTypes = ["update", "project", "achievement", "resource", "poll"] as const;
    const postType = (typeof obj.postType === "string" && validTypes.includes(obj.postType as any))
      ? (obj.postType as PostInput["postType"])
      : "update";

    const validVis = ["public", "followers", "campus", "private"] as const;
    const visibility = (typeof obj.visibility === "string" && validVis.includes(obj.visibility as any))
      ? (obj.visibility as PostInput["visibility"])
      : "public";

    return success({
      content: obj.content.trim(),
      postType,
      visibility,
    });
  },
};
