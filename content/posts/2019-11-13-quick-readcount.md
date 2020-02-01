---
title: Quick readcount
author: Jake VanCampen
date: '2019-11-13'
tags: [bash, unix, bash script, bioinformatics]
comments: true
---

You are in a directory of gzipped fastq files and want to count the number of reads in each file... but you want the output to look nice and not really leave the command line or have to download some tool. Do it quick. Use some awk and walk away. 

Using GNU parallel: 

```
ls *.gz | parallel "zcat {} | awk -v file={} '{sum+=1}END{print file,sum/4}'" > seqcount.txt
```

Using a for loop:

```
for file in *.gz; do zcat $file | awk -v file=$file '{sum+=1}END{print file,sum/4}';done > seqcount.txt
```

Both result in a file that will tell you how many reads per fastq file you have:

```seqcount.txt
test_1.fastq.gz 250
test_2.fastq.gz 250
test1_1.fastq.gz 500 
test1_2.fastq.gz 500 
test2_2.fastq.gz 750
test2_3.fastq.gz 750 
```

Awk is powerfull and fun to use, this is just a small example of the convenience of using awk to quickly answer questions.

