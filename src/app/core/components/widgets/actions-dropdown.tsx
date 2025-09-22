import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu';

export interface ActionItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  hidden?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface ComponentActionItem {
  label: string;
  component: React.ReactNode;
  variant?: 'default' | 'destructive';
  hidden?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface ActionsDropdownProps {
  actions?: ActionItem[];
  componentActions?: ComponentActionItem[];
  triggerClassName?: string;
}

export function ActionsDropdown({ actions = [], componentActions = [], triggerClassName }: ActionsDropdownProps) {
  const visibleActions = actions.filter(action => !action.hidden);
  const visibleComponentActions = componentActions.filter(action => !action.hidden);
  
  if (visibleActions.length === 0 && visibleComponentActions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visibleActions.map((action, index) => (
          <React.Fragment key={`action-${index}`}>
            <DropdownMenuItem
              onClick={action.onClick}
              variant={action.variant}
              disabled={action.disabled}
              className="flex items-center gap-2"
            >
              {action.icon && action.icon}
              {action.label}
            </DropdownMenuItem>
            {index < visibleActions.length - 1 && action.variant === 'destructive' && (
              <DropdownMenuSeparator />
            )}
          </React.Fragment>
        ))}
        {visibleActions.length > 0 && visibleComponentActions.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {visibleComponentActions.map((action, index) => (
          <div key={`component-${index}`} className="p-0">
            {action.component}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ComponentActionsDropdown({ componentActions, triggerClassName }: { componentActions: ComponentActionItem[], triggerClassName?: string }) {
  const visibleActions = componentActions.filter(action => !action.hidden);
  
  if (visibleActions.length === 0) {
    return (
      <div className="flex flex-row gap-2">
        {componentActions.map((action, index) => (
          <div key={index}>{action.component}</div>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-1">
        {visibleActions.map((action, index) => (
          <div key={index} className="w-full">
            {action.component}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}