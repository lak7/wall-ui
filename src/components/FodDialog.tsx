"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChargingPadWarningProps {
  isFodThere: boolean;
}

const ChargingPadWarning: React.FC<ChargingPadWarningProps> = ({
  isFodThere,
}) => {
  //   const [isOpen, setIsOpen] = useState(true);

  return (
    <Dialog open={isFodThere}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            Warning: Foreign Object Detected
          </DialogTitle>
          <DialogDescription>
            A foreign object has been detected on the charging pad. Please
            remove it to continue charging safely.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Please remove to continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChargingPadWarning;
