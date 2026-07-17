---
name: add_3_layer_feature
description: "Triggers when adding a new page or modular feature involving backend Web API controllers, services, repositories, or React frontend components"
---

# Add 3-Layer Feature Guide (with React Frontend)

Follow this guide to introduce a new modular component into the application using the 3-layer architecture backend and a React SPA frontend:

## 1. Create Model Entity
- Create the database entity file under [backend/Models/](file:///C:/Users/tin.dang/source/AI_Project/Personal_Finance_Tracker_Upgrade/backend/Models).
- Update the Database (following the `database_migration` skill if schema changes are required).

## 2. Define Repository (Data Layer)
- **Interface**: Create `I[EntityName]Repository.cs` under [backend/Repositories/Interfaces/](file:///C:/Users/tin.dang/source/AI_Project/Personal_Finance_Tracker_Upgrade/backend/Repositories/Interfaces).
  - Declare standard CRUD signatures asynchronously (e.g. `Task<IEnumerable<T>> GetAllAsync()`).
- **Implementation**: Create `[EntityName]Repository.cs` under [backend/Repositories/](file:///C:/Users/tin.dang/source/AI_Project/Personal_Finance_Tracker_Upgrade/backend/Repositories).
  - Implement the interface using `FinanceDbContext`.

## 3. Define Service (Business Layer)
- **Interface**: Create `I[EntityName]Service.cs` under [backend/Services/Interfaces/](file:///C:/Users/tin.dang/source/AI_Project/Personal_Finance_Tracker_Upgrade/backend/Services/Interfaces).
  - Define high-level business capabilities.
- **Implementation**: Create `[EntityName]Service.cs` under [backend/Services/](file:///C:/Users/tin.dang/source/AI_Project/Personal_Finance_Tracker_Upgrade/backend/Services).
  - Implement business logic, validations, and inject `I[EntityName]Repository`.

## 4. Register Services in Dependency Injection (Program.cs)
Open [backend/Program.cs](file:///C:/Users/tin.dang/source/AI_Project/Personal_Finance_Tracker_Upgrade/backend/Program.cs) and register the new classes:
```csharp
// Register Repositories
builder.Services.AddScoped<I[EntityName]Repository, [EntityName]Repository>();

// Register Services
builder.Services.AddScoped<I[EntityName]Service, [EntityName]Service>();
```

## 5. Implement Controller (Presentation Layer - Web API)
- Create `[EntityName]ApiController.cs` (decorated with `[ApiController]` and route configurations) under [backend/Controllers/](file:///C:/Users/tin.dang/source/AI_Project/Personal_Finance_Tracker_Upgrade/backend/Controllers).
- Inject `I[EntityName]Service` into the controller.

## 6. Build Frontend Components in React
- **Page Component**: Create `[EntityName]Page.jsx` under `frontend/src/pages/`.
  - Use React Hooks (`useState`, `useEffect`) to manage component state and load data from the API endpoint.
- **API Call Setup**: Integrate API requests using the pre-configured `api` client (axios) under `frontend/src/services/api.js`.
  - Example: `const response = await api.get('/api/finance/[entityName_lowercase]');`
- **Route Registration**: Open `frontend/src/App.jsx` and map the page route.
  - Example: `<Route path="/[entityName_lowercase]" element={<[EntityName]Page />} />`

## 7. Verify and Build
- Verify the backend build compiles cleanly:
  ```powershell
  cd backend
  dotnet build
  ```
- Verify the React app compiles and runs cleanly:
  ```powershell
  cd frontend
  npm run dev
  ```
