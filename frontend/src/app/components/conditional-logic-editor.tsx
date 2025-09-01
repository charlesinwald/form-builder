"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Plus, X, Settings } from "lucide-react";
import { ConditionalLogic, ConditionalRule, FormField } from "../../../../shared/types";
import { getAvailableConditionFields, getAvailableOperators } from "@/lib/conditional-logic";

interface ConditionalLogicEditorProps {
  fields: FormField[];
  currentFieldId?: string;
  conditionalLogic?: ConditionalLogic[];
  onUpdate: (conditionalLogic: ConditionalLogic[]) => void;
  targetType?: 'field' | 'section' | 'page';
}

export function ConditionalLogicEditor({
  fields,
  currentFieldId,
  conditionalLogic = [],
  onUpdate,
  targetType = 'field',
}: ConditionalLogicEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const availableFields = getAvailableConditionFields(fields, currentFieldId);

  const addConditionalLogic = () => {
    const newLogic: ConditionalLogic = {
      id: `logic-${Date.now()}`,
      action: 'hide',
      rules: [
        {
          id: `rule-${Date.now()}`,
          fieldId: availableFields[0]?.id || '',
          operator: 'equals',
          value: '',
        }
      ],
      targetType,
      targetId: currentFieldId || '',
    };

    onUpdate([...conditionalLogic, newLogic]);
  };

  const updateConditionalLogic = (logicIndex: number, updates: Partial<ConditionalLogic>) => {
    const updated = [...conditionalLogic];
    updated[logicIndex] = { ...updated[logicIndex], ...updates };
    onUpdate(updated);
  };

  const removeConditionalLogic = (logicIndex: number) => {
    const updated = conditionalLogic.filter((_, index) => index !== logicIndex);
    onUpdate(updated);
  };

  const addRule = (logicIndex: number) => {
    const newRule: ConditionalRule = {
      id: `rule-${Date.now()}`,
      fieldId: availableFields[0]?.id || '',
      operator: 'equals',
      value: '',
      logicalOperator: 'AND',
    };

    const updated = [...conditionalLogic];
    updated[logicIndex].rules.push(newRule);
    onUpdate(updated);
  };

  const updateRule = (logicIndex: number, ruleIndex: number, updates: Partial<ConditionalRule>) => {
    const updated = [...conditionalLogic];
    updated[logicIndex].rules[ruleIndex] = { 
      ...updated[logicIndex].rules[ruleIndex], 
      ...updates 
    };
    onUpdate(updated);
  };

  const removeRule = (logicIndex: number, ruleIndex: number) => {
    const updated = [...conditionalLogic];
    updated[logicIndex].rules = updated[logicIndex].rules.filter((_, index) => index !== ruleIndex);
    onUpdate(updated);
  };

  const getFieldById = (fieldId: string) => fields.find(f => f.id === fieldId);

  const renderValueInput = (rule: ConditionalRule, logicIndex: number, ruleIndex: number) => {
    const field = getFieldById(rule.fieldId);
    if (!field) return null;

    // Don't show value input for empty/not empty operators
    if (rule.operator === 'is_empty' || rule.operator === 'is_not_empty') {
      return null;
    }

    if (field.type === 'select' || field.type === 'radio') {
      return (
        <Select
          value={rule.value as string}
          onValueChange={(value) => updateRule(logicIndex, ruleIndex, { value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <div className="space-y-2">
          <Label className="text-sm">Select values:</Label>
          <div className="space-y-1">
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Switch
                  checked={(rule.value as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = (rule.value as string[]) || [];
                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    updateRule(logicIndex, ruleIndex, { value: newValues });
                  }}
                />
                <Label className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Input
        placeholder="Enter value"
        value={rule.value as string}
        onChange={(e) => updateRule(logicIndex, ruleIndex, { value: e.target.value })}
        type={field.type === 'number' ? 'number' : 'text'}
      />
    );
  };

  if (availableFields.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Add more fields to enable conditional logic
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <Label className="text-sm font-medium">Conditional Logic</Label>
          {conditionalLogic.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {conditionalLogic.length} rule{conditionalLogic.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show'}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {conditionalLogic.map((logic, logicIndex) => (
            <Card key={logic.id} className="border-dashed">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    Logic Rule #{logicIndex + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConditionalLogic(logicIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label className="text-xs">Action</Label>
                    <Select
                      value={logic.action}
                      onValueChange={(action: ConditionalLogic['action']) =>
                        updateConditionalLogic(logicIndex, { action })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="show">Show</SelectItem>
                        <SelectItem value="hide">Hide</SelectItem>
                        <SelectItem value="require">Make Required</SelectItem>
                        <SelectItem value="disable">Disable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <div className="text-xs text-muted-foreground">
                  {logic.action === 'show' ? 'Show' : logic.action === 'hide' ? 'Hide' : logic.action === 'require' ? 'Make required' : 'Disable'} this {targetType} when:
                </div>

                {logic.rules.map((rule, ruleIndex) => (
                  <div key={rule.id} className="space-y-3 p-3 bg-muted/30 rounded-md">
                    {ruleIndex > 0 && (
                      <div className="flex justify-center">
                        <Select
                          value={logic.rules[ruleIndex - 1].logicalOperator || 'AND'}
                          onValueChange={(operator: 'AND' | 'OR') =>
                            updateRule(logicIndex, ruleIndex - 1, { logicalOperator: operator })
                          }
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label className="text-xs">Field</Label>
                        <Select
                          value={rule.fieldId}
                          onValueChange={(fieldId) => {
                            const field = getFieldById(fieldId);
                            updateRule(logicIndex, ruleIndex, { 
                              fieldId,
                              // Reset value when field changes
                              value: field?.type === 'checkbox' ? [] : ''
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select field" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <Label className="text-xs">Operator</Label>
                        <Select
                          value={rule.operator}
                          onValueChange={(operator: ConditionalRule['operator']) =>
                            updateRule(logicIndex, ruleIndex, { operator })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableOperators(getFieldById(rule.fieldId)?.type || 'text').map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-4">
                        <Label className="text-xs">Value</Label>
                        {renderValueInput(rule, logicIndex, ruleIndex)}
                      </div>

                      <div className="col-span-1">
                        {logic.rules.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(logicIndex, ruleIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addRule(logicIndex)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="dashed"
            onClick={addConditionalLogic}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Conditional Logic
          </Button>
        </div>
      )}
    </div>
  );
}