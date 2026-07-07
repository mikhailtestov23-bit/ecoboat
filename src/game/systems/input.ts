import { useEffect, useRef } from "react";
import { create } from "zustand";

export type InputDirection = {
  x: number;
  z: number;
};

export type InputButton = "up" | "down" | "left" | "right";

export type InputButtons = Record<InputButton, boolean>;

type InputState = {
  virtualButtons: InputButtons;
  setVirtualButton: (button: InputButton, pressed: boolean) => void;
  clearVirtualButtons: () => void;
};

const EMPTY_BUTTONS: InputButtons = {
  up: false,
  down: false,
  left: false,
  right: false,
};

export const useInputStore = create<InputState>((set) => ({
  virtualButtons: { ...EMPTY_BUTTONS },
  setVirtualButton: (button, pressed) =>
    set((state) => ({
      virtualButtons: {
        ...state.virtualButtons,
        [button]: pressed,
      },
    })),
  clearVirtualButtons: () => set({ virtualButtons: { ...EMPTY_BUTTONS } }),
}));

export function useKeyboardInput() {
  const pressedRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    function setKey(code: string, pressed: boolean) {
      if (code === "KeyW" || code === "ArrowUp") {
        pressedRef.current.up = pressed;
      }

      if (code === "KeyS" || code === "ArrowDown") {
        pressedRef.current.down = pressed;
      }

      if (code === "KeyA" || code === "ArrowLeft") {
        pressedRef.current.left = pressed;
      }

      if (code === "KeyD" || code === "ArrowRight") {
        pressedRef.current.right = pressed;
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      setKey(event.code, true);
    }

    function handleKeyUp(event: KeyboardEvent) {
      setKey(event.code, false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return pressedRef;
}

export function getKeyboardDirection(pressed: ReturnType<typeof useKeyboardInput>["current"]): InputDirection {
  return getDirectionFromButtons(pressed);
}

export function getDirectionFromButtons(pressed: InputButtons): InputDirection {
  return {
    x: Number(pressed.right) - Number(pressed.left),
    z: Number(pressed.down) - Number(pressed.up),
  };
}
