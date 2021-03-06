---
title: "SMRT Sequencing for smart genomics"
author: "Jake VanCampen"
date: 2017-11-03
comments: true
category: "sequence"
image: "https://source.unsplash.com/FGRLnE2CGn8"
---

The University of Oregon Genomics and Cell Characterization Core Facility (GCCCF) hosted a seminar this past Friday, November 3rd in celebration of the new Pacific Biosciences sequencer, the Sequel, that is now accepting [submissions](https://gc3f.uoregon.edu/pacbio-sequencing-2) for long-read sequencing.


# Advances in SMRT sequencing


The seminar kicked off with Steve Turner, Chief Technology Officer at PacBio. Turner's excitement was contagious as he described the advantages of long-read sequencing technologies on the new Sequel system. Of the main points Turner stressed, the most important seemed to be use of long-read sequencing for characterizing genomic structural variation, a phenomena whose importance in genomics is quickly regaining ground, Turner Pointed out.


PacBio's Single Molecule Real Time (SMRT) technology has been criticized for higher per-base-call error rates when compared to Illumina's short read sequencing platforms; however, Turner pointed out the importance that this error is truly random with SMRT sequencing, as opposed to systematic on Illumina platforms. This is evident in the characteristic low quality of base calls at the beginning and end of Illumina's short reads. The randomness of the error on SMRT sequencing platforms results in a a higher **consensus accuracy** over the assembled genomic pieces than for Illumina platforms.


The higher consensus accuracy coupled with read lengths >10 kbps is allowing for an increase in the quality and completeness of reference genomes. Turner pointed this out as a major advantage and strongly encouraged researchers to consider SMRT sequencing when designing whole genome sequencing studies, noting that the use of SMRT sequencing may have a lower "cost per publication" than short read technologies.


The nature of SMRT sequencing allows for another interesting advantage, the bonus detection of DNA-methylation markers during sequencing that can be accessed for free as and addition software with SMRT sequencing, for those interested in epigenetic regulation. This can occur due to the instruments ability to analyze the real-time kinetics of the DNA synthesis as each base is added.


Turner's talk also included advances in isoSeq, PacBio's improving technology that can detect whole transcript "spliceoforms" in the same read "from the poly-A tail to the 5' end." Among the other exciting advances are the expected roll-out of a new SRMT-cell (where the DNA is loaded on the Sequel machine) that will increase the throughput potential 8X, and an improved single-tube library preparation protocol that will decrease the time of library prep from 3 days, to 3 hours. These changes are expected to come sometime in 2019.



# Program specific assembly strategies at the Joint Genome Institute.


The next speaker, Alicia Clum, came representing the Joint Genome Institute (JGI), a US Department of Energy funded sequencing resource located in Walnut Creek, CA, and operated by the University of California Berkeley.


Alicia presented on the projects, and challenges they face as a multi-user resource for sequencing. The lab receives projects from many different researchers in the area, and carries out sequencing projects ranging from microbial genome assembly to plant metagenomics. Alicia presented multiple data figures representing their experience using PacBio sequencing and their excitement for advancements in the technology.


# A genomics roadmap to wine flavor


Dario Cantu Ph.D, assistant professor of Viticulture and Enology at UC Davis, presented on his labs efforts to characterize a genomic roadmap to wine flavor. Cantu researches plant pathogenicity and fungicide resistance, as well as the regulation of fruit development and pathogen susceptibility. Wine grapes are among the plants of interest to Cantu, and he gave a fascinating background in the history of wine-grape genetics.


Cantu came to this seminar to explain the usefulness of PacBio sequencing to produce a genome reference for *Vitis vinifera*, Cabernet Sauvignon. His lab was interested in determining alleles that may be responsible for the different grape phenotypes. These grapes have been selected over thousands of years to be highly heterozygous for desired traits, and the association of allelic variation with phenotype has not been feasible with short read sequencing because of difficulties with phased assembly of short reads.


Cantu presented his results using SRMT sequencing and the open source software FALCON-unzip, to produce a high quality, phased assembly of the *Vitis vinifera* genome. This allowed for 'haplotig' resolution of the genome, which will allow his lab to further uncover the history of wine genetics.


# PacBio at UO

Finally, Doug Turnbull, director of the UO GCCCF, presented on the first successful run with the core's new Sequel system. Turnbull presented results from a bacterial genome, showing a 7GB, high quality run with read lengths >10 kbps.

The Core is now accepting sequencing submissions for around $1200 per SMRT-cell (external), and $800 (internal). Library prep services are also available using state of the art tools for size selection and quality analysis of libraries prior to sequencing.
