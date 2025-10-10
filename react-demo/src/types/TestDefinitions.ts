// Fichier de test pour les détections de types et interfaces

// TYPE UTILISE + EXPORTE
export type UsedExportedType = {
  id: number;
  name: string;
};

// TYPE NON UTILISE + EXPORTE
export type UnusedExportedType = {
  value: string;
  active: boolean;
};

// TYPE UTILISE + NON EXPORTE
type UsedNotExportedType = {
  count: number;
};

// TYPE NON UTILISE + NON EXPORTE
type UnusedNotExportedType = {
  unused: string;
};

// INTERFACE UTILISEE + EXPORTEE
export interface UsedExportedInterface {
  title: string;
  description?: string;
}

// INTERFACE NON UTILISEE + EXPORTEE
export interface UnusedExportedInterface {
  data: any[];
  total: number;
}

// INTERFACE UTILISEE + NON EXPORTEE
interface UsedNotExportedInterface {
  status: 'active' | 'inactive';
}

// INTERFACE NON UTILISEE + NON EXPORTEE
interface UnusedNotExportedInterface {
  metadata: Record<string, unknown>;
}

// UTILISATIONS DES TYPES/INTERFACES POUR TESTER LA VERIFICATION

// Utilisation du type exporté utilisé
const user: UsedExportedType = {
  id: 1,
  name: 'John',
};

// Utilisation du type non exporté utilisé
const counter: UsedNotExportedType = {
  count: 10,
};

// Utilisation de l'interface exportée utilisée
const article: UsedExportedInterface = {
  title: 'Test Article',
  description: 'A test article',
};

// Utilisation de l'interface non exportée utilisée
const appStatus: UsedNotExportedInterface = {
  status: 'active',
};

// Fonction qui utilise des types dans ses paramètres et retour
function processUser(userData: UsedExportedType): UsedExportedInterface {
  return {
    title: userData.name,
    description: `User ID: ${userData.id}`,
  };
}

// Utilisation dans des génériques
const users: Array<UsedExportedType> = [user];
const promise: Promise<UsedExportedInterface> = Promise.resolve(article);

// Utilisation dans des unions
type CombinedStatus = UsedNotExportedInterface | { error: string };

// Les types/interfaces suivants ne sont PAS utilisés et devraient être détectés :
// - UnusedExportedType (exporté mais non utilisé)
// - UnusedNotExportedType (non exporté et non utilisé)
// - UnusedExportedInterface (exportée mais non utilisée)
// - UnusedNotExportedInterface (non exportée et non utilisée)
