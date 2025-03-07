import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowDownLeft } from "lucide-react";

interface SettingsOptionsProps extends React.HTMLAttributes<HTMLDivElement> {
    setWindow: (value: string) => void;
    options: string[];
    title: string;
    className?: string;
    changeState: (value :number) => void
}

export default function SettingsOptions({setWindow, options, title, className, changeState, ...props}: SettingsOptionsProps) {
    return (
        <motion.div
            initial={{maxHeight: 0, opacity: 0}}
            animate={{maxHeight: 1000, opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.5}}
        >
            <div {...props} className={cn(className, "py-2 px-4 cursor-pointer hover:bg-[#ffffff38] transition-colors flex duration-300 ease-in")} onClick={() => setWindow("settings")}>
                <ArrowDownLeft size={22} className="pt-1" />
                <div>{title}</div>
            </div>
            {
                options.map(el => 
                    <div 
                        key={el} 
                        className="py-2 px-4 cursor-pointer hover:bg-[#ffffff38] transition-colors duration-300 ease-in"
                        onClick={() => changeState(Number(el.slice(0, -1)))}
                    >
                        {el}
                    </div>
                )
            }
        </motion.div>
    )
}