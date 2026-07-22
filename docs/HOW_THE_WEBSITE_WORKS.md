# How the All-In Tournament Trail Website Works

*An Owner's Guide to Understanding the Technology Behind the Website*

## Welcome

This guide is for anyone who wants to understand the All-In Tournament Trail
website without needing to be a professional software developer. It explains
what the major parts do, why they exist, and how they work together.

The website is not one giant piece of technology. It is a collection of tools,
and each tool has a specific job. One builds the screens, one controls their
appearance, one catches mistakes, one publishes the site, and another will
store permanent records.

> **The main idea:** Good software is easier to understand when every part has
> one clear responsibility.

## Think of It Like Building a Bass Boat

You do not buy a hull, set it in the water, and call it a tournament boat. A
complete bass boat brings together many individual parts:

- Hull
- Motor
- Steering
- Electronics
- Trailer
- Seats
- Carpet

Each part is useful, but no single part is the whole boat. Assemble them
correctly and they become a tournament-ready system.

The website works the same way:

- **React** creates the reusable pieces people see and use.
- **Next.js** organizes those pieces into a working website.
- **Tailwind CSS** controls their appearance.
- **Supabase** will store permanent records.
- **Git** records the project's history.
- **Vercel** makes the finished website available on the internet.

Individually, they are tools. Together, they become the All-In Tournament Trail
website.

## The Technology Stack

### React: The Reusable Pieces

React builds reusable pieces of a screen called **components**. A component can
be as small as a button or as large as the main tournament section of a page.

Examples in this project include:

- Header
- Featured Tournament
- Tournament Conditions
- Registration Form
- Latest News
- Footer
- Public Tournament Entries

A page is simply a collection of components arranged for a particular purpose.
If the same component appears on several pages, it can be maintained in one
place instead of being rebuilt each time.

### Next.js: The House Around the Rooms

Next.js turns the React pieces into the actual website. It handles:

- Pages
- Routing, or deciding which page belongs to each web address
- Loading data
- Performance
- Search engine optimization
- Server-side work that should not happen in a visitor's browser

An easy way to remember the relationship is:

> **React builds the rooms. Next.js builds the house.**

React creates what belongs inside each room. Next.js supplies the hallways,
address, utilities, and structure that make the rooms part of one building.

### Tailwind CSS: The Look and Layout

Tailwind CSS controls how the website looks. It helps define:

- Colors
- Spacing
- Fonts
- Buttons
- Page layouts
- Responsive behavior for phones, tablets, and computers

Traditional websites often keep most styling in large CSS files. Tailwind lets
the project place small styling instructions directly beside the component
they affect. That makes it easier to see how a piece is built and styled in one
place.

### TypeScript: The Building Inspector

TypeScript checks the code for many common mistakes before the website is even
run. For example, it can warn when a component expects a tournament date but
receives the wrong kind of information.

Think of TypeScript as a building inspector. It cannot guarantee that every
design choice is perfect, but it catches many structural problems before the
doors open to the public.

### shadcn/ui: Furniture We Own

shadcn/ui provides professionally designed starting points for interface
pieces such as:

- Buttons
- Dialogs
- Tables
- Forms
- Cards

Many interface libraries are like renting furniture: the project can use it,
but has limited control over how it is made. shadcn/ui is more like receiving
the furniture plans and building it in our own shop. The project owns the code
it uses and can customize it completely to match the All-In design.

> shadcn/ui is a toolbox, not a requirement to turn every section into a card.
> The project still favors a clean, minimal, typography-driven design.

### Supabase: The Online Filing Cabinet

Supabase is the planned online filing cabinet for permanent project records.
It will store information such as:

- Members
- Registrations
- Tournaments
- Results
- Angler of the Year (AOY) records
- Payment records

Today, registration examples live in temporary in-memory data. That data is
useful for building and testing the public experience, but it is not a
permanent business record. Supabase will replace that temporary storage during
Phase 4, the next major development phase.

### Git: The Project's Time Machine

Git records changes to the project. Each **commit** is a named save point that
explains what changed.

If a later change causes trouble, Git helps a developer compare versions,
understand the history, and restore earlier work when appropriate. It is the
project's time machine and maintenance logbook.

### GitHub: The Safe Online Workshop

GitHub stores another copy of the Git repository online. It protects the
project from depending on one computer and provides a place for developers to
review and collaborate on changes.

Git and GitHub are related but different: Git records the history; GitHub
stores and shares that history online.

### Vercel: The Website's Home on the Internet

Vercel hosts the public website. When someone visits
`allintournamenttrail.com`, Vercel delivers the website to that person's
browser.

Vercel also knows how to build and run a Next.js project, making it the bridge
between the code stored in the repository and the website used by visitors.

## How a Visitor Sees the Website

```text
Visitor
   ↓
Internet
   ↓
Vercel
   ↓
Next.js
   ↓
React Components
   ↓
Tailwind Styles
   ↓
Browser
```

Here is what happens at each step:

1. A **visitor** asks for a page by entering the website address or selecting a
   link.
2. The **internet** carries that request to the website's host.
3. **Vercel** receives the request and runs or delivers the website.
4. **Next.js** finds the correct route, prepares its information, and builds
   the page.
5. **React components** provide the page's working pieces.
6. **Tailwind styles** give those pieces their colors, spacing, type, and
   layout.
7. The visitor's **browser** displays the finished result.

This usually happens so quickly that the visitor experiences it as one simple
page load.

## How a Page Is Built

Consider the homepage. In simplified form, it contains:

```text
Homepage
├── Header
├── Featured Tournament
├── Tournament Conditions
├── Latest News
└── Footer
```

Each piece is a React component with one main responsibility. Next.js assembles
the components into the homepage and connects that page to the correct web
address. Tailwind then controls how the assembled page looks at different
screen sizes.

This is similar to arranging sections in a tournament program. Each section
has its own information, but the reader experiences one complete publication.

## How Registrations Work Today

The current public registration experience can be pictured like this:

```text
Visitor
   ↓
Registration Form
   ↓
Temporary In-Memory Data
   ↓
Confirmation
```

The form and confirmation experience are built, and the site can demonstrate
how registration information should flow. However, registrations are **not yet
stored permanently**. Temporary in-memory data disappears when the running
application starts fresh, so it must not be treated as the official tournament
record.

> **Current limitation:** The public workflow is ready, but permanent
> registration storage belongs to Phase 4.

## How Registrations Will Work

Phase 4 will connect the public experience to permanent storage and begin the
administrative workflow:

```text
Registration Form
        ↓
Next.js Server Action
        ↓
Supabase
        ↓
Confirmation
        ↓
Admin Portal
        ↓
CSV Export
        ↓
WeighFish
        ↓
Results
        ↓
AOY
```

The registration form will send validated information to a Next.js Server
Action. That server-side step will safely save the registration in Supabase.
The visitor will receive confirmation, while authorized administrators will be
able to manage the stored information through the Admin Portal.

Early Online Registrations will be stored only after Square reports a successful credit or debit card payment. A 3% Card Processing Fee applies. Tournament-Morning Registration does not run through the AITT website; the Tournament Director enters walk-up teams or individuals in WeighFish and records Cash or Card. Card payments use the Square reader with the same fee, while cash has no fee.

After the tournament, the official WeighFish CSV will be validated, previewed, and imported through a protected AITT workflow to feed tournament history, results, membership reconciliation, and AOY updates. Registration persistence, Square checkout, and CSV import are planned and are not currently implemented.

That end-to-end connection is the purpose of Phase 4 and the phases that
follow it.

## The Development Workflow

```text
Business Requirements
         ↓
Documentation
         ↓
Codex Prompt
         ↓
Implementation
         ↓
Review
         ↓
Documentation Updates
         ↓
Git Commit
         ↓
Push to GitHub
```

The work begins with the business requirement: what tournament problem needs
to be solved? That decision is written down before code changes begin. A clear
Codex prompt then turns the approved requirement into a focused implementation
task. The result is reviewed and validated, the documentation is brought up to
date, and only then is the work recorded in Git and pushed to GitHub.

Documentation comes first because code should implement an agreed rule, not
invent a business rule by accident. This is especially important for entry
fees, membership eligibility, deadlines, results, and AOY calculations.

## Why the Project Uses Components

The site uses reusable components instead of writing every page as one giant
block. This provides four practical benefits:

- **Consistency:** Shared parts look and behave the same everywhere.
- **Less duplication:** A feature does not need to be copied into every page.
- **Easier maintenance:** Small, focused pieces are easier to understand.
- **Safer updates:** A shared improvement can be made once and verified in all
  the places that use it.

Components also help keep ownership simple. A future maintainer can focus on
the piece that needs attention instead of searching through an enormous page.

## Why Documentation Matters

Documentation is treated as part of the software, not as an optional note
written after the fact. The repository includes several kinds of guidance:

- **Project Status** is the daily dashboard for what is complete and what comes
  next.
- **Decision Log** records important choices and why they were made.
- **Tournament Operations** defines how registration and tournament-day work
  should happen.
- **UI Style Guides** preserve the visual language and interface standards.
- **Repository Audit** records the health and organization of the codebase.
- **This owner's guide** explains how the technologies fit together.

Accurate documentation prevents future work from relying on memory or
guesswork. It lets a new owner or developer understand both the current system
and the reasoning behind it.

> When behavior changes, the related documentation should change with it.

## Future Roadmap

### Phase 4 – Registration Persistence

Connect the registration workflow to Supabase, replace temporary data, and
build the foundation for secure administration.

### Phase 5 – Tournament Administration

Give authorized administrators tools for registrations, news, tournament
status, weather announcements, and CSV exports.

### Phase 6 – WeighFish Integration

Import official tournament CSV files, publish results, calculate AOY, reconcile
memberships, and flag duplicates or likely typing mistakes.

### Phase 7 – Member Experience

Add member profiles, AOY history, tournament history, statistics, and
championship qualification information.

The authoritative current status and detailed priorities live in
`docs/ProjectStatus.md`.

## Glossary

### API

A defined way for two pieces of software to exchange information. It is like a
service counter with a known order form and a known type of response.

### Branch

A separate line of Git work used to develop changes without immediately
altering the main version of the project.

### Build

The process that prepares the project's source files for production use and
checks that the website can be assembled successfully.

### Commit

A Git save point containing a related set of changes and a message describing
them.

### Compile

To translate or check source code so computers can run it. In this project,
TypeScript compilation also catches certain mistakes before release.

### Component

A reusable piece of a website, such as a header, form, table, or tournament
summary.

### Database

An organized, permanent store of information that can be searched and updated.
Supabase will provide the project's database.

### Deployment

The act of publishing a tested version of the website so visitors can use it.

### Environment Variable

A private or environment-specific setting supplied outside the source code,
such as an API key. It lets the same project run safely in different places.

### Hosting

The service that keeps a website available on the internet. Vercel provides
hosting for this project.

### Merge

To combine the changes from one Git branch with another.

### Push

To send local Git commits from a computer to an online repository such as
GitHub.

### Repository

The complete project workspace tracked by Git, including source code,
documentation, configuration, and history.

### Responsive Design

A design approach that allows a page to adapt to phones, tablets, laptops, and
larger screens.

### Route

A web address handled by the application, such as the address for the schedule
or registration page.

### Server

A computer or service that receives requests, performs work, and returns
information. Some Next.js work runs on a server instead of in the visitor's
browser.

### Server Action

A Next.js function that runs securely on the server in response to an action,
such as submitting a registration form.

## Final Thoughts

Software can look incredibly complicated from the outside. In reality, good
software is simply many small pieces, each doing one job well.

The All-In Tournament Trail website follows this philosophy. Each technology
has one responsibility. React builds reusable pieces. Next.js organizes and
runs the site. Tailwind shapes its appearance. TypeScript catches mistakes.
Supabase will preserve its records. Git protects its history. GitHub stores and
shares the project, and Vercel delivers it to visitors.

When all those parts work together, they create a fast, reliable, maintainable
website that can continue growing for many years—just like the right collection
of parts becomes a dependable tournament boat.
