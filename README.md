# chripol

## Abstract

`chripol` (or *CHRI*s*POL*ling) is a simple framework for testing some UI features against a simplified and simulated/model CUBE backend. In particular, this package is used to test some experiments concerned with updating a typical CUBE Analysis Table -- while the underlying analyses are asynchronously changed/added/updated. All events in `chripol` are in fact under _synchronous_ control, but appear to be _asynchronous_ to the software modules. This allows for complete control of events and timing.

Fundamentally, `chripol` shows how a per-table polling approach can be used to some success in updating individual analysis feeds.

The package consists of several `bin` scripts, some `util` and `lib` modules, and a "micro" CUBE called `uCUBE`.

## Background

From the perspective of the UI, individual feeds in a ChRIS system can change their state asynchronously. A feed state change is usually the transition of a running plugin to a completed (or error) state. In most cases the total number of plugins in a feed do not change unless specific action is taken in the UI (for instance visiting a Feed and adding a new plugin); however this assumption is not always valid (in theory it is possible for an executing feed to dynamically add new plugins as execution evolves).

The ChRIS backend offers, for the cost of _one_ call to its API, most-but-not-all detail needed to complete a table. Some of the table details, such as `Run Time`, `Size`, and `Progress` require separate calls to the backend - one call for each desired piece of data.

Various regimes for dynamically updating the ChRIS UI "Feed Table" are possible. At first consideration, a strategy that considers each feed separately and polls the backend for changes of this feed seems reasonable. This is especially appealing since some detail in the feed table requires a "deep probe", or a call to the backend, specific to that feed.

However, this per-feed operation can be wasteful/extaneous with time since the determination of a deep probe need can be made at a table level by comparing _current_ and _next_ table states.

## Installation

### npm

Using `npm`, simply do

```
npm install -g chripol
```

### github repo

Alternatively, directly from a checked out repo:

```
npm install -g .
```

## Running


### Examples

#### Starting up `CUBE`

```
cat file.json | chripon --stdin --stdout --stringify plugin_tree
```

#### Showing an apparently dynamically updating `CUBE` status

```
chripon --inputFile input.json --outputFile output.json --stringify plugin_tree
```

#### Or a mix

```
cat file.json | chripon --stdin --outputFile output.json --stringify plugin_tree
```

