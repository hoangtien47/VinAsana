import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Eye, EyeOff, Lock, Shield, CheckCircle, Home, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useI18n } from "@/hooks/use-i18n";

// Password validation schema
const passwordSchema = z.object({
  oldPassword: z.string().optional(),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  // Only require oldPassword if not first time reset
  const isFirstTime = window.location.pathname.includes('/reset-password/') && window.location.pathname.split('/').length > 2;
  if (!isFirstTime && (!data.oldPassword || data.oldPassword.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Current password is required",
      path: ["oldPassword"],
    });
  }
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { updatePassword, isUpdatingPassword, setFirstTimePassword, isSettingFirstTimePassword } = useUser();
  const { t } = useI18n();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extract token from URL to determine if this is a first-time password reset
  const [currentLocation] = useLocation();
  const isFirstTimeReset = currentLocation.includes('/reset-password/') && currentLocation.split('/').length > 2;
  const resetToken = isFirstTimeReset ? currentLocation.split('/')[2] : null;

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });    
  
  const onSubmit = async (values: PasswordFormValues) => {
    try {
      if (isFirstTimeReset) {
        // For first-time users, use the dedicated first-time password endpoint
        await setFirstTimePassword({
          token: resetToken!,
          password: values.newPassword,
        });
      } else {
        // For regular password changes, use the provided old password
        await updatePassword({
          oldPassword: values.oldPassword!,
          newPassword: values.newPassword,
        });
      }
      
      setIsSuccess(true);
      form.reset();
      
      // Auto redirect after 3 seconds - different destinations based on reset type
      setTimeout(() => {
        if (isFirstTimeReset) {
          // First time users should go to login
          window.location.href = '/landing';
        } else {
          // Regular users go back to settings
          setLocation("/landing");
        }
      }, 3000);
      
    } catch (error) {
      console.error("Password change error:", error);
      // Error is already handled by the useUser hook
    }
  };
  const handleBackToSettings = () => {
    if (isFirstTimeReset) {
      window.location.href = '/landing';
    } else {
      setLocation("/settings");
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength < 2) return { level: "weak", color: "text-red-500", text: "Weak" };
    if (strength < 4) return { level: "medium", color: "text-yellow-500", text: "Medium" };
    return { level: "strong", color: "text-green-500", text: "Strong" };
  };

  const newPassword = form.watch("newPassword");
  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>                <div>
                  <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    Password {isFirstTimeReset ? 'Set' : 'Changed'}!
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isFirstTimeReset 
                      ? "Your password has been set successfully. You will be redirected to login in a few seconds."
                      : "Your password has been updated successfully. You will be redirected to settings in a few seconds."
                    }
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={handleBackToSettings} className="w-full">
                    {isFirstTimeReset ? (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Go to Login
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Settings
                      </>
                    )}
                  </Button>
                  {!isFirstTimeReset && (
                    <Button 
                      variant="outline" 
                      onClick={() => setLocation("/dashboard")}
                      className="w-full"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isFirstTimeReset ? 'Set Your Password' : 'Change Password'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isFirstTimeReset 
              ? 'Welcome! Please set your password to get started.'
              : 'Update your password to keep your account secure'
            }
          </p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8">            
            <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {isFirstTimeReset 
                  ? 'Please choose a strong password for your new account. Your password should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.'
                  : 'Choose a strong password that you haven\'t used elsewhere. Your password should be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.'
                }
              </AlertDescription>
            </Alert>            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">                
                {!isFirstTimeReset && (
                  <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showOldPassword ? "text" : "password"}
                              placeholder="Enter your current password"
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                              {showOldPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isFirstTimeReset ? 'Password' : 'New Password'}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showNewPassword ? "text" : "password"}
                            placeholder={isFirstTimeReset ? "Enter your password" : "Enter your new password"}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      {passwordStrength && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrength.level === "weak" ? "bg-red-500 w-1/3" :
                                passwordStrength.level === "medium" ? "bg-yellow-500 w-2/3" :
                                "bg-green-500 w-full"
                              }`}
                            />
                          </div>
                          <span className={`text-xs font-medium ${passwordStrength.color}`}>
                            {passwordStrength.text}
                          </span>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isFirstTimeReset ? 'Confirm Password' : 'Confirm New Password'}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder={isFirstTimeReset ? "Confirm your password" : "Confirm your new password"}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-3">Password Requirements:</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${newPassword && newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                      At least 8 characters long
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${newPassword && /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${newPassword && /[a-z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      One lowercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${newPassword && /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      One number
                    </li>
                    <li className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${newPassword && /[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                      One special character
                    </li>
                  </ul>
                </div>                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isFirstTimeReset ? isSettingFirstTimePassword : isUpdatingPassword}
                    className="w-full"
                  >
                    {(isFirstTimeReset ? isSettingFirstTimePassword : isUpdatingPassword) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {isFirstTimeReset ? 'Setting Password...' : 'Changing Password...'}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        {isFirstTimeReset ? 'Set Password' : 'Change Password'}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToSettings}
                    className="w-full"
                  >
                    {isFirstTimeReset ? (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Go to Login
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Settings
                      </>
                    )}
                  </Button>
                  
                  {!isFirstTimeReset && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setLocation("/dashboard")}
                      className="w-full"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
