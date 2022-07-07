# chripon

## Abstract

`chripon` (or *CHRI*s*P*ipelineJS*ON*) is a simple nodejs JSON converter, transforming a typically human generated JSON file describing a [ChRIS](https://chrisproject.org) pipeline into a collection JSON format suitable for POSTing to a ChRIS API endpoint.

This utility is useful as a CLI tool for other scripts/programs that want to POST a human generated JSON of a ChRIS pipeline to a ChRIS API endpoint.

For reference, a ChRIS pipeline typically contains some descriptive/meta information and a structure defining a tree of plugins, organized in a directed acyclic graph (DAG).

## Background

The ChRIS backend, aka `CUBE`, can accept a JSON object describing a ChRIS pipeline. The submitted JSON object follows a `collection+JSON` schema which in its simplest sense comprises a `template` object of a `data` list elements containing `str:name`, `str:value` dictionary tuples,

```json
    {
        "template": {
          "data": [
                {
                  "name": "authors",
                  "value": "dev@fnndsc.org"
                },
                {
                  "name": "name",
                  "value": "covidnet-test"
                },
                {
                  "name": "description",
                  "value": "covidnet pipeline"
                },
                {
                  "name": "category",
                  "value": "mri"
                },
                {
                  "name": "locked",
                  "value": "true"
                },
                {
                  "name": "plugin_tree",
                  "value": "[{\"plugin_name\":\"pl-med2img\", ..."
                }
            ]
        }
    }   
```

The `collection+JSON` schema can only accept string values. Thus, the `plugin_tree` can be particularly complex to create as a JSON string _de novo_. Arguably a more natural description of a ChRIS pipeline object is

```json
    {
        "authors": "dev@fnndsc.org",
        "name": "covidnet-test",
        "description": "covidnet pipeline",
        "category": "mri",
        "locked": "true",
        "plugin_tree": [
          {
            "plugin_name": "pl-med2img",
            "plugin_version": "1.1.2",
            "previous_index": null,
            "plugin_parameter_default": [
              {
                "name": "inputFileSubStr",
                "default": "dcm"
              },
              {
                "name": "sliceToConvert",
                "default": "0"
              }
            ]
          },
          {
            "plugin_name": "pl-covidnet",
            "plugin_version": "0.2.4",
            "previous_index": 0,
            "plugin_parameter_default": [
              {
                "name": "imagefile",
                "default": "sample.png"
              }
            ]
          },
          {
            "plugin_name": "pl-covidnet-pdfgeneration",
            "plugin_version": "0.2.1",
            "previous_index": 1,
            "plugin_parameter_default": [
              {
                "name": "imagefile",
                "default": "sample.png"
              }
            ]
          }
        ]
    }
```

where the `plugin_tree` is more clearly and straightforwardly specified. Quite simply, `chripon` converts the second JSON into the first.

## Installation

### npm

Using `npm`, simply do

```
npm install -g chripon
```

### github repo

Alternatively, directly from a checked out repo:

```
npm install -g .
```

## Running

The script requires essentially two components: an input source and an output sink. The source should generate a JSON structure, and the output sink in turn receives a JSON structure.

### Input

Input sources can be either explicitly named files, or strings that are piped into the script. For example, a piped input source

```
cat file.json | chripon --stdin ...
```

or a named input file

```
chripon --inputFile file.json ...
```

### Output

Similarly, output destinations are either the standard out stream (`--stdout`) or an explicitly named output file (`--outputFile file.json`).

### Examples

#### I/O with streams

```
cat file.json | chripon --stdin --stdout --stringify plugin_tree
```

#### I/0 with files

```
chripon --inputFile input.json --outputFile output.json --stringify plugin_tree
```

#### Or a mix

```
cat file.json | chripon --stdin --outputFile output.json --stringify plugin_tree
```

## Arguments

```
    --man
    Show this man page. All other options, even if specified, are ignored.

    --verbose
    Be chatty!

    [--stdin] | [-i <inputFile>]
    Input specification. 
    If [--stdin] then input is read from a standard input stream.
    If [-i <inputFile>] then input is read from <inputFile>.
    If both specified, then [--stdin] only is used.

    [--stdout] | [-o <outputFile>] 
    Output specification.
    If [--stdout] then dump resultant JSON to standard output.
    If [-o <outputFile>] then save results to <outputFile>.
    If both specified, then [--stdin] only is used.
    
    [--stringify <JSONkey>]
    If passed, then additionally stringify the JSON key in the input
    specification.

```
