import { CharacterRecipe } from "./recipe";

export const SCHEMA_VERSION_V1 = "recipe-v1";
export const PACKAGE_VERSION_V1 = "package-v1";

export interface AssetReference {
  id: string;
  path: string; // Relative path inside the package
  mimeType: string;
}

export interface CharacterPackageMetadata {
  schema: string; // "package-v1"
  version: string;
  packagedAt: string;
  application: string;
}

export interface CharacterPackage {
  metadata: CharacterPackageMetadata;
  recipe: CharacterRecipe;
  assets: AssetReference[];
  avatar?: AssetReference;
}
