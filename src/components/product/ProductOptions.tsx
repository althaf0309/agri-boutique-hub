import { useState } from "react";
import { useFieldArray, Control } from "react-hook-form";
import { Plus, X, Package, Zap, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Option {
  id?: number;
  name: string;
  values: string[];
}

interface OptionValue {
  id?: number;
  option_id?: number;
  value: string;
}

interface ProductOptionsProps {
  options: Option[];
  onOptionsChange: (options: Option[]) => void;
  onGenerateVariants: () => void;
  categoryId?: number;
}

// Category-specific weight suggestions
const WEIGHT_SUGGESTIONS = {
  // Fruits
  fruits: ["250g", "500g", "1kg", "2kg", "5kg"],
  vegetables: ["250g", "500g", "1kg", "2kg", "Bundle"],
  grains: ["500g", "1kg", "2kg", "5kg", "10kg", "25kg"],
  pulses: ["250g", "500g", "1kg", "2kg", "5kg"],
  spices: ["50g", "100g", "250g", "500g", "1kg"],
  oils: ["250ml", "500ml", "1L", "2L", "5L"],
  dairy: ["250ml", "500ml", "1L", "Pack"],
  beverages: ["250ml", "500ml", "750ml", "1L", "2L"],
  flour: ["500g", "1kg", "2kg", "5kg", "10kg"],
  rice: ["1kg", "2kg", "5kg", "10kg", "25kg"],
  // Default
  default: ["250g", "500g", "1kg", "2kg"]
};

const SIZE_SUGGESTIONS = {
  fruits: ["Small", "Medium", "Large", "Extra Large"],
  vegetables: ["Small", "Medium", "Large", "Baby"],
  default: ["Small", "Medium", "Large"]
};

const PACK_SUGGESTIONS = {
  fruits: ["Single", "Pack of 3", "Pack of 6", "Pack of 12"],
  vegetables: ["Single", "Bundle", "Pack of 2", "Pack of 5"],
  dairy: ["Single", "Pack of 2", "Pack of 4", "Pack of 6"],
  default: ["Single", "Pack", "Bundle"]
};

export function ProductOptions({ options, onOptionsChange, onGenerateVariants, categoryId }: ProductOptionsProps) {
  const [newOptionName, setNewOptionName] = useState("");
  const [newValues, setNewValues] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();

  const getCategorySuggestions = (optionName: string) => {
    const name = optionName.toLowerCase();
    
    if (name.includes('weight') || name.includes('size') || name.includes('pack')) {
      // Try to determine category type from common patterns
      if (name.includes('weight')) return WEIGHT_SUGGESTIONS.default;
      if (name.includes('size')) return SIZE_SUGGESTIONS.default;
      if (name.includes('pack')) return PACK_SUGGESTIONS.default;
    }
    
    return [];
  };

  const getQuickSuggestions = () => {
    return [
      { name: "Weight", suggestions: WEIGHT_SUGGESTIONS.default },
      { name: "Pack Size", suggestions: PACK_SUGGESTIONS.default },
      { name: "Grade", suggestions: ["A", "AA", "AAA", "Premium", "Organic"] },
      { name: "Type", suggestions: ["Fresh", "Dried", "Processed", "Raw"] }
    ];
  };

  const addOption = () => {
    if (!newOptionName.trim()) return;
    
    const newOption: Option = {
      id: Date.now(),
      name: newOptionName.trim(),
      values: []
    };
    
    onOptionsChange([...options, newOption]);
    setNewOptionName("");
    
    toast({
      title: "Option added",
      description: `${newOption.name} option has been added`
    });
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onOptionsChange(updatedOptions);
    
    toast({
      title: "Option removed",
      description: "Option has been removed"
    });
  };

  const addValue = (optionIndex: number) => {
    const valueToAdd = newValues[optionIndex]?.trim();
    if (!valueToAdd) return;
    
    const updatedOptions = [...options];
    if (!updatedOptions[optionIndex].values.includes(valueToAdd)) {
      updatedOptions[optionIndex].values.push(valueToAdd);
      onOptionsChange(updatedOptions);
      setNewValues({ ...newValues, [optionIndex]: "" });
      
      toast({
        title: "Value added",
        description: `${valueToAdd} added to ${options[optionIndex].name}`
      });
    }
  };

  const removeValue = (optionIndex: number, valueIndex: number) => {
    const updatedOptions = [...options];
    updatedOptions[optionIndex].values.splice(valueIndex, 1);
    onOptionsChange(updatedOptions);
  };

  const addQuickOption = (optionName: string, suggestions: string[]) => {
    const newOption: Option = {
      id: Date.now(),
      name: optionName,
      values: suggestions
    };
    
    onOptionsChange([...options, newOption]);
    
    toast({
      title: "Quick option added",
      description: `${optionName} with ${suggestions.length} values added`
    });
  };

  const addSuggestionValue = (optionIndex: number, suggestion: string) => {
    const updatedOptions = [...options];
    if (!updatedOptions[optionIndex].values.includes(suggestion)) {
      updatedOptions[optionIndex].values.push(suggestion);
      onOptionsChange(updatedOptions);
    }
  };

  const canGenerateVariants = options.some(option => option.values.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Options & Variants
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add weight tags, sizes, and other variations for your grocery product
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Options */}
        <div>
          <Label className="text-sm font-medium">Quick Add Options</Label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
            {getQuickSuggestions().map((quick) => (
              <Button
                key={quick.name}
                variant="outline"
                size="sm"
                onClick={() => addQuickOption(quick.name, quick.suggestions)}
                className="justify-start"
              >
                <Plus className="h-3 w-3 mr-1" />
                {quick.name}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Add New Option */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Custom Option</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Weight, Pack Size, Grade..."
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addOption()}
            />
            <Button onClick={addOption} disabled={!newOptionName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        </div>

        {/* Existing Options */}
        {options.length > 0 && (
          <div className="space-y-4">
            {options.map((option, optionIndex) => (
              <Card key={option.id || optionIndex} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{option.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Suggestions for this option */}
                  {getCategorySuggestions(option.name).length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Suggestions:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {getCategorySuggestions(option.name).map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => addSuggestionValue(optionIndex, suggestion)}
                            disabled={option.values.includes(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Values */}
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value, valueIndex) => (
                      <Badge key={valueIndex} variant="secondary" className="gap-1">
                        {value}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeValue(optionIndex, valueIndex)}
                          className="h-3 w-3 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  {/* Add Value */}
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Add ${option.name.toLowerCase()} value...`}
                      value={newValues[optionIndex] || ""}
                      onChange={(e) => setNewValues({ ...newValues, [optionIndex]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addValue(optionIndex)}
                      className="h-8"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => addValue(optionIndex)}
                      disabled={!newValues[optionIndex]?.trim()}
                      className="h-8"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Generate Variants */}
        {canGenerateVariants && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Generate Product Variants</Label>
                  <p className="text-xs text-muted-foreground">
                    Create all possible combinations from your options
                  </p>
                </div>
                <Button onClick={onGenerateVariants} className="gap-2">
                  <Zap className="h-4 w-4" />
                  Generate Variants
                </Button>
              </div>

              {/* Preview combinations */}
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-xs font-medium text-muted-foreground">Preview:</Label>
                <div className="mt-1 text-sm">
                  {options.reduce((total, option) => total * Math.max(option.values.length, 1), 1)} possible combinations
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {options.slice(0, 2).map(option => (
                    option.values.slice(0, 3).map(value => (
                      <Badge key={`${option.name}-${value}`} variant="outline" className="text-xs">
                        {option.name}: {value}
                      </Badge>
                    ))
                  ))}
                  {options.reduce((total, option) => total * Math.max(option.values.length, 1), 1) > 6 && (
                    <Badge variant="outline" className="text-xs">
                      +{options.reduce((total, option) => total * Math.max(option.values.length, 1), 1) - 6} more...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {options.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No options added yet</p>
            <p className="text-xs">Add weight tags, pack sizes, or other variations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
