import {useRef, useState, type ChangeEvent} from "react";
import {Box, Button, Card, Flex, Text} from "@sanity/ui";
import {PatchEvent, set, useClient, type ImageInputProps} from "sanity";

export function MobileImageInput(props: ImageInputProps) {
  const client = useClient({apiVersion: "2025-01-01"});
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const asset = await client.assets.upload("image", file, {filename: file.name});
      props.onChange(
        PatchEvent.from(
          set({
            _type: "image",
            asset: {_type: "reference", _ref: asset._id},
          }),
        ),
      );
    } catch {
      setError("L’envoi de la photo a échoué. Veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Flex direction="column" gap={3}>
      <Card padding={3} radius={2} tone="primary" border>
        <Flex gap={2} wrap="wrap">
          <Button
            text={uploading ? "Envoi en cours…" : "Prendre une photo"}
            tone="primary"
            disabled={uploading}
            onClick={() => cameraRef.current?.click()}
          />
          <Button
            text="Choisir dans la photothèque"
            mode="ghost"
            disabled={uploading}
            onClick={() => libraryRef.current?.click()}
          />
        </Flex>
        <Box marginTop={2}>
          <Text size={1} muted>
            Sur téléphone ou tablette, utilisez l’appareil photo ou choisissez une image existante.
          </Text>
        </Box>
        {error ? (
          <Box marginTop={2}>
            <Text size={1}>{error}</Text>
          </Box>
        ) : null}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={upload}
          style={{display: "none"}}
        />
        <input
          ref={libraryRef}
          type="file"
          accept="image/*"
          onChange={upload}
          style={{display: "none"}}
        />
      </Card>
      {props.renderDefault(props)}
    </Flex>
  );
}
