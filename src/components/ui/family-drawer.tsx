"use client";

import * as React from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

const { Root, Portal, Overlay, Content, Trigger, Close } = Drawer;

type ViewName = string;

type ViewsRegistry = Record<ViewName, React.ComponentType<any>>;

interface FamilyDrawerContextType {
  view: ViewName;
  setView: (view: ViewName) => void;
  defaultView: ViewName;
  onViewChange?: (view: ViewName) => void;
  views: ViewsRegistry;
  open: boolean;
  setOpen: (open: boolean) => void;
  elementRef: React.RefObject<HTMLDivElement | null>;
  bounds: { width: number; height: number } | null;
  opacityDuration: number;
}

const FamilyDrawerContext =
  React.createContext<FamilyDrawerContextType | null>(null);

export function useFamilyDrawer() {
  const context = React.useContext(FamilyDrawerContext);
  if (!context) {
    throw new Error("useFamilyDrawer must be used within FamilyDrawerRoot");
  }
  return context;
}

// Internal state component that owns view + open state
function FamilyDrawerRootProvider({
  views,
  defaultView = "default",
  onViewChange,
  open,
  defaultOpen,
  onOpenChange,
  children,
}: {
  views: ViewsRegistry;
  defaultView?: ViewName;
  onViewChange?: (view: ViewName) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [view, setViewState] = React.useState<ViewName>(defaultView);
  const [isOpen, setIsOpen] = React.useState<boolean>(
    open !== undefined ? open : defaultOpen ?? false
  );

  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  const setView = React.useCallback(
    (next: ViewName) => {
      setViewState(next);
      onViewChange?.(next);
    },
    [onViewChange]
  );

  const setOpen = React.useCallback(
    (next: boolean) => {
      setIsOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange]
  );

  // Measure content height for animation duration
  React.useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setBounds({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const opacityDuration = React.useMemo(() => {
    if (!bounds) return 0.2;
    return Math.min(0.2 + bounds.height / 2000, 0.5);
  }, [bounds]);

  const contextValue: FamilyDrawerContextType = {
    view,
    setView,
    defaultView,
    onViewChange,
    views,
    open: open !== undefined ? open : isOpen,
    setOpen,
    elementRef,
    bounds,
    opacityDuration,
  };

  return (
    <FamilyDrawerContext.Provider value={contextValue}>
      <Root
        open={open !== undefined ? open : isOpen}
        onOpenChange={setOpen}
      >
        {children}
      </Root>
    </FamilyDrawerContext.Provider>
  );
}

export function FamilyDrawerRoot({
  views,
  defaultView,
  onViewChange,
  open,
  defaultOpen,
  onOpenChange,
  children,
}: {
  views: ViewsRegistry;
  defaultView?: ViewName;
  onViewChange?: (view: ViewName) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <FamilyDrawerRootProvider
      views={views}
      defaultView={defaultView}
      onViewChange={onViewChange}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      {children}
    </FamilyDrawerRootProvider>
  );
}

export function FamilyDrawerTrigger({
  className,
  asChild = false,
  children,
  ...props
}: {
  className?: string;
  asChild?: boolean;
  children: React.ReactNode;
  [key: string]: any;
}) {
  const Comp = asChild ? React.Fragment : "button";
  return (
    <Trigger asChild={asChild} className={cn(className)} {...props}>
      {asChild ? children : <span>{children}</span>}
    </Trigger>
  );
}

export function FamilyDrawerContent({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Content
      className={cn(
        "fixed top-0 right-0 bottom-0 left-0 z-[60]",
        className
      )}
      {...props}
    >
      {children}
    </Content>
  );
}

export function FamilyDrawerPortal({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Portal {...props}>
      {children}
    </Portal>
  );
}

export function FamilyDrawerOverlay({
  className,
  onClick,
  ...props
}: {
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  return (
    <Overlay
      className={cn(
        "fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm",
        className
      )}
      onClick={onClick}
      {...props}
    />
  );
}

export function FamilyDrawerClose({
  className,
  asChild = false,
  children,
  ...props
}: {
  className?: string;
  asChild?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Close asChild={asChild} className={cn(className)} {...props}>
      {asChild ? children : <span>{children}</span>}
    </Close>
  );
}

export function FamilyDrawerAnimatedWrapper({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  const { elementRef, bounds } = useFamilyDrawer();
  return (
    <div
      ref={elementRef}
      className={cn("w-full min-h-[size:1]", className)}
      style={{ ...(bounds ? { height: bounds.height } : {}) }}
      {...props}
    >
      {children}
    </div>
  );
}

export function FamilyDrawerAnimatedContent({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  const { opacityDuration } = useFamilyDrawer();
  const reduceMotion = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        transition={{ duration: opacityDuration, ease: [0.2, 0.8, 0.2, 1] }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function FamilyDrawerViewContent({
  views,
  className,
}: {
  views?: ViewsRegistry;
  className?: string;
}) {
  const { view, views: contextViews } = useFamilyDrawer();
  const ViewComponent = views?.[view] ?? contextViews[view];

  if (!ViewComponent) return null;

  return (
    <div className={cn(className)}>
      <ViewComponent />
    </div>
  );
}

export function FamilyDrawerHeader({
  icon,
  title,
  description,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1 px-4 pt-4 pb-2", className)}>
      {icon && (
        <div className="flex items-center gap-2 mb-1">{icon}</div>
      )}
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && (
        <p className="text-sm text-gray-400">{description}</p>
      )}
    </div>
  );
}

export function FamilyDrawerButton({
  className,
  asChild = false,
  onClick,
  children,
  ...props
}: {
  className?: string;
  asChild?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 bg-transparent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {asChild ? children : <span>{children}</span>}
    </button>
  );
}

export function FamilyDrawerSecondaryButton({
  className,
  asChild = false,
  onClick,
  children,
  ...props
}: {
  className?: string;
  asChild?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {asChild ? children : <span>{children}</span>}
    </button>
  );
}
