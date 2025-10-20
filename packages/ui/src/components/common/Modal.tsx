"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Dialog, DialogPortal, DialogOverlay } from "./Dialog";
import { Button } from "./Button";
import { Typo } from "./Typo";
import { cn } from "../../lib/utils";

export interface ModalConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}

interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: "",
    description: "",
    confirmText: "확인",
    showCancelButton: false,
  });

  const showModal = useCallback((config: ModalConfig) => {
    setModalConfig({
      confirmText: "확인",
      showCancelButton: false,
      ...config,
    });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    modalConfig.onConfirm?.();
    close();
  }, [modalConfig, close]);

  const handleCancel = useCallback(() => {
    modalConfig.onCancel?.();
    close();
  }, [modalConfig, close]);

  return (
    <ModalContext.Provider value={{ showModal, close }}>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogPortal>
          <DialogOverlay onClick={close} />
          <div
            className={cn(
              "fixed left-[50%] top-[50%] z-50 w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg",
              "p-6",
              "flex flex-col gap-6"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Typo.MainTitle size="small">{modalConfig.title}</Typo.MainTitle>
              <Typo.Body size="medium" className="text-center text-gray-600">
                {modalConfig.description}
              </Typo.Body>
            </div>

            <div className="flex gap-3 w-full">
              {modalConfig.showCancelButton && (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleCancel}
                  className="flex-1"
                >
                  {modalConfig.cancelText || "취소"}
                </Button>
              )}
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirm}
                className={modalConfig.showCancelButton ? "flex-1" : "w-full"}
              >
                {modalConfig.confirmText}
              </Button>
            </div>
          </div>
        </DialogPortal>
      </Dialog>
    </ModalContext.Provider>
  );
}
