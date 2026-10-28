import { Coins, Gift, TriangleAlert } from "lucide-react";
import { useState, ChangeEvent, FC } from "react";
import { paymentService } from "@/features/payment/services/paymentService";
import type { ModelUploadData } from "@/features/models/types/model";

export interface PricingFormProps {
  modelData: ModelUploadData;
  setModelData: React.Dispatch<React.SetStateAction<ModelUploadData>>;
}

export const PricingForm: FC<PricingFormProps> = ({ modelData, setModelData }) => {
  const [priceError, setPriceError] = useState<string>("");

  // TODO: Replace with real seller verification check from private profile when available
  const isVerifiedSeller = false;

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setPriceError("");

    try {
      if (value === "" || value === "0") {
        setModelData((prev) => ({
          ...prev,
          price: 0,
          isPaid: false,
        }));
        return;
      }

      const validatedPrice = paymentService.validatePrice(value);
      setModelData((prev) => ({
        ...prev,
        price: validatedPrice,
        isPaid: validatedPrice > 0,
      }));
    } catch (error) {
      setPriceError(error instanceof Error ? error.message : "Invalid price");
    }
  };

  const handleFreeToggle = (): void => {
    setModelData((prev) => ({
      ...prev,
      price: 0,
      isPaid: false,
    }));
    setPriceError("");
  };

  const price = typeof modelData.price === "number" ? modelData.price : 0;
  const isPaid = Boolean(modelData.isPaid);
  const optionClass = (isSelected: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
      isSelected
        ? "border-accent bg-accent-soft"
        : "border-br-secondary hover:border-br-primary"
    }`;

  return (
    <div className="space-y-6">
      <p className="text-sm text-txt-secondary">
        Offer your model for free or set a price. You can change this later.
      </p>

      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Pricing">
        <label htmlFor="free" className={optionClass(!isPaid)}>
          <input
            type="radio"
            id="free"
            name="pricing"
            checked={!isPaid}
            onChange={handleFreeToggle}
            className="mt-1 size-4 accent-accent"
          />
          <span>
            <span className="flex items-center gap-2 font-semibold text-txt-primary">
              <Gift className="size-4 text-accent" aria-hidden="true" />
              Free download
            </span>
            <span className="mt-1 block text-sm text-txt-secondary">
              Anyone signed in can download it.
            </span>
          </span>
        </label>

        <label htmlFor="paid" className={optionClass(isPaid)}>
          <input
            type="radio"
            id="paid"
            name="pricing"
            checked={isPaid}
            onChange={() => setModelData((prev) => ({ ...prev, isPaid: true }))}
            className="mt-1 size-4 accent-accent"
          />
          <span>
            <span className="flex items-center gap-2 font-semibold text-txt-primary">
              <Coins className="size-4 text-ember" aria-hidden="true" />
              Set a price
            </span>
            <span className="mt-1 block text-sm text-txt-secondary">
              Earn from every sale. We take a small platform fee.
            </span>
          </span>
        </label>
      </div>

      {isPaid && (
        <div className="grid gap-6 rounded-xl border border-br-subtle bg-page p-5 md:grid-cols-2">
          <div>
            <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-txt-secondary">
              Price (USD)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-mono text-xl text-txt-muted">
                $
              </span>
              <input
                type="number"
                id="price"
                min="0.50"
                max="999999"
                step="0.01"
                value={price !== 0 ? price : ""}
                onChange={handlePriceChange}
                placeholder="0.00"
                aria-invalid={Boolean(priceError) || undefined}
                className="h-14 w-full rounded-lg border border-br-input bg-surface-card pl-9 pr-4 font-mono text-2xl text-txt-primary placeholder:text-txt-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              />
            </div>
            {priceError && <p className="mt-1.5 text-sm text-error">{priceError}</p>}
            <ul className="mt-4 space-y-1 text-xs text-txt-muted">
              <li>Minimum price is $0.50.</li>
              <li>Payments are processed by Stripe.</li>
              <li>You need a seller account to receive payments.</li>
            </ul>
          </div>

          <dl className="space-y-2 self-start rounded-lg border border-dashed border-br-secondary p-4 font-mono text-sm">
            <div className="flex justify-between">
              <dt className="text-txt-muted">Price</dt>
              <dd className="text-txt-primary">{paymentService.formatPrice(price)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-txt-muted">Platform fee (5%)</dt>
              <dd className="text-txt-primary">−{paymentService.formatPrice(price * 0.05)}</dd>
            </div>
            <div className="flex justify-between border-t border-br-secondary pt-2 text-base font-semibold">
              <dt className="text-txt-primary">You earn</dt>
              <dd className="text-ember">{paymentService.formatPrice(price * 0.95)}</dd>
            </div>
          </dl>
        </div>
      )}

      {isPaid && !isVerifiedSeller && (
        <div className="flex gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-sm text-txt-secondary">
            <strong className="text-txt-primary">One more step:</strong> to sell models you need a
            one-time seller verification. After you click Upload, you&apos;ll be taken to Stripe to
            finish it securely.
          </p>
        </div>
      )}
    </div>
  );
};
