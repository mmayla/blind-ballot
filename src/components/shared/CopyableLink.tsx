import {
  ClipboardIconButton,
  ClipboardInput,
  ClipboardLabel,
  ClipboardRoot,
} from "@/components/ui/clipboard"
import { InputGroup } from "@/components/ui/input-group"


interface CopyableLinkProps {
  label: string;
  url: string;
}

export function CopyableLink({ label, url }: CopyableLinkProps) {
  return (
    <ClipboardRoot value={url}>
      <ClipboardLabel fontSize="lg">{label}</ClipboardLabel>
      <InputGroup width="full" endElement={<ClipboardIconButton me="-2" />}>
        <ClipboardInput size="xl" />
      </InputGroup>
    </ClipboardRoot>
  );
}
