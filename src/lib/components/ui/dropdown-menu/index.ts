import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import Content from "./dropdown-menu-content.svelte";
import Item from "./dropdown-menu-item.svelte";
import CheckboxItem from "./dropdown-menu-checkbox-item.svelte";
import Separator from "./dropdown-menu-separator.svelte";
import Label from "./dropdown-menu-label.svelte";

const Root = DropdownMenuPrimitive.Root;
const Trigger = DropdownMenuPrimitive.Trigger;
const Group = DropdownMenuPrimitive.Group;

export {
	Root,
	Trigger,
	Content,
	Item,
	CheckboxItem,
	Separator,
	Label,
	Group,
	Root as DropdownMenu,
	Trigger as DropdownMenuTrigger,
	Content as DropdownMenuContent,
	Item as DropdownMenuItem,
	CheckboxItem as DropdownMenuCheckboxItem,
	Separator as DropdownMenuSeparator,
	Label as DropdownMenuLabel,
	Group as DropdownMenuGroup,
};
