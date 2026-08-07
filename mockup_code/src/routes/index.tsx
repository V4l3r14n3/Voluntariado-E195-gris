import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/components/PageLoader";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { StaggerContainer, StaggerItem, HoverCard, FadeIn } from "@/components/motion";
import {
  ShieldCheck,
  Search,
  Users,
  Clock,
  Heart,
  MapPin,
  Tag,
  ArrowRight,
  UserPlus,
  Compass,
  HandHeart,
  Star,
  Quote,
  Mail,
  Phone,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Menu,
  X,
  ChevronRight,
  Leaf,
  Globe,
  TreePine,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { isAuthenticated, authReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authReady && isAuthenticated) navigate({ to: "/dashboard" });
  }, [authReady, isAuthenticated, navigate]);

  if (!authReady) return <PageLoader />;
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <OpportunitiesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const { t } = useTranslation(['landing', 'common']);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: t('landing:nav.home'), href: "/" },
    { label: t('landing:nav.opportunities'), href: "/search" },
    { label: t('landing:nav.community'), href: "/forum" },
    { label: t('landing:nav.blog'), href: "/blog" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck className="size-7 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">{t('common:brand')}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-md hover:bg-accent transition-colors"
              >
                {t('landing:nav.login')}
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {t('landing:nav.signUp')}
              </motion.button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 border-t border-border mt-2 pt-4"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-2 px-3">
                <Link to="/login" className="flex-1">
                  <button className="w-full px-4 py-2 text-sm font-medium text-foreground border border-border rounded-md hover:bg-accent">
                    {t('landing:nav.login')}
                  </button>
                </Link>
                <Link to="/register" className="flex-1">
                  <button className="w-full px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    {t('landing:nav.signUp')}
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}

/* ─── Hero ─── */
function HeroSection() {
  const { t } = useTranslation('landing');
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
            >
              <Leaf className="size-3" />
              {t('hero.badge')}
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              {t('hero.titlePre')}{" "}
              <span className="text-primary">{t('hero.titleHighlight')}</span>{" "}
              {t('hero.titlePost')}
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link to="/search">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {t('hero.explore')}
                  <Compass className="size-4" />
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-medium rounded-md hover:bg-accent transition-colors"
                >
                  {t('hero.getStarted')}
                  <ArrowRight className="size-4" />
                </motion.button>
              </Link>
            </div>

            <div className="flex gap-8 mt-12">
              {[
                { value: "2,500+", label: t('hero.stats.volunteers') },
                { value: "180+", label: t('hero.stats.organizations') },
                { value: "850+", label: t('hero.stats.opportunities') },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="bg-card border border-border rounded-xl p-8 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{t('hero.card.title')}</div>
                    <div className="text-sm text-muted-foreground">{t('hero.card.sub')}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { title: t('opportunities.items.beach.title'), location: "Santa Marta" },
                    { title: t('opportunities.items.trees.title'), location: "Medellín" },
                    { title: t('opportunities.items.garden.title'), location: "Bogotá" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.15 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="size-3" /> {item.location}
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-md text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <Heart className="size-4" />
                  {t('hero.newThisWeek', { count: 12 })}
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-card border border-border px-4 py-3 rounded-lg shadow-md"
              >
                <div className="flex -space-x-2 mb-1">
                  {["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4"].map((bg, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${bg} border-2 border-card`} />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">{t('hero.joinedToday', { count: 48 })}</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function FeaturesSection() {
  const { t } = useTranslation('landing');
  const features = [
    { icon: Search, title: t('features.items.find.title'), description: t('features.items.find.desc') },
    { icon: Users, title: t('features.items.community.title'), description: t('features.items.community.desc') },
    { icon: Clock, title: t('features.items.hours.title'), description: t('features.items.hours.desc') },
    { icon: Heart, title: t('features.items.impact.title'), description: t('features.items.impact.desc') },
  ];

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
              {t('features.badge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t('features.title')}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              {t('features.sub')}
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(feature => (
            <StaggerItem key={feature.title}>
              <HoverCard className="h-full">
                <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ─── Featured Opportunities ─── */
function OpportunitiesSection() {
  const { t, i18n } = useTranslation('landing');
  const locale = (i18n.resolvedLanguage || 'es').slice(0, 2) === 'es' ? 'es-CO' : 'en-US';
  const fmt = (d: string) => new Date(d).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });

  const opportunities = [
    {
      title: t('opportunities.items.beach.title'),
      location: "Santa Marta, Magdalena",
      category: t('opportunities.categories.environment'),
      description: t('opportunities.items.beach.desc'),
      icon: Globe,
      date: fmt("2026-05-15"),
    },
    {
      title: t('opportunities.items.trees.title'),
      location: "Medellín, Antioquia",
      category: t('opportunities.categories.conservation'),
      description: t('opportunities.items.trees.desc'),
      icon: TreePine,
      date: fmt("2026-06-01"),
    },
    {
      title: t('opportunities.items.garden.title'),
      location: "Bogotá, Cundinamarca",
      category: t('opportunities.categories.community'),
      description: t('opportunities.items.garden.desc'),
      icon: Leaf,
      date: fmt("2026-05-20"),
    },
  ];

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
              {t('opportunities.badge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t('opportunities.title')}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              {t('opportunities.sub')}
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map(opp => (
            <StaggerItem key={opp.title}>
              <HoverCard className="h-full">
                <div className="bg-card border border-border rounded-xl overflow-hidden h-full flex flex-col">
                  <div className="h-1.5 bg-primary" />
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <opp.icon className="size-5 text-primary" />
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-accent text-accent-foreground rounded-full">
                        <Tag className="size-3" />
                        {opp.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{opp.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="size-3.5" />
                      {opp.location}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{opp.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground">{opp.date}</span>
                      <Link to="/search">
                        <motion.button
                          whileHover={{ x: 4 }}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          {t('opportunities.viewDetails')}
                          <ArrowRight className="size-3.5" />
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.4}>
          <div className="text-center mt-12">
            <Link to="/search">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-medium rounded-md hover:bg-accent transition-colors"
              >
                {t('opportunities.viewAll')}
                <ArrowRight className="size-4" />
              </motion.button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorksSection() {
  const { t } = useTranslation('landing');
  const steps = [
    { icon: UserPlus, title: t('how.steps.create.title'), description: t('how.steps.create.desc'), step: "01" },
    { icon: Compass, title: t('how.steps.find.title'), description: t('how.steps.find.desc'), step: "02" },
    { icon: HandHeart, title: t('how.steps.start.title'), description: t('how.steps.start.desc'), step: "03" },
  ];

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
              {t('how.badge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t('how.title')}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              {t('how.sub')}
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <div className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-px border-t-2 border-dashed border-border" />
                )}
                <motion.div whileHover={{ y: -4 }} className="relative z-10">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-4">
                    <step.icon className="size-7 text-primary" />
                  </div>
                  <div className="text-xs font-bold text-primary mb-2">{t('how.step')} {step.step}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
                </motion.div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function TestimonialsSection() {
  const { t } = useTranslation('landing');
  const testimonials = [
    { name: "Sara Mitchell", role: t('testimonials.items.sarah.role'), review: t('testimonials.items.sarah.review'), rating: 5 },
    { name: "Marco Chen", role: t('testimonials.items.mark.role'), review: t('testimonials.items.mark.review'), rating: 5 },
    { name: "Elena Rodríguez", role: t('testimonials.items.elena.role'), review: t('testimonials.items.elena.review'), rating: 5 },
  ];

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20">
              {t('testimonials.badge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              {t('testimonials.title')}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              {t('testimonials.sub')}
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {testimonials.map(tm => (
            <StaggerItem key={tm.name}>
              <HoverCard className="h-full">
                <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col">
                  <Quote className="size-8 text-primary/20 mb-4" />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                    "{tm.review}"
                  </p>
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: tm.rating }).map((_, i) => (
                      <Star key={i} className="size-4 text-warning fill-warning" />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {tm.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{tm.name}</div>
                      <div className="text-xs text-muted-foreground">{tm.role}</div>
                    </div>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTASection() {
  const { t } = useTranslation('landing');
  return (
    <section className="py-20 lg:py-28 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground tracking-tight">
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            {t('cta.sub')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-card text-foreground font-medium rounded-md hover:bg-card/90 transition-colors shadow-sm"
              >
                {t('cta.join')}
                <ArrowRight className="size-4" />
              </motion.button>
            </Link>
            <Link to="/search">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 border border-primary-foreground/30 text-primary-foreground font-medium rounded-md hover:bg-primary-foreground/10 transition-colors"
              >
                {t('cta.explore')}
                <Compass className="size-4" />
              </motion.button>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const { t } = useTranslation(['landing', 'common']);
  const year = new Date().getFullYear();
  const platformLinks = [
    t('landing:footer.links.opportunities'),
    t('landing:footer.links.community'),
    t('landing:footer.links.blog'),
    t('landing:footer.links.reports'),
  ];
  const companyLinks = [
    t('landing:footer.links.about'),
    t('landing:footer.links.privacy'),
    t('landing:footer.links.terms'),
    t('landing:footer.links.support'),
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="size-6 text-primary" />
              <span className="text-lg font-bold text-foreground">{t('common:brand')}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t('landing:footer.tagline')}
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ y: -2, scale: 1.1 }}
                  className="w-9 h-9 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Icon className="size-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t('landing:footer.platform')}</h4>
            <ul className="space-y-2">
              {platformLinks.map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t('landing:footer.company')}</h4>
            <ul className="space-y-2">
              {companyLinks.map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">{t('landing:footer.contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 text-primary" />
                hello@volunteero.org
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 text-primary" />
                +57 (300) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            {t('landing:footer.copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
