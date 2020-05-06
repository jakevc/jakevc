---
title: Slow conda environment solving 
author: Jake VanCampen
date: '2018-11-16'
slug: slow-conda-environment-solving
tags: [conda, anaconda, dependencies]
comments: true
image: "https://source.unsplash.com/EPLrqHHu2WI"
---

Conda is the package manager that comes with an anaconda, or miniconda3 distribution. In my experience, Conda does an excellent job managing dependencies and installing new packages, allowing you to install the packages you want and get back to work... eventually. Conda also provides a virtual environment system that allows for generally reproducible execution environments. Snakemake makes use of this very efficiently. 

I have previously experienced slow environment solving when trying to update or install packages using the conda command. It appears many people also experience this frustration: 

https://github.com/conda/conda/issues/6865

https://github.com/conda/conda/issues/7938

https://github.com/conda/conda/issues/7921

https://github.com/conda/conda/issues/7883

I have also seen some complaints on twitter. 

I typically try and use as small of a Conda environment as possible, but even that can take forever. I recently was configuring a new miniconda install, and wanted to install Snakemake using conda [the recommended method](https://snakemake.readthedocs.io/en/stable/getting_started/installation.html#installation-via-conda), so I followed the directions:

`conda install -c bioconda -c conda-forge snakemake`

This hangs with the output "Solving environment: \" and spins the forward slash until you go to the bathroom and come back... still going... go to lunch and come back... still going...

I thought maybe if I could simplify the command it would take less time. Looking at the Conda documentation I found you can add channels for conda to look through, and even add them to be higher priority or lower priority. In the end I found that this configuration actually finished:

```
conda config --add channels bioconda
conda config --add channels conda-forge
conda install snakemake
``` 

This prepends the two channels to the list of channels conda searches (it actually adds them to a file, ~/.condarc) giving them higher priority while looking for packages to install. This seems to drastically reduce the time it take to solve the conda environment and install the package. I didn't allow solving to finish with the first try because it was taking too long. I am not sure if this solution scales to larger environments, and am not sure how this affects the "core packages set". In the conda documentation they mention:

> Therefore, you can now safely put channels at the bottom of your channel list to provide additional packages that are not in the default channels, and still be confident that these channels will not override the core package set.

So maybe this solution is not the most stable for large dynamic environments, but for a small, isolated environment, it seems to increase sanity. 