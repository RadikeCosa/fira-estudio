# Custom Hooks Usage Examples

## Overview

This document demonstrates how to use the custom hooks created during the MobileNav refactoring.

## useScrollLock

Locks body scroll when active. Useful for modals, drawers, and full-screen overlays.

### Basic Usage

```typescript
import { useScrollLock } from "@/hooks";

function Modal({ isOpen, onClose, children }) {
  // Lock scroll when modal is open
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div className="bg-white p-6">{children}</div>
    </div>
  );
}
```

### Features

- Automatically locks body scroll when `isLocked` is `true`
- Restores original overflow value on cleanup
- Handles edge cases (e.g., preserves `overflow: scroll`)
- Zero dependencies

## useEscapeKey

Handles ESC key press. Useful for closing modals, drawers, and dialogs.

### Basic Usage

```typescript
import { useEscapeKey } from "@/hooks";

function Dialog({ isOpen, onClose, children }) {
  // Close dialog when ESC is pressed
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return <div className="dialog">{children}</div>;
}
```

### Advanced Usage

```typescript
import { useEscapeKey } from "@/hooks";

function SearchOverlay({ isOpen, onClose }) {
  const handleEscape = () => {
    // Custom logic before closing
    console.log("Search cancelled");
    onClose();
  };

  // Only active when overlay is open
  useEscapeKey(handleEscape, isOpen);

  return isOpen ? <div>Search...</div> : null;
}
```

### Features

- Flexible callback function
- Optional `isActive` parameter (defaults to `true`)
- Cleans up event listener on unmount
- Only responds to Escape key (ignores other keys)

## Using Both Hooks Together

Perfect combination for modals, drawers, and overlays:

```typescript
import { useScrollLock, useEscapeKey } from "@/hooks";

function Drawer({ isOpen, onClose, children }) {
  // Lock scroll when drawer is open
  useScrollLock(isOpen);

  // Close on ESC key
  useEscapeKey(onClose, isOpen);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white z-50">
          {children}
        </div>
      )}
    </>
  );
}
```

## Real-World Examples

### Image Lightbox

```typescript
function Lightbox({ image, isOpen, onClose }) {
  useScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />
      <img src={image} alt="" className="relative max-w-4xl max-h-screen" />
    </div>
  );
}
```

### Filter Panel

```typescript
function FilterPanel({ isOpen, onClose, filters }) {
  useScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40">
      <button onClick={onClose}>Close</button>
      {/* Filter options */}
    </aside>
  );
}
```

### Confirmation Dialog

```typescript
function ConfirmDialog({ isOpen, onConfirm, onCancel, message }) {
  useScrollLock(isOpen);
  useEscapeKey(onCancel, isOpen); // ESC cancels

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-xl">
        <p>{message}</p>
        <div className="flex gap-2 mt-4">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
```

## MobileNav Example

The original implementation that uses both hooks:

```typescript
function MobileNav({ links }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  // Lock body scroll when menu is open
  useScrollLock(isOpen);

  // Close menu on ESC key press
  useEscapeKey(closeMenu, isOpen);

  return (
    // ... menu JSX
  );
}
```

## Best Practices

1. **Always provide isActive parameter**: Only activate hooks when needed
2. **Clean callbacks**: Keep escape callbacks simple and focused
3. **Combine hooks**: Use both for better UX (scroll lock + ESC key)
4. **Test edge cases**: Ensure hooks work with nested components
5. **Performance**: Hooks are lightweight and don't impact performance

## Testing

Both hooks have comprehensive test coverage:

- `useScrollLock`: 5 tests covering lock/unlock, cleanup, state changes
- `useEscapeKey`: 7 tests covering callbacks, activation, cleanup, key filtering

See test files for examples:
- `hooks/useScrollLock.test.ts`
- `hooks/useEscapeKey.test.ts`
