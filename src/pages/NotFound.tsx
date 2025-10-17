// src/pages/NotFound.tsx
import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const float: any = {
  y: [0, -12, 0],
  rotate: [0, 2, -2, 0],
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
};

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-gradient-to-b from-background via-muted/40 to-background">
      {/* Subtle gradient glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[38rem] w-[38rem] rounded-full bg-violet-500/10 blur-3xl" />

      {/* Floating shapes */}
      <motion.div
        className="absolute left-10 top-24 h-16 w-16 rounded-2xl bg-primary/15"
        animate={float}
      />
      <motion.div
        className="absolute right-16 bottom-28 h-10 w-10 rounded-full bg-emerald-500/20"
        animate={{ ...float, transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      />
      <motion.div
        className="absolute left-1/3 bottom-10 h-14 w-14 rotate-12 rounded-xl bg-amber-500/20"
        animate={{ ...float, transition: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-28 text-center sm:pt-36">
        {/* 404 Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-1.5 text-xs tracking-wide text-muted-foreground shadow-sm backdrop-blur"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
          Page not found
        </motion.div>

        {/* Big 404 */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.45, ease: "easeOut" }}
          className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl"
        >
          4
          <motion.span
            className="inline-block"
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            0
          </motion.span>
          4
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-4 max-w-2xl text-balance text-lg text-muted-foreground"
        >
          Oops—looks like this page sprouted legs and wandered off. Let’s get you back on track.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/">
            <Button size="lg">Return to Home</Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="border-border/70"
          >
            Go Back
          </Button>
        </motion.div>

        {/* Helpful links */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <Link
            to="/shop"
            className="group rounded-xl border border-border/60 bg-background/70 p-4 text-left shadow-sm backdrop-blur transition hover:shadow-md"
          >
            <div className="mb-1 text-sm font-medium text-foreground/90 group-hover:text-foreground">
              Explore the Shop
            </div>
            <div className="text-xs text-muted-foreground">
              Browse the latest arrivals and offers.
            </div>
          </Link>

          <Link
            to="/blog"
            className="group rounded-xl border border-border/60 bg-background/70 p-4 text-left shadow-sm backdrop-blur transition hover:shadow-md"
          >
            <div className="mb-1 text-sm font-medium text-foreground/90 group-hover:text-foreground">
              Read the Blog
            </div>
            <div className="text-xs text-muted-foreground">
              Tips, stories, and updates from the farm.
            </div>
          </Link>

          <Link
            to="/contact"
            className="group rounded-xl border border-border/60 bg-background/70 p-4 text-left shadow-sm backdrop-blur transition hover:shadow-md"
          >
            <div className="mb-1 text-sm font-medium text-foreground/90 group-hover:text-foreground">
              Contact Us
            </div>
            <div className="text-xs text-muted-foreground">
              Need help? We’re happy to chat.
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
