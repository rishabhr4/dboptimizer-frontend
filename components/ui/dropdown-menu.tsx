"use client";

import { Menu } from "@headlessui/react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return <Menu as="div" className="relative inline-block text-left">{children}</Menu>;
};

export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => {
  return (
    <Menu.Button
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-muted px-3 py-2 text-sm font-medium text-foreground",
        "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-accent transition"
      )}
    >
      {children}
    </Menu.Button>
  );
};

export const DropdownMenuContent = ({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end";
}) => {
  return (
    <Menu.Items
      className={cn(
        "absolute z-50 mt-2 min-w-[12rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </Menu.Items>
  );
};

export const DropdownMenuItem = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={cn(
            "relative flex text-start w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
            active
              ? "bg-accent text-accent-foreground"
              : "text-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );
};

export const DropdownMenuCheckboxItem = ({
  children,
  checked,
  onClick,
}: {
  children: React.ReactNode;
  checked?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors pl-8",
            active
              ? "bg-accent text-accent-foreground"
              : "text-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {checked && (
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              <Check className="h-4 w-4" />
            </span>
          )}
          {children}
        </button>
      )}
    </Menu.Item>
  );
};

export const DropdownMenuRadioItem = ({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={onClick}
          className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors pl-8",
            active
              ? "bg-accent text-accent-foreground"
              : "text-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {selected && (
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
              <Circle className="h-2 w-2 fill-current" />
            </span>
          )}
          {children}
        </button>
      )}
    </Menu.Item>
  );
};

export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{children}</div>
);

export const DropdownMenuSeparator = () => <div className="my-1 h-px bg-muted" />;
