---
title:  "Align and count RNA-seq reads with STAR"
date: 2017-11-14
author: "Jake VanCampen"
comments: true
category: "yay"
image: "https://source.unsplash.com/pD4E5J1fSO4"
---


DNA makes RNA makes Protein, as goes the central dogma of molecular biology. RNA sequencing (RNA-seq) allows researchers to quantify which genes of the DNA are being expressed at any given time, in a given sample of DNA. This tool is very powerful because it allows us to ask questions about the difference in gene expression between different individuals, or between time points in the same individual.


RNA-seq produces a text file with millions of sequences we call 'reads' that represent the genes they came from in the genome. These reads are then aligned to the genome, so that the genes they represent can be detected. To look at the differential expression of these genes, the number of RNA-seq reads that align to genes in the known genome are counted.


This post shows my process for aligning RNA-seq reads to a mouse genome, and counting the number of reads that map to specific genes using a program called STAR, and a Python program I wrote to organize the output.


There are a number of programs used to align RNA-seq reads to the genome, but here I will discuss my experience using STAR, which stands for "Spliced Transcripts Alignment to a Reference." STAR is a fully open-source software implemented in C++ code, that is known for being greater than 50 times faster than other aligners, while also improving alignment sensitivity and precision. STAR is also capable of detecting known and novel spice junctions in aligned reads.<sup>[1](https://academic.oup.com/bioinformatics/article/29/1/15/272537)</sup>


## Genome Index

The first step in alignment with STAR is to generate a genome index for the reads to be aligned to. The two components needed to do this are the reference genome you are using, and the GTF file associated with this genome. It can be a bit confusing which genome version, or GTF file version to use because there are a number of databases with quality genomes for common organisms; for example, [GENCODE](https://www.gencodegenes.org/), [ENCODE](https://genome.ucsc.edu/encode/), or [NCBI](https://www.ncbi.nlm.nih.gov/) all have multiple assemblies for mouse and human. STAR recommends in their documentation to use the GENCODE primary assemblies, when available. In this case, I did because I was working with the widely available mouse genome.


I first downloaded both the genome FASTA file and it's associatedd GTF file from GENCDE using the following commands:

```
$ wget ftp://ftp.sanger.ac.uk/pub/gencode/Gencode_mouse/release_M15/GRCm38.primary_assembly.genome.fa.gz

$ wget ftp://ftp.sanger.ac.uk/pub/gencode/Gencode_mouse/release_M15/gencode.vM15.primary_assembly.annotation.gtf.gz
```


I next created a new directory called `star_index` to place both files in. To generate a genome index, I ran the following command as a script on the high-performance computing cluster:

```
# load star
ml STAR

# generate genome index
STAR --runMode genomeGenerate --genomeDir ./star_index \
--readFilesCommand zcat \
--genomeFastaFiles ./star_index/GRCm38.primary_assembly.genome.fa \
--runThreadN 28 \
--outFileNamePrefix ./star_index/ \
--sjdbGTFfile ./star_index/gencode.vM15.primary_assembly.annotation.gtf
```

This took about 35 minutes, after which my `star_index` directory contained the following files:

```
└── star_index
    ├── chrLength.txt
    ├── chrNameLength.txt
    ├── chrName.txt
    ├── chrStart.txt
    ├── exonGeTrInfo.tab
    ├── exonInfo.tab
    ├── gencode.vM15.primary_assembly.annotation.gtf
    ├── geneInfo.tab
    ├── Genome
    ├── genomeParameters.txt
    ├── GRCm38.primary_assembly.genome.fa
    ├── Log.out
    ├── SA
    ├── SAindex
    ├── sjdbInfo.txt
    ├── sjdbList.fromGTF.out.tab
    ├── sjdbList.out.tab
    └── transcriptInfo.tab
```

These are all necessary for subsequents steps, so make sure they were generated, specifically the `geneInfo.tab` and `exonInfo.tab` files, which are used to determine reads mapping to specific genes.

## Align Reads

To organize my output, I created a new directory called `aligned_reads` that will contain the output from STAR. Making sure that all files were in a directory called `reads`, I then aligned 24 files of reads to the genome using the following script:

```
# load star
ml STAR

cd reads

for i in *_R1_001.1.fq.gz;
do STAR --genomeDir ../star_index \
	--readFilesIn $i ${i%_R1_001.1.fq.gz}_R2_001.2.fq.gz \
	--outFileNamePrefix ../aligned_reads/${i%_R1_001.1.fq.gz} \
	--quantMode GeneCounts \
	--runThreadN 28 \
	--readFilesCommand zcat;
done
```


The `--quantMode GeneCounts` option creates a file `ReadsPerGene.out.tab` that counts the number of reads uniquely mapping to each gene, for each file of aligned reads. This will be very helpful for organizing the data to use in a differential expression analysis. I aligned just under 300 million reads using this script in around 1.5 hours.


For each file of reads, the program outputs a number of summary files. For differential expression analysis, `ReadsPerGene.out.tab` is the most important, another useful file is the `log.final.out` file which is the final alignment statistics report.


To summarize all output in a total of two files I wrote a Python script to make a file for use in differential expression analysis, and a file that represents summary statistics for each set of paired-end reads. The two files have the following format:



**counts_per_gene.tsv**

| gene | library_1 | library_2 |    ...    | library_n |
|------|-----------|-----------|-----------|-----------|
|gene_1|   counts  |  counts   |  counts   |  counts   |
|gene_2|   counts  |  counts   |  counts   |  counts   |
| ...  |   counts  |  counts   |  counts   |  counts   |
|gene_n|   counts  |  counts   |  counts   |  counts   |




**count_stats.tsv**

File contains the following columns:

| **file** | **total_reads** | **uniq_reads** | **reads_on_genes** |


The python script use to organize these data is shown here, and the full script can be downloaded from my [github](https://github.com/jakevc/nxgn-tools/blob/master/alignment_tools/count_stats.py).



```python

import pandas as pd
import os

# Generate a table of counts for each gene, for each file.

# firstline case
firstone = True

# loop over all files in working directory
for file in os.listdir():
    filename = file
    if firstone & filename.endswith('ReadsPerGene.out.tab'):
        # grab the filename
        name = filename.split('_L')[0]
        data = pd.read_csv(file, delimiter='\t',
                           header=None, index_col=0,
                           usecols=(0, 3), names=['gene', name])
        # exit firstline case
        firstone = False

    elif filename.endswith('ReadsPerGene.out.tab'):
        name = filename.split('_L')[0]

        # joine each files counts on the gene column
        data = data.join(pd.read_csv(
                         file, delimiter='\t', header=None,
                         index_col=0, usecols=(0, 3),
                         names=['gene', name]))

# write file to output
data.to_csv('counts_per_gene.tsv', sep='\t')


# Generate mapping statistics for each file

# open file for writing
with open('count_stats.tsv', 'w') as fh:
    # write header
    fh.write('file\ttotal_reads\tuniq_reads\treads_on_genes\n')

    # loop over directory
    for file in os.listdir():

        # if it's the log file
        if file.endswith('Log.final.out'):

            # grab the file name
            name = file.split('_L')[0]
            # retain file
            fi = pd.read_csv(
                    file, delimiter='\t', header=None, names=['key', 'value']
                    )
            # retain stats of interest
            fi = fi[
                    fi['key'].str.contains('Number of input reads') |
                    fi['key'].str.contains('Uniquely mapped reads number')
                    ]
            # set index to first column
            fi.set_index('key', inplace=True)

            # cache stats from data frame
            total_reads = fi.value[0]
            uniq_reads = fi.value[1]

            # loop over dir to count reads/gene-model
            for counts in os.listdir():
                if counts.endswith('ReadsPerGene.out.tab'):

                    # to reference current filename
                    if name in counts:
                        current = pd.read_csv(
                                    counts, header=None, delimiter='\t')
                        num_reads_on_gene = sum(current[4:][2])

                        # write to output file
                        fh.write(f'{name}\t{total_reads}\t\
                                    {uniq_reads}\t{num_reads_on_gene}\n')
```


The great thing about this script is it could be used again, given a similar directory structure, and that I still wanted to split the filename on "_L", on another set of reads from any RNA-seq experiment to generate the necessary counts file for differentail expression analysis!
