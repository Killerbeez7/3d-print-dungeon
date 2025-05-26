import { render } from "@testing-library/react";
import { Spinner } from "@/components/shared/Spinner";

describe("Spinner", () => {
    it("applies size and border style", () => {
        const { container } = render(<Spinner size={32} />);
        const span = container.firstChild as HTMLElement;

        expect(span).toHaveStyle({
            width: "32px",
            height: "32px",
            borderStyle: "solid",
        });

        // top border should be accent (variable), the others bg-primary
        const borderTop = getComputedStyle(span).borderTopColor;
        const border = getComputedStyle(span).borderRightColor;
        expect(borderTop).not.toBe(border);
    });
});
