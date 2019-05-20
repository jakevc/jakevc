---
title: Download SRA data with fasterq-dump 
author: Jake VanCampen
date: '2019-02-07'
slug: fasterq-dump 
tags: [SRA, public data, fastq]
comments: true
---

The command line tool historically used to download public bioinformatics data from the Sequencing Read Archive (SRA) is fastq-dump. Fastq-dump was awesome when it was developed, until bioinformatics workflows became more parallelized across much larger datasets. Today, the SRA holds just over 5 PB of open access data, and the growth is rapid. 

I was recently testing a pipeline on some public data. As I download fastq files from SRA using fastq-dump, it didn't take long before I was getting impatient. I am a millenial. If downloading a terabyte of sequencing data takes too long I might just start a company over it. I immediately started googling a more efficient solution thinking: "I have access to so many CPU's, hasn't someone made this more parallelizable?" The answer was yes! 

June of 2018 saw the release of fasterq-dump out of the box with [sra-tools](https://github.com/ncbi/sra-tools) from NCBI. It looks like there was also another implementation, [parallel-fastq-dump](https://github.com/rvalieris/parallel-fastq-dump), that had good speedup and just under seven thousand total downloads on bioconda...

Anyhow, I plugged it in and BOOM, data. Not so fastq! When downloading fastq files directly from their SRA accession, fastq-dump and fasterq-dump first dump the data in an intermediate cache file before converting to the desired format, and the default location is `~/ncbi/`. Dumping large amounts of data quickly fills up the disk quota of 10GB that is the standard for linux home directories on a shared file system, resulting in a "disk quota exceeded" error. 

The solution NCBI provides is to configure the cacheing directory using the `vdb-config -i` interface. I was unable to get this to work, so I found [another solution](http://databio.org/posts/downloading_sra_data.html) where you create the configuration files manually. 

```
echo "/repository/user/main/public/root = \"$DATA\"" >> $HOME/.ncbi/user-settings.mkfg
```

Then I added another recommended line:

```
echo "/repository/user/default-path = \"$DATA\"" >> $HOME/.ncbi/user-settings.mkfg
```

As long as `$DATA` is a path where you have plenty of disk space, this should all go well. Just remember to delete your cached .sra files under `$DATA/ncbi/public/sra/`, because that does not happen automatically.

In my search for all this I found a [github thread](https://github.com/ncbi/sra-tools/issues/172) from an issue on sra-tools suggesting the following: 

1) It is inefficient to dump fastq files because 80% of their bulk is quality scores which are rarely used. 

2) You can programmatically access the SRA using Python, Java, and C++ API's to get the data directly. 

3) There are some aligners and programs that already do this (GATK, Hisat2)! 

All extremely interesting information, however there is little documentation at GATK about using sra files directly. I did find one [thread](https://gatkforums.broadinstitute.org/gatk/discussion/7524/how-to-run-gatk-directly-on-sra-files) showing the use of and sra file as an input file to HalpotypeCaller, also Hisat2 just isn't good enough for the effort... It will be interesting to see if any tool devs decide to tap that market anytime soon. Now I'll be on the lookout. 
