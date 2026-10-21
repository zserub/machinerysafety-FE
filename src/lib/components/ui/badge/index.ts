import Root from "./badge.svelte";
import { tv, type VariantProps } from "tailwind-variants";

export const badgeVariants = tv({
	base: "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	variants: {
		variant: {
			default: "bg-primary/20 text-primary",
			secondary: "bg-secondary/20 text-secondary",
			destructive: "bg-danger/20 text-danger",
			warning: "bg-warning/20 text-warning",
			success: "bg-success/20 text-success",
			info: "bg-info/20 text-info",
			outline: "border border-border text-text",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type Variant = VariantProps<typeof badgeVariants>["variant"];

export {
	Root,
	Root as Badge,
};
