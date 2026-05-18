# ChecklistHub

ChecklistHub is a platform for creating, managing, and using checklist templates for different activities.

## Users

Users can:

- browse ready-made checklist templates;
- start their own copy from a template;
- edit their personal copy;
- add, delete, and reorder sections/tabs and tasks;
- mark completed steps;
- suggest new templates;
- suggest edits to existing templates.

## Admin

Admins can:

- create official templates;
- approve or reject suggestions;
- edit official versions;
- create template variants for the same topic;
- manage categories, users, and content.

## Suitable Tables

The minimum requirement of 4 tables is easy to cover. A realistic schema includes:

- users
- roles
- checklist_templates
- template_sections
- template_items
- user_checklists
- user_checklist_sections
- user_checklist_items
- suggestions
- comments
- categories

This works well with PostgreSQL and Drizzle because the relationships are clear.

## Web Screens

The web app can easily include 10+ screens:

1. Home
2. Register
3. Login
4. Browse templates
5. Template details
6. Start checklist from template
7. My checklists
8. Checklist execution screen
9. Suggest new activity/template
10. Suggest edit to template
11. User dashboard
12. Admin dashboard
13. Admin template editor
14. Admin suggestions review
15. Categories management

## Mobile Screens

The mobile app can include the most important flows:

1. Login/Register
2. Browse templates
3. My checklists
4. Checklist execution
5. Checklist details/progress
6. Submit suggestion
