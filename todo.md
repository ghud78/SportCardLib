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

## Brand-Series Relationship & Enhancements
- [x] Add brandId foreign key to series table
- [x] Update series backend procedures to handle brand relationship
- [x] Update Admin Panel series management with brand selector
- [x] Implement cascade filtering: brand selection filters series options
- [x] Set "Base" as default specialty value
- [x] Rename "Season" field to "Season / Year"
- [x] Update existing series data with brand associations

## Subseries Feature (1:n with Series)
- [x] Create subseries table with seriesId foreign key
- [x] Add subseriesId to cards table
- [x] Implement subseries CRUD backend procedures (admin only)
- [x] Add Subseries tab to Admin Panel
- [x] Update card forms with subseries field
- [x] Implement cascade filtering: series selection filters subseries options

## UX Enhancement
- [x] Keep player name and brand after "Add Card & Continue" for faster bulk entry

## Collection Classification Feature
- [x] Create categories table (Basketball, Baseball, F1, Hockey, NFL, etc.)
- [x] Create collectionTypes table (Player, Series, Subseries, Parallels, Inserts, Bases, RCs, etc.)
- [x] Add categoryId and collectionTypeId to collections table
- [x] Implement backend CRUD for categories (admin only)
- [x] Implement backend CRUD for collection types (admin only)
- [x] Add Categories tab to Admin Panel
- [x] Add Collection Types tab to Admin Panel
- [x] Update collection create/edit forms with category and type selectors
- [x] Seed initial categories data
- [x] Seed initial collection types data

## Card Image Management
- [x] Add imageFrontUrl and imageBackUrl fields to cards table
- [x] Implement image upload backend with S3 storage
- [x] Add manual image upload UI to Add Card page
- [x] Add manual image upload UI to Edit Card page
- [x] Build smart search query from card metadata
- [x] Implement automatic image search backend
- [x] Create image selection dialog (max 9 results)
- [x] Add "Find Images" button to Edit Card page
- [x] Add image status columns to Collection Detail table
- [x] Implement hover thumbnail expansion for images

## Image Search Improvement
- [x] Implement fallback search strategy (simpler query if detailed search fails)

## Image Search Debug
- [x] Add debug logging to backend search
- [x] Return debug info (queries, endpoint, results) from backend
- [x] Display debug information in UI dialog

## eBay API Integration
- [x] Add eBay credentials as secrets
- [x] Implement eBay OAuth token generation
- [x] Create eBay search function
- [x] Integrate eBay as third fallback in image search
- [x] Update debug display for eBay results
- [x] Fix "Not Found" error in image search

## eBay Production API Upgrade
- [x] Implement eBay Marketplace Account Deletion notification endpoint (Opted out - app doesn't store eBay user data)
- [x] Update eBay API to use Production endpoints instead of Sandbox
- [x] Update environment variables documentation for Production credentials

## Bug Fixes
- [x] Fix "eBay credentials not configured" error - credentials not being loaded from environment (fixed by server restart)
