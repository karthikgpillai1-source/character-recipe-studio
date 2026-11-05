use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CharacterRecipe {
    pub schema: String, // "recipe-v1"
    pub version: String,
    pub identity: Identity,
    pub behavior: Behavior,
    pub memory: Memory,
    pub knowledge: Knowledge,
    pub model_preferences: ModelPreferences,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Identity {
    pub name: String,
    pub avatar: Option<String>,
    pub description: String,
    pub category: Category,
    pub source_type: SourceType,
    pub source_material: Option<String>,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum Category {
    Fictional,
    Historical,
    Original,
    Assistant,
    Other,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum SourceType {
    Movie,
    TV,
    Anime,
    Game,
    Book,
    Comic,
    Manga,
    #[serde(rename = "Web Series")]
    WebSeries,
    #[serde(rename = "Real World")]
    RealWorld,
    Custom,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Behavior {
    pub always: Vec<String>,
    pub never: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Memory {
    pub enabled: bool,
    pub short_term_enabled: bool,
    pub long_term_enabled: bool,
    pub importance_threshold: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Knowledge {
    pub references: Vec<KnowledgeReference>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KnowledgeReference {
    pub id: String,
    #[serde(rename = "type")]
    pub ref_type: ReferenceType,
    pub path: String,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ReferenceType {
    Pdf,
    Docx,
    Txt,
    Website,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ModelPreferences {
    pub preferred_family: Option<String>,
    pub min_context_length: Option<u32>,
    pub recommended_settings: Option<RecommendedSettings>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RecommendedSettings {
    pub temperature: Option<f64>,
    pub top_p: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecipeRecord {
    pub id: String,
    pub name: String,
    pub data: String, // JSON serialization of CharacterRecipe
    pub created_at: String,
    pub updated_at: String,
}
