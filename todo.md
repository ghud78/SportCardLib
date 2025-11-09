# Sport Card Collector - TODO

## Database Schema
- [x] Create collections table with user relationship
- [x] Create cards table with collection relationship and all card attributes
- [x] Push database schema to cloud database

## Backend - Collection Management
- [x] Implement create collection procedure
- [x] Implement list collections procedure
- [x] Implement update collection procedure
- [x] Implement delete collection procedure

## Backend - Card Management
- [x] Implement add card procedure with all attributes
- [x] Implement list cards by collection procedure
- [x] Implement update card procedure
- [x] Implement delete card procedure
- [x] Implement get unique brands procedure
- [x] Implement get unique series procedure

## Frontend - Authentication
- [x] Update Home page with login/logout functionality
- [x] Add user profile display

## Frontend - Collection Management
- [x] Create Collections page with list view
- [x] Add create collection form/dialog
- [x] Add edit collection functionality
- [x] Add delete collection with confirmation
- [x] Add navigation to collections page

## Frontend - Card Management
- [x] Create Card Input page following specification flow
- [x] Implement Step 1: Player name input
- [x] Implement Step 2: Select brand dropdown with type option
- [x] Implement Step 3: Select series dropdown with type option
- [x] Implement Step 4: Enter season (year or range)
- [x] Implement Step 5: Enter card number
- [x] Implement smart defaults (remember last selections)
- [x] Add card list view within collection
- [x] Add edit card functionality
- [x] Add delete card functionality

## Design & UX
- [x] Choose color palette and design style
- [x] Implement responsive layout
- [x] Add loading states for all operations
- [x] Add error handling and user feedback

## Deployment
- [x] Create GitHub repository
- [x] Push code to GitHub
- [x] Create deployment documentation
- [x] Test deployed application

## Admin Reference Data Management
- [x] Create brands table in database
- [x] Create series table in database
- [x] Create specialties table in database
- [x] Add card flags: autograph, numbered (with xx/yyy format)
- [x] Implement brand CRUD backend procedures (admin only)
- [x] Implement series CRUD backend procedures (admin only)
- [x] Implement specialties CRUD backend procedures (admin only)
- [x] Build admin brands management page
- [x] Build admin series management page
- [x] Build admin specialties management page
- [x] Update card input form with autocomplete for brands/series
- [x] Add autograph and numbered flags to card form
- [x] Seed initial brands data
- [x] Seed initial series data
- [x] Set current user as admin
- [x] Test all admin features
- [x] Test regular user restrictions

## Bug Fixes
- [x] Fix Select component empty string error in AddCard form
- [x] Fix Select component empty string error in EditCard form
