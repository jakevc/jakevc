---
title: Conda and containers
author: "Jake VanCampen"
date: '2018-06-26'
slug: conda-and-containers
tags:
  - conda
  - anaconda
  - containers
---



# Conda and Containers

Planemo [documentation](https://planemo.readthedocs.io/en/latest/appliance.html) 

Galaxy dependencies are resolved by dependency resolvers (conda). Conda **recipes** build **packages** that are published to **chanels**. 

For Galacy, Conda manages multiple versions maybe better than brew, apt. YAML and shell recipes. Annotated source packages provides better reproducibility. 

Why not just use docker? 

  - Singularity has been a solution for those that don't want to just run docker. 
  
Best Practice Channels 

  - iuc, bioconda, conda-forge, defaults
  
To use conda outside Planemo: 

  - `conda install pyyaml` 
  
In an isolated env: 

  - `conda create -n yaml pyyaml && source activate yaml` 
  
  
Planemo provides tool-centric use of conda dependencies, i.e. for galaxy tool dev.

```
planemo project_init --template=seqtk_complete seqtk example

cd seqtk_example

planemo conda_install seqtk_seq.xml 

. <(planemo conda_env seqtk seqtk_seq.xml)

planemo test seqtk_seq.xml 
```

Look for the requirements using:
  - `planemo conda_search seqt` 
  - conda search 


Add the requirement to the {tool}.xml with the <requirements></requirements> tag. 

test the tool using `planemo --lint`


## Writing conda recipes

Two components: 
  - meta.yml (metadata for the recipe) 
  - build.sh (unix script that installs the files) 
  
Metadata should contain tests that return 0 upon success. 

example (verify that the installation worked)

```
test:
  commands:
    - bwa 2>&1 | grep 'index sequences in the'
```

build.sh

```
#!/bin/bash
./configure --prefix=$PREFIX
make
make install
```

Conda recipe skeletons provide guidelines for writing conda packages

`conda skeleton {pypi, cran}`


# Common Workflow Language

Common Workflow Language is a way to wrap tools and workflows in a very user-friendly way.
  - Abstracted and high level. 
  - Rabix composer GUI
  - Support for containers, nested workflows. 
  - I would rather use snakemake
  

  





















