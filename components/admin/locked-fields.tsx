"use client";

import { FormField, Input, Textarea } from "./form-field";
import { ImageUploader } from "./image-uploader";

interface LockedFieldsProps {
  salesCopy: string;
  priceDisplay: string;
  checkoutUrl: string;
  ctaText: string;
  coverImage: string;
  onChange: (key: string, value: string) => void;
}

export function LockedFields({
  salesCopy,
  priceDisplay,
  checkoutUrl,
  ctaText,
  coverImage,
  onChange,
}: LockedFieldsProps) {
  return (
    <div className="space-y-5 p-5 rounded-card border border-pink-dark/30 bg-pink-dark/5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[14px] font-semibold text-pink-primary">
          Configuration Upsell / Premium
        </span>
      </div>

      <FormField label="Image de couverture du produit">
        <ImageUploader
          value={coverImage}
          onChange={(url) => onChange("cover_image", url)}
          folder="covers"
        />
      </FormField>

      <FormField label="Texte de vente (copy)">
        <Textarea
          value={salesCopy}
          onChange={(e) => onChange("sales_copy", e.target.value)}
          rows={3}
          placeholder="Décrivez le produit en quelques lignes..."
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Prix affiché">
          <Input
            value={priceDisplay}
            onChange={(e) => onChange("price_display", e.target.value)}
            placeholder="€97 ou R$ 197"
          />
        </FormField>
        <FormField label="Texte du bouton CTA">
          <Input
            value={ctaText}
            onChange={(e) => onChange("cta_text", e.target.value)}
            placeholder="Débloquer maintenant"
          />
        </FormField>
      </div>

      <FormField label="URL de checkout">
        <Input
          value={checkoutUrl}
          onChange={(e) => onChange("checkout_url", e.target.value)}
          placeholder="https://checkout.example.com/..."
        />
        <p className="text-[11px] text-text-tertiary mt-1">
          Lien vers Hotmart, Kiwify, Stripe ou autre passerelle de paiement.
        </p>
      </FormField>
    </div>
  );
}
