# Directory Specification: components/ui

## 1. Architectural Alignment
- Layer Level: Level 1 (UI Primitives)
- Zachman Framework Cell: Subcontractor (Assembly) / How
- Domain Scope: Atomic presentation components (Button, Input, Card, Badge, Dialog, Modal, Tabs, Toast, Form).

## 2. Dependency Boundaries & Allowed Imports
**Allowed Imports:**
- @/lib/utils (cn classname helper)
- Radix UI primitives (@radix-ui/*)
- Lucide React icons (lucide-react)
- Class Variance Authority (class-variance-authority)

**Forbidden Imports:**
- Higher layer business features (@/features/*)
- Application components (@/components/dashboard/*)
- Server infrastructure or databases (@/lib/repositories/*, @/lib/prisma.ts)
- Redux store slices (@/lib/store/*)

## 3. Public API Exports (index.ts)
Only items listed below are exported for external consumption:
- Button, buttonVariants
- Input
- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Badge, badgeVariants
- Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- Modal
- Tabs, TabsList, TabsTrigger, TabsContent
- Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction
- Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField

## 4. State & Data Lifecycle
- Pure presentation and Radix uncontrolled/controlled wrappers. Zero domain business logic.

## 5. Data Source Status
- Not applicable (Level 1 UI Presentation Layer)

## 6. Maintenance Log
- 2026-08-25: Initialized directory specification per Master System Instructions.
