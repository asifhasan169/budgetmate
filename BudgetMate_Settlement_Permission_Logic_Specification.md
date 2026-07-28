# BudgetMate - Settlement & Permission Logic Specification

**Version:** 1.1

**Purpose:** Functional requirements and authorization rules for
BudgetMate using Supabase Authentication and Row Level Security (RLS).

------------------------------------------------------------------------

# Objective

Every roommate should only be able to manage their own financial
actions. Shared data is visible only to involved users and editable only
by the owner or responsible participant.

------------------------------------------------------------------------

# Supabase Authentication

These authorization rules still apply when using **Supabase**.

-   **Supabase Auth** verifies who the user is.
-   **Row Level Security (RLS)** determines what data that user can read
    or modify.

Implement authorization using Supabase Auth + RLS policies.

Examples: - Only the expense creator can update an expense
(`created_by = auth.uid()`). - Only the debtor can submit a payment. -
Only the creditor can accept or reject a payment. - Users can only query
settlements where they are the debtor or creditor.

------------------------------------------------------------------------

# User Roles

## Room Owner

Permissions: - Create/Delete Room - Invite or Remove Roommates - Manage
Room Settings

Restrictions: - Cannot edit another roommate's expenses. - Cannot
complete settlements on behalf of others.

## Roommate

Permissions: - Add Expenses - View Shared Expenses - Pay Own Dues -
Accept Incoming Payments - Manage Personal Budget

Restrictions: - Cannot edit another roommate's financial records.

------------------------------------------------------------------------

# Expense Ownership

Only the expense creator can: - Edit - Delete - Change amount - Change
category - Change split - Change payer - Upload receipt

Other roommates can: - View the expense - View only their own share

------------------------------------------------------------------------

# Settlement Ownership

## Debtor

Can: - Submit payment - Upload payment proof - Mark payment as completed

Cannot: - Accept settlement - Reject settlement - Change amount

## Creditor

Can: - Accept payment - Reject payment - Add remarks

Cannot: - Submit payment for another user - Modify settlement amount

------------------------------------------------------------------------

# Visibility Rules

Users should only see settlements that involve them.

Do **not** display settlements between other roommates.

------------------------------------------------------------------------

# Dashboard & Analytics

Each roommate should only see: - Their balances - Their expenses - Their
settlements - Their personal budget - Their analytics

Room-wide analytics may be available only to the Room Owner.

------------------------------------------------------------------------

# Budget Permissions

Each roommate can edit only their own budget.

Shared budgets, if implemented, should be editable only by the Room
Owner.

------------------------------------------------------------------------

# Activity Timeline

Everyone can view activity history.

No user can edit historical records.

------------------------------------------------------------------------

# Settlement Workflow

``` text
Expense Created
      ↓
Split Calculated
      ↓
Settlement Generated
      ↓
Debtor Pays
      ↓
Creditor Reviews
      ↓
Accepted → Completed
Rejected → Pending Again
```
