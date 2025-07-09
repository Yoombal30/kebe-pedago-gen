
import React, { useState } from 'react';
import { HelpCircle, Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { QCMQuestion } from '@/types';

export const QCMManager: React.FC = () => {
  const [questions, setQuestions] = useState<QCMQuestion[]>([
    {
      id: '1',
      question: 'Quelle est la première action à effectuer avant toute intervention sur une installation électrique ?',
      options: [
        'Mettre ses gants',
        'Vérifier l\'absence de tension',
        'Couper le disjoncteur',
        'Prévenir le responsable'
      ],
      correctAnswer: 1,
      explanation: 'Selon la norme NF C 18-510, la vérification d\'absence de tension (VAT) est l\'étape préalable obligatoire à toute intervention.'
    }
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QCMQuestion | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setEditingQuestion(null);
  };

  const handleCreateQuestion = () => {
    if (!formData.question.trim() || formData.options.some(opt => !opt.trim())) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir la question et toutes les options",
        variant: "destructive"
      });
      return;
    }

    const newQuestion: QCMQuestion = {
      id: Date.now().toString(),
      question: formData.question,
      options: formData.options,
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation
    };

    setQuestions(prev => [...prev, newQuestion]);
    setIsCreateDialogOpen(false);
    resetForm();
    
    toast({
      title: "Question créée",
      description: "La nouvelle question a été ajoutée au QCM"
    });
  };

  const handleEditQuestion = (question: QCMQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    });
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion || !formData.question.trim()) return;

    const updatedQuestion: QCMQuestion = {
      ...editingQuestion,
      question: formData.question,
      options: formData.options,
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation
    };

    setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updatedQuestion : q));
    resetForm();
    
    toast({
      title: "Question modifiée",
      description: "Les modifications ont été sauvegardées"
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast({
      title: "Question supprimée",
      description: "La question a été retirée du QCM"
    });
  };

  const handleAutoGenerate = () => {
    const generatedQuestions: QCMQuestion[] = [
      {
        id: Date.now().toString() + '1',
        question: 'Quelle classe d\'habilitation est requise pour des travaux non électriques en zone 4 ?',
        options: ['B0', 'H0', 'B1', 'H1'],
        correctAnswer: 0,
        explanation: 'L\'habilitation B0 permet d\'effectuer des travaux non électriques dans un environnement électrique basse tension.'
      },
      {
        id: Date.now().toString() + '2',
        question: 'Quelle est la tension limite conventionnelle de sécurité en courant alternatif ?',
        options: ['12V', '24V', '48V', '50V'],
        correctAnswer: 3,
        explanation: 'La tension limite conventionnelle de sécurité (UL) est de 50V en courant alternatif et 120V en courant continu.'
      },
      {
        id: Date.now().toString() + '3',
        question: 'Que signifie le sigle VAT ?',
        options: [
          'Vérification d\'Absence de Tension',
          'Validation d\'Accès au Travail',
          'Vérification d\'Arrêt Temporaire',
          'Validation d\'Autorisation de Travail'
        ],
        correctAnswer: 0,
        explanation: 'VAT signifie "Vérification d\'Absence de Tension", opération obligatoire avant toute intervention sur une installation électrique.'
      }
    ];

    setQuestions(prev => [...prev, ...generatedQuestions]);
    
    toast({
      title: "Questions générées",
      description: `${generatedQuestions.length} nouvelles questions ont été ajoutées automatiquement`
    });
  };

  const QuestionForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Question</label>
        <Textarea
          value={formData.question}
          onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
          placeholder="Saisissez votre question..."
          rows={3}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Options de réponse</label>
        <div className="space-y-2">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="radio"
                name="correct-answer"
                checked={formData.correctAnswer === index}
                onChange={() => setFormData(prev => ({ ...prev, correctAnswer: index }))}
                className="text-primary"
              />
              <Input
                value={option}
                onChange={(e) => {
                  const newOptions = [...formData.options];
                  newOptions[index] = e.target.value;
                  setFormData(prev => ({ ...prev, options: newOptions }));
                }}
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Sélectionnez la radio button pour indiquer la bonne réponse
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Explication</label>
        <Textarea
          value={formData.explanation}
          onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
          placeholder="Explication de la bonne réponse..."
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
          className="flex-1"
        >
          {editingQuestion ? 'Mettre à jour' : 'Créer la question'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(false);
          }}
        >
          Annuler
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Gestion des QCM</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAutoGenerate}>
            <Plus className="h-4 w-4 mr-2" />
            Générer automatiquement
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle question</DialogTitle>
                <DialogDescription>
                  Définissez une question avec ses options et sa réponse correcte
                </DialogDescription>
              </DialogHeader>
              <QuestionForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    Question {index + 1}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {question.question}
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Modifier la question</DialogTitle>
                        <DialogDescription>
                          Modifiez les détails de votre question
                        </DialogDescription>
                      </DialogHeader>
                      <QuestionForm />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Options</h4>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      {optIndex === question.correctAnswer ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={optIndex === question.correctAnswer ? 'font-medium text-green-800' : ''}>
                        {option}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {question.explanation && (
                <div>
                  <h4 className="font-medium mb-2">Explication</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {question.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {questions.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune question créée</h3>
              <p className="text-muted-foreground text-center mb-4">
                Commencez par créer des questions pour vos QCM
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une question
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
