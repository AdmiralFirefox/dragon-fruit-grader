import { useState } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";

const useInfoModal = () => {
  const [infoModal, setInfoModal] = useState<number | string>(0);

  const { lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget: "#scrollable",
  });

  const openModal = (id: string) => {
    lock();
    if (infoModal === id) {
      return setInfoModal(0);
    }

    setInfoModal(id);
  };

  const closeModal = (id: string) => {
    unlock();
    if (infoModal === id) {
      return setInfoModal(0);
    }
  };

  return { infoModal, openModal, closeModal };
};

export default useInfoModal;
