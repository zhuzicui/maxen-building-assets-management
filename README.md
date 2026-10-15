# Maxen — building assets management prototype

A clickable, coded version of the Maxen V4 Figma prototype. It is a single self-contained `index.html` (plain HTML, CSS and JavaScript, no build step or dependencies beyond the Public Sans font from Google Fonts).

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
# or
python3 -m http.server 8000
```

Sign in with any password (the email is prefilled with `design@email.com`).

## Screens

| Route | Screen |
| --- | --- |
| `#login` | Sign in |
| `#analytics`, `#analytics-perf` | Portfolio analytics (maintenance / performance tabs) |
| `#assignees`, `#assignee-jon` | Work orders by assignee, and one assignee's work orders |
| `#mywo`, `#tech` | Work orders assigned to me (manager / technician views) |
| `#building`, `#building-analytics`, `#building-perf`, `#building-wo`, `#building-assets` | Maison de Radio-Canada: at a glance, analytics, work orders (list and cards), assets |
| `#wo` | Work order detail with checklist modal and notes |
| `#asset` | Asset detail (Panneaux solaires) with tabs and notes |
| `#calendar` | Schedule work orders in a calendar, with drag and drop |
| `#contacts` | Internal and external contacts |
| `#new-asset`, `#new-wo` | Create asset / create work order forms |
| `#profile` | Profile and communication preferences |

The logo menu switches between the portfolio manager, single-building and technician views, as in the Figma flow.

## Notes

- Charts animate in once per screen visit as they scroll into view, and stay static when the system "reduce motion" setting is on.
- Light and dark themes follow the system setting; the contrast button in the header toggles them.
- Photos, avatars and the logo are vector stand-ins for the Figma image assets.
- The New work order and Profile screens were built from the Figma layer structure rather than screenshots, so they are approximations.
