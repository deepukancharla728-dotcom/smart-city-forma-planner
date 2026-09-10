# SIH Smart City Site Planning – Forma Companion Prototype

## Stack
- Frontend: HTML5 + CSS3 + vanilla JavaScript
- Backend: Java 21 + Spring Boot + Spring Data JPA
- Database: H2 (file-based for demo)
- Map: Leaflet + OpenStreetMap tiles
- Autodesk Forma: used for authoritative site/context/3D/environmental analysis; this app stores the resulting metrics and compares proposals.

## Run on Windows
1. Install JDK 21 and Maven.
2. Open this folder in IntelliJ IDEA / VS Code / Eclipse.
3. Open a terminal in the project folder.
4. Run: `mvn spring-boot:run`
5. Open: `http://localhost:8080`
6. Demo users:
   - Site Planner: planner / planner123
   - Layout Designer: layout / layout123
   - Constructor: constructor / constructor123

## SIH workflow
1. Site Planner adds/selects a real site of at least 1 km².
2. Use Autodesk Forma to create the geolocated project, obtain terrain/context, model buildings/roads/transport/landscape and run environmental analyses.
3. Layout Designer enters/compares proposal metrics from the Forma studies.
4. The backend calculates a transparent prototype efficiency score.
5. Constructor sees all proposals and selects the highest-ranked plan.
6. Export the winning concept from Forma to Revit/IFC/BIM as required by the final workflow.

## Efficiency score
This prototype is NOT Autodesk's official score. It is a competition-friendly weighted decision score:
sunlight 15%, daylight 15%, wind 12%, noise 8%, solar 15%, carbon 15%, terrain 10%, roads 4%, transport 4%, landscaping 2%.

Replace these weights/inputs with your team's final SIH-approved methodology and actual Forma analysis outputs.

## Production upgrades
- PostgreSQL instead of H2
- Spring Security + JWT/SSO instead of demo credentials
- Role-based authorization on every endpoint
- Autodesk APS/Forma integration after your team creates an Autodesk developer app
- GIS validation and geocoding
- Audit trail and versioned proposals
- Real BIM/IFC file upload/export pipeline
- HTTPS and deployment
