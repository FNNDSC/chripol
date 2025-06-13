# chripol
## Abstract
`chripol` (or *CHRI*s*POL*ling) is a simple framework for testing some UI features against a simplified and simulated/model CUBE backend. In particular, this package is used to test some experiments concerned with updating a typical CUBE Analysis Table -- while the underlying analyses are asynchronously changed/added/updated. All events in `chripol` are in fact under *synchronous* control, but appear to be *asynchronous* to the software modules. This allows for complete control of events and timing.

Fundamentally, `chripol` shows how a per-table polling approach can be used to some success in updating individual analysis feeds.

The package consists of several `bin` scripts, some `util` and `lib` modules, and a "micro" CUBE called `uCUBE`.

## Background
From the perspective of the UI, individual feeds in a ChRIS system can change their state asynchronously. A feed state change is usually the transition of a running plugin to a completed (or error) state. In most cases the total number of plugins in a feed do not change unless specific action is taken in the UI (for instance visiting a Feed and adding a new plugin); however this assumption is not always valid (in theory it is possible for an executing feed to dynamically add new plugins as execution evolves).

The ChRIS backend offers, for the cost of *one* call to its API, most-but-not-all detail needed to complete a table. Some of the table details, such as `Run Time`, `Size`, and `Progress` require separate calls to the backend - one call for each desired piece of data.

Various regimes for dynamically updating the ChRIS UI "Feed Table" are possible. At first consideration, a strategy that considers each feed separately and polls the backend for changes of this feed seems reasonable. This is especially appealing since some detail in the feed table requires a "deep probe", or a call to the backend, specific to that feed.

However, this per-feed operation can be wasteful/extaneous with time since the determination of a deep probe need can be made at a table level by comparing *current* and *next* table states.

## Installation

### Prerequisites
- Node.js version 14 or higher
- npm (comes with Node.js)

### Install from source
```bash
# Clone or extract the project
cd chripol

# Install dependencies
npm install

# Make scripts executable (if needed)
chmod +x bin/chris_cliui.js
chmod +x bin/CUBE.js
```

### Optional: Global installation
```bash
npm install -g .
```

## Running

### Initial Setup
First, generate the simulated CUBE backend state with some feeds:
```bash
# Create 50 simulated analysis feeds
node bin/CUBE.js --generateNewFeedTable 50

# View all feeds in table format
node bin/CUBE.js --getFullDeepState
```

### Basic Operations

#### CUBE Backend Operations
```bash
# Show help
node bin/CUBE.js --man

# Generate new feed table with specified number of feeds
node bin/CUBE.js --generateNewFeedTable 25

# View paginated feeds (limit 10, offset 5)
node bin/CUBE.js --getDeepState 10,5

# Get specific field value for a feed
node bin/CUBE.js --getFieldForID 3,Size

# Add a new feed
node bin/CUBE.js --addFeed

# Advance a feed's state (simulate job progression)
node bin/CUBE.js --advanceFeed 5
```

#### UI Client Operations
```bash
# Show help
node bin/chris_cliui.js --man

# Simulate polling operation (get 10 feeds starting from offset 0)
node bin/chris_cliui.js --poll 10,0

# Get feeds directly (without polling logic)
node bin/chris_cliui.js --getfeeds 5,0

# Show current UI state
node bin/chris_cliui.js --showState

# Use custom state file
node bin/chris_cliui.js --UIstateFile mystate.json --poll 10,0
```

### Example Workflow
```bash
# 1. Create simulated backend with 20 feeds
node bin/CUBE.js --generateNewFeedTable 20

# 2. Initial UI poll to populate state
node bin/chris_cliui.js --poll 10,0

# 3. View the UI state table
node bin/chris_cliui.js --showState

# 4. Simulate some backend changes
node bin/CUBE.js --advanceFeed 1
node bin/CUBE.js --advanceFeed 3
node bin/CUBE.js --addFeed

# 5. Poll again to see smart update behavior
node bin/chris_cliui.js --poll 10,0

# 6. View updated state
node bin/chris_cliui.js --showState
```

## Key Features

### Smart Polling Algorithm
The core innovation is the intelligent polling system in `cujs.js` that minimizes expensive API calls:

- **Shallow probes**: Reuses cached data when job states haven't changed
- **Deep probes**: Only makes expensive API calls when job completion status changes
- **Progress calculation**: Real-time percentage updates based on job counters
- **State persistence**: Maintains UI state between polling operations

### Simulated Components
- **uCUBE**: Backend simulator with realistic medical analysis data
- **chris_client**: Client library interface to backend
- **cujs**: High-level polling and state management
- **outbox**: Styled terminal output utilities

## Files
- `bin/CUBE.js` - Direct CUBE backend operations CLI
- `bin/chris_cliui.js` - ChRIS UI polling simulation CLI
- `uCUBE/uCUBE.js` - Core CUBE backend simulator
- `lib/chris_client.js` - Client library interface
- `util/cujs.js` - Smart polling algorithm implementation
- `util/outbox.js` - Styled output utilities
