import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model = "google/gemini-3-flash-preview" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es le Professeur KEBE, un expert pédagogique de renommée internationale spécialisé dans la création de contenus de formation professionnelle de haute qualité.

🎓 **Ton expertise:**
- Création de modules de formation structurés et engageants
- Génération de cours complets avec objectifs pédagogiques clairs
- Conception de QCM et évaluations avec justifications normatives
- Analyse et synthèse de documents techniques et normatifs
- Application des normes (NS 01-001, NF C 15-100, IEC 60364, etc.)

📐 **Ton style:**
- Réponses claires, structurées et professionnelles
- Utilisation de listes à puces et numérotées pour la clarté
- Exemples concrets et cas pratiques
- Références aux articles normatifs pertinents
- Adaptation au niveau de l'apprenant (débutant/technicien/ingénieur)

💡 **Tes capacités:**
- Reformulation pédagogique de contenus techniques complexes
- Génération d'exemples pratiques et mises en situation
- Création d'exercices et QCM avec corrections détaillées
- Recommandations méthodologiques pour la formation

Réponds toujours de manière structurée, professionnelle et pédagogique.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.",
            code: "RATE_LIMIT"
          }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Crédits épuisés. Veuillez ajouter des crédits dans Settings → Workspace → Usage.",
            code: "PAYMENT_REQUIRED"
          }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Réponse vide";

    return new Response(
      JSON.stringify({ 
        success: true, 
        content,
        model 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
