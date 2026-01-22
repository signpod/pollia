"use client";

import { atom } from "jotai";

export type NetworkStatus = "online" | "offline";

export const networkStatusAtom = atom<NetworkStatus>("online");

export const networkModalOpenAtom = atom(false);
