/**
 * Explorateur de normes NS 01-001
 * 
 * Permet de naviguer, rechercher et sélectionner des règles normatives
 * pour enrichir la génération de cours.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, BookOpen, ChevronRight, ChevronDown, FileText, AlertCircle, Loader2, Check, Filter, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { normService } from '@/services/normService';
import { NormRule, SommaireNode, NormSearchResult } from '@/types/norms';

interface NormExplorerProps {
  onSelectRules?: (rules: NormRule[]) => void;
  selectionMode?: boolean;
}

export const NormExplorer: React.FC<NormExplorerProps> = ({ 
  onSelectRules,
  selectionMode = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NormSearchResult[]>([]);
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3']));
  const [sommaire, setSommaire] = useState<SommaireNode[]>([]);
  const [stats, setStats] = useState({ ruleCount: 0, loaded: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [allRules, setAllRules] = useState<{ rules: NormRule[]; total: number; pages: number }>({ rules: [], total: 0, pages: 0 });

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      
      try {
        await normService.loadData();
        setSommaire(normService.getSommaire());
        setStats(normService.getStats());
        setAllRules(normService.getAllRules(1, 50));
        toast.success(`${normService.getStats().ruleCount} règles normatives chargées`);
      } catch (error) {
        console.error('Erreur chargement norme:', error);
        setLoadError('Impossible de charger les données normatives');
        toast.error('Erreur de chargement des données normatives');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const results = normService.searchRules(searchQuery, 30);
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleNode = useCallback((index: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const toggleRuleSelection = useCallback((ruleId: string) => {
    setSelectedRules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  }, []);

  const handleApplySelection = useCallback(() => {
    if (onSelectRules && selectedRules.size > 0) {
      const rules = Array.from(selectedRules)
        .map(id => {
          const result = searchResults.find(r => r.rule.id === id);
          if (result) return result.rule;
          return allRules.rules.find(r => r.id === id);
        })
        .filter(Boolean) as NormRule[];
      
      onSelectRules(rules);
      toast.success(`${rules.length} règle(s) sélectionnée(s)`);
    }
  }, [onSelectRules, selectedRules, searchResults, allRules.rules]);

  const handleLoadPage = (page: number) => {
    setCurrentPage(page);
    setAllRules(normService.getAllRules(page, 50));
  };

  const renderSommaireNode = (node: SommaireNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.index);

    return (
      <div key={node.index} className="w-full">
        <div 
          className={`
            flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer
            hover:bg-muted/50 transition-colors
            ${depth === 0 ? 'font-semibold' : ''}
          `}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => hasChildren && toggleNode(node.index)}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )
          ) : (
            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {node.index}
          </Badge>
          <span className="text-sm truncate">{node.label}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="w-full">
            {node.children.map(child => renderSommaireNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderRuleCard = (rule: NormRule, matchType?: 'exact' | 'partial' | 'keyword') => (
    <Card 
      key={rule.id} 
      className={`mb-2 ${selectedRules.has(rule.id) ? 'ring-2 ring-primary' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {selectionMode && (
            <Checkbox
              checked={selectedRules.has(rule.id)}
              onCheckedChange={() => toggleRuleSelection(rule.id)}
              className="mt-1"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                Art. {rule.article}
              </Badge>
              <Badge variant="outline" className="text-xs">
                p. {rule.page}
              </Badge>
              {matchType && (
                <Badge 
                  variant={matchType === 'exact' ? 'default' : 'outline'} 
                  className="text-xs"
                >
                  {matchType === 'exact' ? 'Exact' : matchType === 'partial' ? 'Partiel' : 'Mot-clé'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{rule.titre}</p>
            <p className="text-sm line-clamp-3">{rule.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Chargement des données normatives...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Norme NS 01-001
              </CardTitle>
              <CardDescription>
                {stats.ruleCount} règles de sécurité électrique
              </CardDescription>
            </div>
            {selectionMode && selectedRules.size > 0 && (
              <Button onClick={handleApplySelection}>
                <Check className="w-4 h-4 mr-2" />
                Appliquer ({selectedRules.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par article, mot-clé, concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Résultats de recherche */}
      {searchQuery && searchResults.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Résultats ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {searchResults.map(result => renderRuleCard(result.rule, result.matchType))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Navigation et contenu */}
      {!searchQuery && (
        <Tabs defaultValue="sommaire" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sommaire">
              <BookOpen className="w-4 h-4 mr-2" />
              Sommaire
            </TabsTrigger>
            <TabsTrigger value="all">
              <FileText className="w-4 h-4 mr-2" />
              Toutes les règles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sommaire">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="p-4">
                    {sommaire.map(node => renderSommaireNode(node))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>
                    Page {currentPage} sur {allRules.pages} ({allRules.total} règles)
                  </CardDescription>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => handleLoadPage(currentPage - 1)}
                    >
                      Précédent
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={currentPage >= allRules.pages}
                      onClick={() => handleLoadPage(currentPage + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {allRules.rules.map(rule => renderRuleCard(rule))}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Message si aucun résultat */}
      {searchQuery && searchResults.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucune règle trouvée pour "{searchQuery}". Essayez un autre terme.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default NormExplorer;
