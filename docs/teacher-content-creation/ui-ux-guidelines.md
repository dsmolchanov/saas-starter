# Teacher Content Creation System - UI/UX Guidelines

## Design Philosophy

### Core Principles

1. **Simplicity First**: Complex features should be progressively disclosed
2. **Teacher-Centric**: Designed for yoga teachers, not developers
3. **Mindful Design**: Calm, focused interface reflecting yoga principles
4. **Mobile-Responsive**: Full functionality on all devices
5. **Accessibility**: WCAG 2.1 AA compliant

## Visual Design System

### Color Palette

#### Primary Colors
```scss
// Main brand colors
$primary-purple: #8B5CF6;    // Chakra crown
$primary-pink: #EC4899;      // Heart energy
$primary-gradient: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);

// Semantic colors
$success-green: #10B981;     // Growth, balance
$warning-amber: #F59E0B;     // Attention, energy
$error-red: #EF4444;         // Stop, contraindication
$info-blue: #3B82F6;         // Calm, information

// Neutral palette
$gray-50: #F9FAFB;          // Background
$gray-100: #F3F4F6;         // Cards
$gray-200: #E5E7EB;         // Borders
$gray-300: #D1D5DB;         // Disabled
$gray-400: #9CA3AF;         // Placeholder
$gray-500: #6B7280;         // Secondary text
$gray-600: #4B5563;         // Primary text
$gray-700: #374151;         // Headings
$gray-800: #1F2937;         // Dark text
$gray-900: #111827;         // Black text
```

#### Content Type Colors
```scss
// Each content type has a signature color
$type-colors: (
  'class': #8B5CF6,        // Purple - transformation
  'breathing': #3B82F6,    // Blue - air element
  'meditation': #6366F1,   // Indigo - third eye
  'asana': #10B981,        // Green - growth
  'quick_flow': #F59E0B,   // Amber - energy
  'challenge': #EF4444,    // Red - fire
  'program': #8B5CF6,      // Purple - journey
  'workshop': #14B8A6,     // Teal - learning
  'live_class': #EC4899    // Pink - connection
);
```

### Typography

```scss
// Font families
$font-sans: 'Inter', system-ui, -apple-system, sans-serif;
$font-display: 'Sora', 'Inter', sans-serif;
$font-mono: 'JetBrains Mono', monospace;

// Font sizes
$text-xs: 0.75rem;      // 12px - captions
$text-sm: 0.875rem;     // 14px - secondary
$text-base: 1rem;       // 16px - body
$text-lg: 1.125rem;     // 18px - lead
$text-xl: 1.25rem;      // 20px - subtitle
$text-2xl: 1.5rem;      // 24px - h3
$text-3xl: 1.875rem;    // 30px - h2
$text-4xl: 2.25rem;     // 36px - h1
$text-5xl: 3rem;        // 48px - hero

// Line heights
$leading-tight: 1.25;
$leading-snug: 1.375;
$leading-normal: 1.5;
$leading-relaxed: 1.625;
$leading-loose: 2;
```

### Spacing System

```scss
// Based on 8px grid
$space-0: 0;
$space-1: 0.25rem;   // 4px
$space-2: 0.5rem;    // 8px
$space-3: 0.75rem;   // 12px
$space-4: 1rem;      // 16px
$space-5: 1.25rem;   // 20px
$space-6: 1.5rem;    // 24px
$space-8: 2rem;      // 32px
$space-10: 2.5rem;   // 40px
$space-12: 3rem;     // 48px
$space-16: 4rem;     // 64px
$space-20: 5rem;     // 80px
$space-24: 6rem;     // 96px
```

## Component Guidelines

### Creation Wizard

#### Layout Structure
```tsx
<WizardContainer>
  <WizardHeader>
    <ProgressBar steps={totalSteps} current={currentStep} />
    <StepTitle>{stepTitles[currentStep]}</StepTitle>
  </WizardHeader>
  
  <WizardBody>
    <MainContent>
      {/* Step-specific content */}
    </MainContent>
    
    <Sidebar>
      <Preview />
      <Tips />
    </Sidebar>
  </WizardBody>
  
  <WizardFooter>
    <Button variant="ghost">Save Draft</Button>
    <div>
      <Button variant="outline" onClick={goBack}>
        Previous
      </Button>
      <Button variant="primary" onClick={goNext}>
        Next
      </Button>
    </div>
  </WizardFooter>
</WizardContainer>
```

#### Step Components

##### Basic Information Step
```tsx
<StepContainer>
  <FormGroup>
    <Label required>Title</Label>
    <Input 
      placeholder="e.g., Morning Energizing Flow"
      maxLength={100}
      showCounter
    />
    <HelperText>
      Make it descriptive and searchable
    </HelperText>
  </FormGroup>
  
  <FormGroup>
    <Label>Description</Label>
    <RichTextEditor
      placeholder="Describe what students will experience..."
      maxLength={500}
      suggestions={aiSuggestions}
    />
  </FormGroup>
  
  <FormRow>
    <FormGroup>
      <Label required>Difficulty</Label>
      <DifficultySelector />
    </FormGroup>
    
    <FormGroup>
      <Label required>Duration</Label>
      <DurationPicker />
    </FormGroup>
  </FormRow>
  
  <FormGroup>
    <Label>Tags</Label>
    <TagInput 
      suggestions={popularTags}
      max={10}
    />
  </FormGroup>
</StepContainer>
```

### Pose Sequencer

#### Visual Timeline Interface
```tsx
<SequencerContainer>
  <SequencerToolbar>
    <SearchPoses />
    <ViewToggle /> {/* Timeline | Grid | List */}
    <DurationDisplay total={totalDuration} />
  </SequencerToolbar>
  
  <SequencerBody>
    <PoseLibrary>
      <CategoryTabs />
      <PoseGrid 
        draggable
        showSanskrit
        showDuration
      />
    </PoseLibrary>
    
    <Timeline>
      <TimelineHeader>
        <TimeMarkers />
      </TimelineHeader>
      
      <TimelineTrack>
        {poses.map(pose => (
          <PoseBlock
            key={pose.id}
            pose={pose}
            duration={pose.duration}
            draggable
            resizable
          />
        ))}
      </TimelineTrack>
      
      <TimelineFooter>
        <PlaybackControls />
        <ZoomControls />
      </TimelineFooter>
    </Timeline>
  </SequencerBody>
</SequencerContainer>
```

#### Pose Card Design
```tsx
<PoseCard>
  <PoseImage>
    <img src={pose.thumbnail} alt={pose.name} />
    <DifficultyBadge level={pose.difficulty} />
  </PoseImage>
  
  <PoseInfo>
    <PoseName>
      <Sanskrit>{pose.name_sanskrit}</Sanskrit>
      <English>{pose.name_english}</English>
    </PoseName>
    
    <PoseMeta>
      <Duration>{pose.duration}s</Duration>
      <FocusAreas>{pose.focus.join(', ')}</FocusAreas>
    </PoseMeta>
  </PoseInfo>
  
  <PoseActions>
    <IconButton icon={Info} tooltip="Details" />
    <IconButton icon={Plus} tooltip="Add to sequence" />
  </PoseActions>
</PoseCard>
```

### Breathing Pattern Designer

```tsx
<BreathingDesigner>
  <PatternVisualizer>
    <CircleBreathing 
      inhale={4}
      holdIn={4}
      exhale={4}
      holdOut={4}
      animated
    />
  </PatternVisualizer>
  
  <PatternControls>
    <RatioSliders>
      <Slider label="Inhale" min={1} max={10} />
      <Slider label="Hold" min={0} max={10} />
      <Slider label="Exhale" min={1} max={10} />
      <Slider label="Hold" min={0} max={10} />
    </RatioSliders>
    
    <PresetPatterns>
      <PatternButton>4-7-8 Relaxing</PatternButton>
      <PatternButton>Box Breathing</PatternButton>
      <PatternButton>Energizing</PatternButton>
    </PresetPatterns>
  </PatternControls>
  
  <AudioSettings>
    <Toggle>Voice Guidance</Toggle>
    <Toggle>Metronome</Toggle>
    <Select>Background Sound</Select>
  </AudioSettings>
</BreathingDesigner>
```

### Media Upload

```tsx
<MediaUploader>
  <DropZone
    accept="video/*, audio/*, image/*"
    maxSize="5GB"
    multiple
  >
    <DropZoneContent>
      <UploadIcon size={48} />
      <Text>Drop files here or click to browse</Text>
      <Text size="small" muted>
        MP4, MOV, MP3, JPG up to 5GB
      </Text>
    </DropZoneContent>
  </DropZone>
  
  <UploadQueue>
    {uploads.map(upload => (
      <UploadItem key={upload.id}>
        <Thumbnail src={upload.thumbnail} />
        <UploadInfo>
          <FileName>{upload.name}</FileName>
          <FileSize>{formatSize(upload.size)}</FileSize>
        </UploadInfo>
        <ProgressBar value={upload.progress} />
        <UploadActions>
          {upload.status === 'uploading' && (
            <IconButton icon={Pause} />
          )}
          <IconButton icon={X} onClick={() => cancel(upload.id)} />
        </UploadActions>
      </UploadItem>
    ))}
  </UploadQueue>
</MediaUploader>
```

## Interaction Patterns

### Progressive Disclosure

```tsx
// Start simple, reveal complexity
<ContentForm>
  {/* Always visible - essential fields */}
  <EssentialFields>
    <Title />
    <Type />
    <Duration />
  </EssentialFields>
  
  {/* Collapsed by default */}
  <CollapsibleSection title="Advanced Settings">
    <Scheduling />
    <Monetization />
    <AccessControl />
  </CollapsibleSection>
  
  {/* Context-aware options */}
  {contentType === 'program' && (
    <ProgramSpecificOptions />
  )}
</ContentForm>
```

### Inline Editing

```tsx
// Edit in place for quick updates
<EditableField
  value={title}
  onSave={updateTitle}
  validation={validateTitle}
>
  {({ isEditing, value, onChange, save, cancel }) => (
    isEditing ? (
      <InputGroup>
        <Input value={value} onChange={onChange} />
        <IconButton icon={Check} onClick={save} />
        <IconButton icon={X} onClick={cancel} />
      </InputGroup>
    ) : (
      <ClickToEdit>
        <Text>{value}</Text>
        <EditIcon />
      </ClickToEdit>
    )
  )}
</EditableField>
```

### Auto-save

```tsx
// Continuous saving with visual feedback
const AutoSaveIndicator = () => {
  const { status, lastSaved } = useAutoSave();
  
  return (
    <SaveStatus>
      {status === 'saving' && <Spinner size="small" />}
      {status === 'saved' && <CheckIcon color="green" />}
      {status === 'error' && <AlertIcon color="red" />}
      
      <Text size="small" muted>
        {status === 'saving' && 'Saving...'}
        {status === 'saved' && `Saved ${timeAgo(lastSaved)}`}
        {status === 'error' && 'Failed to save'}
      </Text>
    </SaveStatus>
  );
};
```

### Drag and Drop

```tsx
// Visual feedback during drag operations
<DraggableList
  onDragStart={(item) => {
    // Add dragging class
    // Show drop zones
  }}
  onDragOver={(e) => {
    // Show insertion point
    // Highlight valid drop zones
  }}
  onDrop={(item, position) => {
    // Animate to new position
    // Update order
  }}
>
  {items.map(item => (
    <DraggableItem
      key={item.id}
      handle={<DragHandle />}
      preview={<ItemPreview item={item} />}
    >
      <ItemContent />
    </DraggableItem>
  ))}
</DraggableList>
```

## Responsive Design

### Breakpoints
```scss
$breakpoints: (
  'sm': 640px,   // Mobile landscape
  'md': 768px,   // Tablet portrait
  'lg': 1024px,  // Tablet landscape
  'xl': 1280px,  // Desktop
  '2xl': 1536px  // Large desktop
);
```

### Mobile-First Approach
```scss
.content-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Touch Optimizations
```tsx
// Larger touch targets on mobile
const Button = styled.button`
  min-height: 44px; // iOS recommendation
  min-width: 44px;
  padding: ${props => props.size === 'small' ? '8px 16px' : '12px 24px'};
  
  @media (hover: none) {
    // Touch device
    min-height: 48px; // Material Design recommendation
  }
`;

// Swipe gestures for mobile
<SwipeableViews
  onChangeIndex={handleChangeIndex}
  enableMouseEvents
>
  {steps.map(step => (
    <StepContent key={step.id} />
  ))}
</SwipeableViews>
```

## Animation Guidelines

### Micro-interactions
```scss
// Subtle feedback animations
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.button {
  transition: all 200ms ease-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.loading {
    animation: pulse 1.5s infinite;
  }
}
```

### Page Transitions
```tsx
// Smooth page transitions with Framer Motion
<AnimatePresence exitBeforeEnter>
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: 'easeInOut' }}
  >
    <StepContent />
  </motion.div>
</AnimatePresence>
```

### Loading States
```tsx
// Skeleton screens for better perceived performance
const ContentSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
    <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-4/6 mb-4" />
    
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-200 rounded" />
      ))}
    </div>
  </div>
);
```

## Accessibility

### Keyboard Navigation
```tsx
// Full keyboard support
const KeyboardNavigableList = ({ items, onSelect }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  useKeyboard({
    'ArrowDown': () => setFocusedIndex(i => Math.min(i + 1, items.length - 1)),
    'ArrowUp': () => setFocusedIndex(i => Math.max(i - 1, 0)),
    'Enter': () => onSelect(items[focusedIndex]),
    'Escape': () => onClose()
  });
  
  return (
    <List role="listbox">
      {items.map((item, index) => (
        <ListItem
          key={item.id}
          role="option"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-selected={index === focusedIndex}
          ref={index === focusedIndex ? focusRef : null}
        >
          {item.label}
        </ListItem>
      ))}
    </List>
  );
};
```

### Screen Reader Support
```tsx
// Proper ARIA labels and live regions
<form aria-label="Create new yoga class">
  <div role="group" aria-labelledby="basic-info">
    <h2 id="basic-info">Basic Information</h2>
    
    <label htmlFor="title">
      Class Title
      <span aria-label="required">*</span>
    </label>
    <input
      id="title"
      aria-required="true"
      aria-invalid={errors.title ? 'true' : 'false'}
      aria-describedby="title-error"
    />
    {errors.title && (
      <span id="title-error" role="alert">
        {errors.title}
      </span>
    )}
  </div>
  
  <div aria-live="polite" aria-atomic="true">
    {saving && 'Saving your changes...'}
    {saved && 'Changes saved successfully'}
  </div>
</form>
```

### Color Contrast
```scss
// Ensure WCAG AA compliance
.text-primary {
  color: #374151; // 7:1 contrast on white
}

.text-secondary {
  color: #6B7280; // 4.5:1 contrast on white
}

.text-on-primary {
  color: #FFFFFF; // White text on brand colors
}

// Focus indicators
.focusable:focus-visible {
  outline: 2px solid #8B5CF6;
  outline-offset: 2px;
}
```

## Error Handling

### Inline Validation
```tsx
<FormField>
  <Input
    value={value}
    onChange={handleChange}
    onBlur={validate}
    status={error ? 'error' : valid ? 'success' : 'default'}
  />
  
  {error && (
    <ErrorMessage>
      <ErrorIcon />
      {error}
    </ErrorMessage>
  )}
  
  {warning && (
    <WarningMessage>
      <WarningIcon />
      {warning}
    </WarningMessage>
  )}
  
  {helperText && (
    <HelperText>
      {helperText}
    </HelperText>
  )}
</FormField>
```

### Error States
```tsx
// Graceful error handling
const ErrorBoundary = ({ children, fallback }) => {
  return (
    <ErrorBoundaryComponent
      fallback={
        <ErrorState>
          <ErrorIllustration />
          <h2>Something went wrong</h2>
          <p>We're having trouble loading this content</p>
          <Button onClick={retry}>Try Again</Button>
          <Button variant="link" onClick={contactSupport}>
            Contact Support
          </Button>
        </ErrorState>
      }
    >
      {children}
    </ErrorBoundaryComponent>
  );
};
```

## Empty States

```tsx
// Helpful empty states
const EmptyState = ({ type }) => {
  const configs = {
    'no-content': {
      icon: <YogaMatIcon />,
      title: 'No content yet',
      message: 'Create your first class to get started',
      action: 'Create Class'
    },
    'no-results': {
      icon: <SearchIcon />,
      title: 'No results found',
      message: 'Try adjusting your filters or search terms',
      action: 'Clear Filters'
    },
    'no-students': {
      icon: <UsersIcon />,
      title: 'No students yet',
      message: 'Share your content to attract students',
      action: 'Share Content'
    }
  };
  
  const config = configs[type];
  
  return (
    <EmptyStateContainer>
      <IconWrapper>{config.icon}</IconWrapper>
      <Title>{config.title}</Title>
      <Message>{config.message}</Message>
      <Button variant="primary">{config.action}</Button>
    </EmptyStateContainer>
  );
};
```

## Success Feedback

```tsx
// Clear success indicators
const SuccessNotification = ({ message, action }) => (
  <Toast variant="success">
    <CheckCircleIcon />
    <ToastContent>
      <ToastTitle>{message}</ToastTitle>
      {action && (
        <ToastAction onClick={action.onClick}>
          {action.label}
        </ToastAction>
      )}
    </ToastContent>
    <CloseButton />
  </Toast>
);

// Celebration for milestones
const MilestoneReached = ({ milestone }) => (
  <ConfettiAnimation>
    <Card className="text-center p-8">
      <TrophyIcon size={64} className="text-gold mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">
        Congratulations! 🎉
      </h2>
      <p className="text-gray-600 mb-6">
        {milestone.message}
      </p>
      <Button>Share Achievement</Button>
    </Card>
  </ConfettiAnimation>
);
```

## Dark Mode Support

```scss
// Automatic dark mode with CSS variables
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --border: #E5E7EB;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #111827;
    --bg-secondary: #1F2937;
    --text-primary: #F9FAFB;
    --text-secondary: #9CA3AF;
    --border: #374151;
  }
}

.card {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-color: var(--border);
}
```

## Performance Guidelines

### Image Optimization
```tsx
// Responsive images with Next.js
<Image
  src={thumbnail}
  alt={title}
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  placeholder="blur"
  blurDataURL={blurDataUrl}
  loading="lazy"
/>
```

### Code Splitting
```tsx
// Lazy load heavy components
const PoseSequencer = lazy(() => import('./PoseSequencer'));
const VideoEditor = lazy(() => import('./VideoEditor'));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

// Use with Suspense
<Suspense fallback={<SequencerSkeleton />}>
  <PoseSequencer />
</Suspense>
```

### Virtual Scrolling
```tsx
// For large lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={poses.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <PoseCard
      style={style}
      pose={poses[index]}
    />
  )}
</FixedSizeList>
```

This comprehensive UI/UX guidelines document ensures consistent, accessible, and delightful user experience across the teacher content creation system.