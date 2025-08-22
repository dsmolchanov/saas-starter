'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface BrowseFiltersProps {
  availableFilters: {
    styles?: FilterOption[];
    levels?: FilterOption[];
    focusAreas?: FilterOption[];
    categories?: FilterOption[];
  };
  type?: 'classes' | 'courses';
}

export function BrowseFilters({ availableFilters, type = 'classes' }: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Get current filter values from URL
  const getFilterValues = (key: string): string[] => {
    if (!searchParams) return [];
    const values = searchParams.get(key);
    return values ? values.split(',') : [];
  };

  const selectedStyles = getFilterValues('styles');
  const selectedLevels = getFilterValues('levels');
  const selectedFocusAreas = getFilterValues('focus');
  const selectedCategories = getFilterValues('categories');

  const totalFilters = selectedStyles.length + selectedLevels.length + selectedFocusAreas.length + selectedCategories.length;

  // Update URL with new filter values
  const updateFilters = (filterType: string, values: string[]) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    if (values.length > 0) {
      params.set(filterType, values.join(','));
    } else {
      params.delete(filterType);
    }
    
    router.push(`${pathname || '/'}?${params.toString()}`);
  };

  // Toggle a single filter value
  const toggleFilter = (filterType: string, value: string, currentValues: string[]) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateFilters(filterType, newValues);
  };

  // Clear all filters
  const clearAllFilters = () => {
    router.push(pathname || '/');
    setIsOpen(false);
  };

  // Remove a single filter
  const removeFilter = (filterType: string, value: string, currentValues: string[]) => {
    const newValues = currentValues.filter(v => v !== value);
    updateFilters(filterType, newValues);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            FILTERS
            {totalFilters > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {totalFilters}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Refine your search to find the perfect {type === 'courses' ? 'course' : 'class'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Difficulty/Level Filter */}
            {availableFilters.levels && availableFilters.levels.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Difficulty Level</h3>
                <div className="space-y-2">
                  {availableFilters.levels.map((level) => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`level-${level.value}`}
                        checked={selectedLevels.includes(level.value)}
                        onCheckedChange={() => toggleFilter('levels', level.value, selectedLevels)}
                      />
                      <label 
                        htmlFor={`level-${level.value}`} 
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {level.label}
                        {level.count !== undefined && (
                          <span className="text-muted-foreground ml-1">({level.count})</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Style Filter (for classes) */}
            {type === 'classes' && availableFilters.styles && availableFilters.styles.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Yoga Style</h3>
                <div className="space-y-2">
                  {availableFilters.styles.map((style) => (
                    <div key={style.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`style-${style.value}`}
                        checked={selectedStyles.includes(style.value)}
                        onCheckedChange={() => toggleFilter('styles', style.value, selectedStyles)}
                      />
                      <label 
                        htmlFor={`style-${style.value}`} 
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {style.label}
                        {style.count !== undefined && (
                          <span className="text-muted-foreground ml-1">({style.count})</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Focus Areas Filter (for classes) */}
            {type === 'classes' && availableFilters.focusAreas && availableFilters.focusAreas.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Focus Areas</h3>
                <div className="space-y-2">
                  {availableFilters.focusAreas.map((area) => (
                    <div key={area.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`focus-${area.value}`}
                        checked={selectedFocusAreas.includes(area.value)}
                        onCheckedChange={() => toggleFilter('focus', area.value, selectedFocusAreas)}
                      />
                      <label 
                        htmlFor={`focus-${area.value}`} 
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {area.label}
                        {area.count !== undefined && (
                          <span className="text-muted-foreground ml-1">({area.count})</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter (for courses) */}
            {type === 'courses' && availableFilters.categories && availableFilters.categories.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Category</h3>
                <div className="space-y-2">
                  {availableFilters.categories.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.value}`}
                        checked={selectedCategories.includes(category.value)}
                        onCheckedChange={() => toggleFilter('categories', category.value, selectedCategories)}
                      />
                      <label 
                        htmlFor={`category-${category.value}`} 
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {category.label}
                        {category.count !== undefined && (
                          <span className="text-muted-foreground ml-1">({category.count})</span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 space-y-2">
              <Button 
                onClick={() => setIsOpen(false)} 
                className="w-full"
              >
                Apply Filters
              </Button>
              {totalFilters > 0 && (
                <Button 
                  onClick={clearAllFilters} 
                  variant="outline" 
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active filters display */}
      {totalFilters > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {selectedLevels.map((level) => (
            <Badge key={`level-${level}`} className="gap-1">
              {level}
              <button 
                onClick={() => removeFilter('levels', level, selectedLevels)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedStyles.map((style) => (
            <Badge key={`style-${style}`} className="gap-1">
              {style}
              <button 
                onClick={() => removeFilter('styles', style, selectedStyles)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedFocusAreas.map((area) => {
            const label = availableFilters.focusAreas?.find(f => f.value === area)?.label || area;
            return (
              <Badge key={`focus-${area}`} className="gap-1">
                {label}
                <button 
                  onClick={() => removeFilter('focus', area, selectedFocusAreas)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          {selectedCategories.map((category) => {
            const label = availableFilters.categories?.find(c => c.value === category)?.label || category;
            return (
              <Badge key={`category-${category}`} className="gap-1">
                {label}
                <button 
                  onClick={() => removeFilter('categories', category, selectedCategories)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button 
            onClick={clearAllFilters} 
            variant="ghost" 
            size="sm" 
            className="h-8 text-sm"
          >
            Clear all
          </Button>
        </div>
      )}
    </>
  );
}