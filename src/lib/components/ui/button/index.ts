import Root from "./button.svelte";
import { tv, type VariantProps } from "tailwind-variants";

export const buttonVariants = tv({
	base: "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "bg-primary text-bg-dark shadow border-2 border-primary hover:bg-primary/90 hover:border-highlight",
			destructive: "bg-danger text-text shadow-sm border-2 border-danger hover:bg-danger/90 hover:border-highlight",
			outline: "border-2 border-border bg-transparent shadow-sm hover:bg-bg-light hover:text-text hover:border-highlight",
			secondary: "bg-secondary text-bg-dark shadow-sm border-2 border-secondary hover:bg-secondary/80 hover:border-highlight",
			ghost: "border-2 border-transparent hover:bg-bg-light hover:text-text hover:border-highlight",
			link: "text-primary underline-offset-4 hover:underline",
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

export type Variant = VariantProps<typeof buttonVariants>["variant"];
export type Size = VariantProps<typeof buttonVariants>["size"];

export {
	Root,
	Root as Button,
};
