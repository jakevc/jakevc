---
title: Snakemake examples
author: Jake VanCampen
date: '2019-07-10'
tags: [snakemake, bioinformatics, pipelines, python]
comments: true
image: "https://source.unsplash.com/imP3y00kzFE"
---

I have been using [Snakemake](https://snakemake.readthedocs.io/en/stable/) to pipeline bioinformatics workflows for about a year now. It's time I write a bit about the tool, some common learning hurdles, and how to think about the flow of variables through the workflow. 

# Motivation

Ninety-five percent of my work is data wrangling, the rest is a mix of interpretation and synthesis of results. Bioinformatics data is notoriously messy, with loads of non-standardized data formats and loads more infrequently maintained computational tools for working with them. 

The open source tools that rise above in the bioinformatics ecosystem seem to be those that are written well, are well maintained, and end up being adopted by enough users. The community that surrounds an open source tool ends up perpetuating the maintenance and resulting stability of that tool in the ecosystem. Snakemake is one of these tools. 

There are a number of workflow management systems with various pros and cons that are commonly debated, for example on [Biostars](https://www.biostars.org/p/258436/), [Redit](https://www.reddit.com/r/bioinformatics/comments/73am0k/ncbi_hackathons_discussions_on_bioinformatics/), and [Twitter](https://twitter.com/search?q=snakemake%20poll&src=typd). After evaluating some of the other tools, for example, Nextflow, Common Workflow Language (CWL), and bc-bio, I decided to learn snakemake because I was familiar with a more Pythonic syntax, and figured I had to pick one and stick with it so I could get my work done. Let's look at an example pipeline.

# MultiQC example 

It's common to run fastqc, then multiqc on your fastqc files to aggregate the samples and their QC metrics from multiple tools into one report. The following pipeline is available at my [snakemake-multiqc](https://github.com/jakevc/snakemake_multiqc) example repository, and can be run by following directions in the README. 

The Snakefile below defines two samples "a.chr21", and "b.chr21" as a python list. For each sample, the program fastqc if run, then multiqc is run when all those outputs are finished. 


```python 
# An example of runniung MultiQC in a snakemake workflow.

SAMPS = ["a.chr21", "b.chr21"]

rule all:
    input:
        "data/multiqc/multiqc_report.html",

rule fastqc: 
    input: 
        expand(["ngs-test-data/reads/{sample}.1.fq",
                 "ngs-test-data/reads/{sample}.2.fq"], sample=SAMPS)
    output: 
        expand(["data/fastqc/{sample}.1_fastqc.html",
                "data/fastqc/{sample}.2_fastqc.html"], sample=SAMPS)
    conda: 
        "envs/qc.yml"
    params: 
        threads = "4"
    shell:
        "fastqc -o data/fastqc -t {params.threads} {input}"

rule multiqc: 
    input: 
        expand(["data/fastqc/{sample}.1_fastqc.html",
                "data/fastqc/{sample}.2_fastqc.html"], sample=SAMPS)
    output:
        "data/multiqc/multiqc_report.html"
    conda: 
        "envs/qc.yml"
    shell: 
        "multiqc data -o data/multiqc"

```

Let's dissect that snakefile a bit. We have a forward and reverse read for each sample, that's why we expand the list across the sample variables in the fastqc input specification. The output is similar, but we have new named output files. There are a lot of outputs to fastqc, but specifying one of the final files generated will tell snakemake when the job is finished. 

The "conda" directive is one of my favorite features of snakemake that simplifies deployment across computational resources, and even keeps your local environment organized. This directive allows snakemake to be run with the `--use-conda` command line flag. This will create the conda environment specified in the [environment file](https://docs.conda.io/projects/conda/en/latest/user-guide/tasks/manage-environments.html#creating-an-environment-from-an-environment-yml-file), and run that rule in the isolated conda environment. 

The environment file "envs/qc.yml" looks like this:

```yml
channels:
    - conda-forge
    - bioconda
    - defaults  
dependencies:
    - fastqc=0.11.8
    - multiqc=1.7 
```

The channels listed tell conda where to search for dependencies, and follows the [recommended channel order](https://bioconda.github.io/user/install.html#set-up-channels) which can help the performance of conda dependency solver. 


# Input Functions

Another small example I wrote deals with the use of input functions. This can be a very useful feature to understand. Consider the following example: 

> You have done [insert sequencing method] sequencing of two samples and have three technical replicates per sample, each sequenced on their own lane of the sequencer. The resulting samples are identified by a unique barcode sequence, you thus have six fastq files (barcode1_1.fq, barcode1_2.fq, barcode1_3.fq, barcode2_1.fq, barcode2_2.fq, and barcode2_3.fq). You would like to merge these files by sample and use the resulting files to propagate sample-wise through your pipeline.

The following pipeline is an example of how you can use [input functions](https://snakemake.readthedocs.io/en/stable/snakefiles/rules.html#input-functions-and-unpack) to specify the files you want to merge for each sample, allowing snakemake to use the sample as a wildcard most effectively. 

```python
sample_dict = {"sample1": ["data/barcode1_1.fq", "data/barcode1_2.fq", "data/barcode1_3.fq"],
               "sample2": ["data/barcode2_1.fq", "data/barcode2_2.fq", "data/barcode2_3.fq"]}

rule all:
    input:
        # the final output of the pipeline {sample}.txt for each sample
        expand("data/{sample}.txt", sample=["sample1", "sample2"])

rule first:
    input:
        # input function returns the list of fq files for a given sample using sample_dict
        lambda wildcards: sample_dict[wildcards.sample]
    output:
        "data/{sample}.txt"
    shell:
        # concat the txt in each fq file in the list
        "cat {input} > {output}"`
```

To run this pipeline yourself, and see how it works clone the [git repository](https://github.com/jakevc/snakemake_inputfuncs.git) and follow directions in the README.

# Sticking points

One of the largest hurdles for me when learning snakemake was thinking in terms of the Directed Acyclic Graph (DAG), this is the internal graph that is built by snakemake to learn execution order and dependencies between files in the pipeline. Understanding the concept of a DAG is not difficult, but if snakemake is the first workflow management tool you are learning, it can be confusing to learn how to scale up to a large numbers of files, to use multiple wildcards, or program more complex logic. The most helpful way to learn these dynamics, in my opinion, is to generate small, reproducible examples like the two I have shown above. Each example illustrates a bite-sized pipeline with various features that can be used to learn how one might scale up each idea.

# Final thougts

Snakemake has helped me think more effectively about bioinformatics workflow, and generate pipelines with reproducible computational environments. With some projects, I will just write a bash script, then I often want to iterate over multiple parameter combinations, and tie together other tools realizing I can just put it all together in a Snakemake pipeline. Using Snakemake helps me think clearly about the flow of data throughout my project.

Another useful feature is the [Snakemake Wrappers Repository](https://snakemake-wrappers.readthedocs.io/en/stable/) which exposes the use of test-driven development and continuous integration practices to maintain more reliable execution of commonly used bioinformatics tools. I will probably write more Snakemake examples, as they would have helped me when learning Snakemake, and hope others may find them useful in the learning process.
