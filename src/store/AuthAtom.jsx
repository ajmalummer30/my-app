// src/store/authAtom.js
import { atom } from 'jotai';

export const userAtom = atom(null);
export const isLoggedInAtom = atom((get) => !!get(userAtom));