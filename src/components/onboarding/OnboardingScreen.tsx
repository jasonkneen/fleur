import React, { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import InstallMcpUI from './InstallMcp';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { TextAnimate } from '../magicui/text-animate';
import { BlurFade } from '../magicui/blur-fade';

interface OnboardingScreenProps {
  isOpen: boolean;
  onComplete: () => void;
}

// Custom DialogContent without close button
const DialogContentWithoutCloseButton = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}>
      {children}
      {/* Close button removed */}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContentWithoutCloseButton.displayName = "DialogContentWithoutCloseButton";

export function OnboardingScreen({
  isOpen,
  onComplete,
}: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const claudeOpened = useRef(false);

  const steps = [
    {
      title: "Welcome to Fleur",
      description: "Start by dragging the Fleur app to Claude",
    },
    {
      title: "Fantastic!",
      description: `Next, open Claude and write "Hello Fleur"`,
    },
    {
      title: "Done!",
      description: "You're all set. Enjoy using Fleur!",
    },
  ];

  useEffect(() => {
    if (currentStep !== 1) return;

    const checkOnboardingStatus = async () => {
      if (!claudeOpened.current) return;

      try {
        const isCompleted = await invoke<boolean>("check_onboarding_completed");
        console.log("Onboarding check result:", isCompleted);

        if (isCompleted) {
          setCurrentStep(2);
          claudeOpened.current = false;
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      }
    };

    const handleWindowFocus = () => {
      checkOnboardingStatus();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [currentStep]);

  const onDropSuccess = () => {
    setCurrentStep(currentStep + 1);

    invoke("install_fleur_mcp")
      .then(() => {
        console.log("Successfully installed fleur-mcp");
      })
      .catch((error) => {
        console.error("Failed to install fleur-mcp:", error);
      });
  };

  const handleOpenClaude = () => {
    claudeOpened.current = true; // Set flag indicating Claude was opened

    invoke("restart_claude_app")
      .then(() => {
        console.log("Successfully opened Claude");
      })
      .catch((error) => {
        console.error("Failed to open Claude:", error);
        claudeOpened.current = false; // Reset flag if there was an error
      });
  };

  const handleAddMoreApps = () => {
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onComplete()}>
      <DialogContentWithoutCloseButton className="w-screen bg-sand-100 max-w-screen h-screen dark:bg-sand-200">
        <div className="flex flex-col justify-between h-full w-full py-8 ">
          <div>
            <div className="relative top-[80px] mx-auto flex w-full items-center justify-center">
              <div>
                <BlurFade direction="down" delay={0.5}>
                  <img
                    className="relative"
                    src="/icons/red-flower.svg"
                    alt="Fleur"
                    width={30}
                    height={30}
                  />
                </BlurFade>
                <BlurFade direction="right" delay={1}>
                  <img
                    className="relative right-[18px] bottom-[8px]"
                    src="/icons/yellow-flower.svg"
                    alt="Fleur"
                    width={30}
                    height={30}
                  />
                </BlurFade>
                <BlurFade direction="left" delay={1.5}>
                  <img
                    className="relative bottom-[30px] left-[17px]"
                    src="/icons/green-flower.svg"
                    alt="Fleur"
                    width={26}
                    height={26}
                  />
                </BlurFade>
              </div>
            </div>
            <div className="mt-20">
              <p className="text-[44px] text-center font-serif -tracking-[1px] leading-none dark:text-sand-900">
                <TextAnimate
                  delay={currentStep === 0 ? 2 : 0}
                  animation="blurInUp"
                  by="character">
                  {steps[currentStep].title}
                </TextAnimate>
              </p>
              <p className="text-sm font-serif text-center text-black mt-2 dark:text-sand-800">
                <TextAnimate
                  delay={currentStep === 0 ? 2.5 : 0.5}
                  animation="blurInUp"
                  by="character">
                  {steps[currentStep].description}
                </TextAnimate>
              </p>
            </div>
            <div className="mt-10 items-center justify-center flex">
              {currentStep === 0 && (
                <InstallMcpUI onDragSuccess={onDropSuccess} />
              )}
              {currentStep === 1 && (
                <BlurFade delay={1.5}>
                  <div className="flex justify-center">
                    <Button
                      onClick={handleOpenClaude}
                      variant="secondary"
                      className="w-full bg-sand-200 dark:bg-sand-800 border border-sand-200 dark:border-sand-800 hover:bg-sand-100 dark:hover:bg-sand-800 text-sand-800 dark:text-sand-100">
                      Open Claude
                    </Button>
                  </div>
                </BlurFade>
              )}
              {currentStep === 2 && (
                <BlurFade delay={1.5}>
                  <div className="flex justify-center">
                    <Button
                      onClick={handleAddMoreApps}
                      variant="secondary"
                      className="w-full bg-sand-200 dark:bg-sand-800 border border-sand-200 hover:bg-sand-100 text-sand-800 dark:border-sand-800 dark:text-sand-100 dark:hover:bg-sand-800 ">
                      Add more apps
                    </Button>
                  </div>
                </BlurFade>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex w-full justify-center relative top-[120px]">
              <BlurFade delay={4}>
                <div className="flex justify-center gap-2 mb-4 mt-5">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        currentStep === index
                          ? "bg-sand-700 w-5"
                          : "bg-sand-200"
                      )}
                    />
                  ))}
                </div>
              </BlurFade>
            </div>
          </div>
        </div>
      </DialogContentWithoutCloseButton>
    </Dialog>
  );
}
