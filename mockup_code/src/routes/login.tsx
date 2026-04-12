import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate({ to: "/dashboard" });
    return null;
  }

  return <LoginForm />;
}

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = "Email is required";
    if (!password) errs.password = "Password is required";
    if (password && password.length < 6) errs.password = "Password must be at least 6 characters";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const success = login(email, password);
    if (success) {
      toast.success("Login successful!");
      navigate({ to: "/dashboard" });
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !securityAnswer) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Password reset link sent to your email!");
    setShowForgot(false);
  };

  const demoAccounts = [
    { role: "Admin", email: "admin@vms.org" },
    { role: "Org", email: "org@greenearth.org" },
    { role: "Volunteer", email: "jane@email.com" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="flex items-center justify-center gap-2 mb-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <ShieldCheck className="size-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">Volunteero</span>
          </motion.div>
          <p className="text-sm text-muted-foreground">Volunteer Management System</p>
        </div>

        {!showForgot ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-sm p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-1">Sign In</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your credentials to continue</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                  className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                    className="w-full px-3 py-2 pr-10 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
              >
                Sign In
              </motion.button>
            </form>

            <button onClick={() => setShowForgot(true)} className="text-sm text-primary hover:underline mt-4 block text-center w-full">
              Forgot password?
            </button>

            <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted-foreground">
              <p className="mb-2">Demo accounts:</p>
              <div className="flex flex-col gap-1 text-xs">
                {demoAccounts.map(acc => (
                  <span key={acc.role}><strong>{acc.role}:</strong>{` ${acc.email}`}</span>
                ))}
              </div>
              <p className="text-xs mt-2 text-muted-foreground">Any password works for demo</p>
            </div>

            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-sm text-primary font-medium hover:underline">Register</Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-sm p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-1">Reset Password</h2>
            <p className="text-sm text-muted-foreground mb-6">Answer your security question</p>

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Security Question Answer</label>
                <input type="text" value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} className="w-full px-3 py-2 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your answer" />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors"
              >
                Reset Password
              </motion.button>
            </form>
            <button onClick={() => setShowForgot(false)} className="text-sm text-primary hover:underline mt-4 block text-center w-full">
              Back to login
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
