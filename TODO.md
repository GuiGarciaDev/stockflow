BACKEND:
[x] integration tests for resource layer.
[x] rate limiting.
[x] configure cors to use environment variables(frontend url, etc).
[x] Create a config in the properties that will create a default admin user and seed the database.
[x] Move docker-compose file from root to backend folder. This file only run the prod database.

[] Modify the endpoint /production/confirm to be a endpoint that will create a new product based in their raw material quantity available(optional)

[] unit tests for service layer.
[] Study about the improvements of implementing a cache layer in some routes(optional)
[] deploy to production(optional)

FRONTEND:
[x] Start frontend.
[x] Change the login page to a professional design
[x] Change the register page to a professional design
[x] Change the dashboard page to a professional design
[x] Change the raw product page to a professional design
[X] Change the product page to a professional design
[x] Change the favicon
[x] Fix the raw material not selectable in the product page
[x] When updating a product, the user should be able to update the product composition as well, changing the selected raw materials quantity or selecting new ones.
[x] Create a placeholder dropdown to notification button in dashboard header
[x] Change the style of menu dropdowns in the forms(product and raw material pages)
[x] Add mask to currency inputs
[x] Add a max height to the link raw material composition component and add a scroll behavior when the max height is reached. This avoid the height of the entire page increase to infinite.
[x] Update the design of initial loading component to have the same style as the rest of the project.
[x] Update the design of the toasts to have the same style as the rest of the project.
[x] Change the background color of tosts to a solid color without transparency.
[x] Improve the design of the scroll bar of the raw material list composition component.
[x] Create a search to allow the user search for raw materials in the raw material list composition component.
[x] Change the production page to a professional design
[x] Change the design of the notification dropdown to be more elegant and modern.
[x] Create a README.md for the frontend and another for the backend
[x] Update the global README.md file

[x] Make the left sidebar hideable for small screens
[x] Include the default admin credentials in readme.md in case of seed(for tests).
[x] Make the new batch button useful
[x] Change the name of the project to stockflow instead of duckstock

[] Add unit tests.
[] Add cypress integration tests.
[] Translate the entire frontend to brazilian portuguese(optional)
