---
title: Snakemake examples
author: Jake VanCampen
date: '2019-07-10'
tags: [python, bioinformatics, karyopype, testing]
comments: true
---

I recently created my first Python package, [karyopype](https://github.com/jakevc/karyopype), that enables visualizing genomic ragnes on a set of chromosomes for a given species. 

{{< figure src="/img/karyopype.png" title="karyopype example output" >}}

The package it's self is minimal, containing only a single python module. This simplicity was what allowed me to quickly learn about python packaging, testing, and continuous integration. 


# Karyopype

The package takes only one required argument, the [UCSC version](https://genome.ucsc.edu/FAQ/FAQreleases.html) of the species of interest, for example the most recent human genome assembly: hg38. There are a number of species whole chromosome sizes files are distributed with the package, otherwise one can specify the path to a "chrom.sizes" file obtained from the UCSC database.

```python
# pip install karyopype
# start jupyter notbook 

import karyopype.karyopype as kp

# plot two sets of regions
kp.plot_karyopype("hg38", regions=["/path/to/regions.bed", "/path/to/regions2.bed"])
```

To specify the reigons you would like to plot, a single file, pandas dataframe or a list of files/dataframes can be passed to the `regions` argument.


# Publishing to PyPi

I realized that I would like to be able to use this tool hassle-free in the future, so I decided to publish to PyPi. This will allow me to be able to use the package in the future with a simple `pip install`, and also allow others to use and possibly contribute. 

Publishing a python package to PyPi requires having the correct module structure, and a `setup.py` file, specifying how the distribution should be created. I found a few good tutorials on how to structure the package, and create `setup.py`, I specifically liked this [short documentation](https://python-packaging.readthedocs.io/en/latest/minimal.html) on python packaging that allowed me to get up and running in no time. 

One place I got stuck was including data used by the package in the distribution. Key to this is making sure that the data is in the correct location in the package structure, it turns out the data has to be inside the module directory, rather than the root of the project to be included in the distribution.


```bash
karyopype
├── __init__.py
├── data
│   ├── chromsizes
│   │   ├── gorGor3.chrom.sizes
│   │   ├── hg19.chrom.sizes
│   │   ├── hg38.chrom.sizes
│   │   ├── mm10.chrom.sizes
│   │   ├── nomLeu3.chrom.sizes
│   │   ├── panTro4.chrom.sizes
│   │   └── rheMac8.chrom.sizes
│   ├── fetchSizes.sh
│   ├── hg19_karyopype.png
│   ├── regions.bed
│   └── regions2.bed
└── karyopype.py

```

It's also key that the first few lines specifying package data in `setup.py` file were configured correctly. Here are the first few lines from karyopype's `setup.py`

```python
setup(
    name="karyopype",
    packages=find_packages(exclude=("tests",)),
    package_dir={__name__: __name__},
    package_data={
        'karyopype': ['data/chromsizes/*.chrom.sizes']
    },
    include_dirs=["."],
    include_package_data=True,
    .
    .
    .
)
```

Accessing that data from within the python script is another story, and the best way I could find that would work across platforms is by making use of the `pkg_resources` package to locate the data files once the package is installed on the users machine. This simplest illustrative example of this isfrom this [stack overflow thread](https://stackoverflow.com/questions/779495/python-access-data-in-package-subdirectory) which shows how to do resource extraction with pkg_resources.

```python
import pkg_resources

DATA_PATH = pkg_resources.resource_filename('<package name>', 'data/')
DB_FILE = pkg_resources.resource_filename('<package name>', 'data/sqlite.db')
```

Finally deployment of the package to PyPi requires registering for an account with PyPi (2 min), then doing the following steps each time you make a new distribution.

1. Increment the version number in setup.py
2. Run `python setup.py sdist bdist_wheel` to create the distribution. 
3. Use the [twine] package to check the upload, then register with PyPi. 

In code form:

```bash
# edit version number in setup.py
verion = x.x.x

# build distributions
python setup.py sdist bdist_wheel
twine check dist/karyopype-x.x.x*
twine upload dist/karyopype-x.x.x*
```

Then you can install your package with `pip install <package>`!

# Continuous integration

Continuous integration is the idea that each time you push changes to your code repository, your tests are run on a remote server to ensure that your changes didn't introduce a bug. This is, of course, dependent on you writing good tests. 

There are a number of options when it comes to continuous integration with GitHub. I chose to use[circleci](https://circleci.com/) because it was [recommended](https://hackernoon.com/continuous-integration-circleci-vs-travis-ci-vs-jenkins-41a1c2bd95f5) for smaller projects.  

After creating a free account, and allowing the app access to my GitHub repositories. I wrote some tests for use with [pytest](https://pytest.org/en/latest/), a ubiquitous python testing framework, then added the circleci config.yml file to my project repository. Circleci gives you a template config.yml that you have to edit to make compatable with your test suite, mine ended up looking like this:

```yml
# Python CircleCI 2.0 configuration file
#
# Check https://circleci.com/docs/2.0/language-python/ for more details
#
version: 2
jobs:
  build:
    docker:
      - image: circleci/python:3.7.3
      # Specify service dependencies here if necessary
      # CircleCI maintains a library of pre-built images
      # documented at https://circleci.com/docs/2.0/circleci-images/
      # - image: circleci/postgres:9.4

    working_directory: ~/karyopype

    steps:
      - checkout

      # Download and cache dependencies
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "requirements.txt" }}
            # fallback to using the latest cache if no exact match is found
            - v1-dependencies-

      - run:
          name: install dependencies
          command: |
            python3 -m venv venv
            . venv/bin/activate
            pip install -r requirements.txt
      - save_cache:
          paths:
            - ./venv
          key: v1-dependencies-{{ checksum "requirements.txt" }}

      - run:
          name: run tests
          command: |
            . venv/bin/activate
            pytest 
      - store_artifacts:
          path: test-reports
          destination: test-reports
```

Now each time I add additional functionality, I write tests to go along with that functionality, and then build them into the new distribution. When I push my changes, circleci runs the test suite on an isolated virtual instance, and tells me if they all passed or not.

# Future work 

In the future I would like to make the package available on [bioconda](https://bioconda.github.io/) to more easily integrate with the conda environment ecosystem.

Building a python package is a great exercise to inspire an increased awareness about reproducability, accessability, and quality of code. I had a lot of fun. If you like karyopype, let me know if the comments or on github at github.com/jakevc/karyopype!