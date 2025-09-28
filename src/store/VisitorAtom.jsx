import { atom } from "jotai";

export const visitorAtom = atom({
  name: "",
  email: "",
  visitReason: "",
});

export const documentsAtom = atom({
  passport: {
    documentNumber: "",
    expiryDate: "",
    fileBlob: null,
    previewURL: null,
  },
  iqama: {
    documentNumber: "",
    expiryDate: "",
    fileBlob: null,
    previewURL: null,
  },
  nationalId: {
    documentNumber: "",
    expiryDate: "",
    fileBlob: null,
    previewURL: null,
  },
});
