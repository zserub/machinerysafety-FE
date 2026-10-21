import { Dialog as DialogPrimitive } from "bits-ui";
import Content from "./dialog-content.svelte";
import Overlay from "./dialog-overlay.svelte";
import Header from "./dialog-header.svelte";
import Title from "./dialog-title.svelte";
import Description from "./dialog-description.svelte";
import Footer from "./dialog-footer.svelte";

const Root = DialogPrimitive.Root;
const Trigger = DialogPrimitive.Trigger;
const Close = DialogPrimitive.Close;
const Portal = DialogPrimitive.Portal;

export {
	Root,
	Trigger,
	Close,
	Portal,
	Content,
	Overlay,
	Header,
	Title,
	Description,
	Footer,
	Root as Dialog,
	Trigger as DialogTrigger,
	Close as DialogClose,
	Portal as DialogPortal,
	Content as DialogContent,
	Overlay as DialogOverlay,
	Header as DialogHeader,
	Title as DialogTitle,
	Description as DialogDescription,
	Footer as DialogFooter,
};
