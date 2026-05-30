export type Gender =
  | "Feminino"
  | "Masculino"
  | "Outro"
  | "Prefiro não declarar";

export interface SavedAddress {
  id: string;
  label: string; // "Casa", "Trabalho", ou personalizado
  address: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pix?: string;
  gender: Gender;
  birthDate: string; // formato ISO: YYYY-MM-DD
  rating: number;
  totalRatings: number;
  bio: string;
  avatar?: string;
  privateMode?: boolean; // Quando true, esconde phone, pix e idade
  savedAddresses?: SavedAddress[]; // Endereços salvos
}
