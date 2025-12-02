"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";
import { Dialog, DialogOverlay, DialogPortal } from "./Dialog";
import { Typo } from "./Typo";

export interface ModalConfig {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  showCancelButton?: boolean;
  confirmButtonIsLoading?: boolean;
  cancelButtonIsLoading?: boolean;
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

  const handleConfirm = useCallback(async () => {
    const result = modalConfig.onConfirm?.();
    if (result instanceof Promise) {
      setModalConfig(prev => ({ ...prev, confirmButtonIsLoading: true }));
      try {
        await result;
      } catch (error) {
        console.error("❌ Modal onConfirm 에러 발생:", error);
      } finally {
        close();
      }
    } else {
      close();
    }
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
              "fixed top-[50%] left-[50%] z-50 w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg",
              "p-6",
              "flex flex-col gap-6",
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Typo.MainTitle size="small">{modalConfig.title}</Typo.MainTitle>
              <Typo.Body size="large" className="text-center text-gray-600 whitespace-pre-line">
                {modalConfig.description}
              </Typo.Body>
            </div>

            <div className="flex w-full gap-3">
              {modalConfig.showCancelButton && (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleCancel}
                  className="flex-1"
                  loading={modalConfig.cancelButtonIsLoading}
                >
                  {modalConfig.cancelText || "취소"}
                </Button>
              )}
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirm}
                className={modalConfig.showCancelButton ? "flex-1" : "w-full"}
                loading={modalConfig.confirmButtonIsLoading}
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
