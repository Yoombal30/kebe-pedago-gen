
import React, { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface PromptSettingsProps {
  onPromptUpdate: (prompt: string) => void;
}

const DEFAULT_COURSE_PROMPT = `Tu es le Professeur KEBE, un expert pédagogique spécialisé dans la création de contenus de formation.

Crée un cours de formation complet et structuré selon les paramètres suivants :
- Titre accrocheur et informatif
- Introduction claire des objectifs
- Contenu structuré en sections logiques
- Exemples pratiques et concrets
- Points clés à retenir
- Exercices d'application
- Conclusion synthétique

Le cours doit être :
✅ Pédagogique et accessible
✅ Bien structuré avec des titres et sous-titres
✅ Riche en exemples pratiques
✅ Adapté au niveau des apprenants
✅ Prêt à être utilisé en formation

Utilise le format Markdown pour la mise en forme.`;

export const PromptSettings: React.FC<PromptSettingsProps> = ({ onPromptUpdate }) => {
  const [coursePrompt, setCoursePrompt] = useState(DEFAULT_COURSE_PROMPT);
  const [isModified, setIsModified] = useState(false);
  const { toast } = useToast();

  const handlePromptChange = (value: string) => {
    setCoursePrompt(value);
    setIsModified(value !== DEFAULT_COURSE_PROMPT);
  };

  const handleSave = () => {
    onPromptUpdate(coursePrompt);
    setIsModified(false);
    toast({
      title: "Prompt sauvegardé",
      description: "Le prompt de création de cours a été mis à jour avec succès"
    });
  };

  const handleReset = () => {
    setCoursePrompt(DEFAULT_COURSE_PROMPT);
    setIsModified(false);
    onPromptUpdate(DEFAULT_COURSE_PROMPT);
    toast({
      title: "Prompt réinitialisé",
      description: "Le prompt a été restauré aux valeurs par défaut"
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Configuration des prompts</CardTitle>
        </div>
        <CardDescription>
          Personnalisez les instructions données au moteur IA pour la génération de cours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="course-prompt">Prompt de création de cours</Label>
          <Textarea
            id="course-prompt"
            value={coursePrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            rows={12}
            className="mt-2 font-mono text-sm"
            placeholder="Saisissez les instructions pour la génération de cours..."
          />
          <p className="text-sm text-muted-foreground mt-2">
            Ce prompt sera utilisé comme base pour toutes les générations de cours automatiques.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSave}
            disabled={!isModified}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          <Button 
            variant="outline"
            onClick={handleReset}
            disabled={!isModified}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">💡 Conseils pour optimiser votre prompt :</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Soyez spécifique sur le format de sortie souhaité</li>
            <li>• Incluez des exemples du style désiré</li>
            <li>• Précisez le niveau de détail attendu</li>
            <li>• Mentionnez les éléments obligatoires (intro, exercices, etc.)</li>
            <li>• Utilisez des instructions claires et directes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
