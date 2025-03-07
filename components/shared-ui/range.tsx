import { Slider } from "@/components/ui/slider";
import * as SliderPrimitive from "@radix-ui/react-slider";

interface RangeProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
    className: string;
    variants?: "default" | "green" | "red" | "white";
    value?: number[];
    onValueChange?: (value: number[]) => void;
}

export default function Range({ className, variants, value, onValueChange, ...props }: RangeProps) {
    return (
        <Slider
            defaultValue={[0]}
            className={className}
            variants={variants}
            value={value}
            onValueChange={onValueChange}
            {...props}
        />
    );
}