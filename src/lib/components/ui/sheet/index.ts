import { Dialog as SheetPrimitive } from "bits-ui";
import Content from "./sheet-content.svelte";
import Overlay from "./sheet-overlay.svelte";
import Header from "./sheet-header.svelte";
import Title from "./sheet-title.svelte";

const Root = SheetPrimitive.Root;
const Trigger = SheetPrimitive.Trigger;
const Close = SheetPrimitive.Close;

export {
	Root,
	Trigger,
	Close,
	Content,
	Overlay,
	Header,
	Title,
	Root as Sheet,
	Trigger as SheetTrigger,
	Close as SheetClose,
	Content as SheetContent,
	Overlay as SheetOverlay,
	Header as SheetHeader,
	Title as SheetTitle,
};
