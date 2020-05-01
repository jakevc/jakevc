---
title: Raw data backup 
author: Jake VanCampen
date: '2019-06-14'
tags: [linux,ubuntu,backups,rsync]
comments: true
image: "https://source.unsplash.com/W2OVh2w2Kpo" 
---

## I need to backup my raw data 

I was recently tasked with creating a backup solution for raw data on a shared linux server. The backup is about 8 terabytes, and we decided the frequency should be nightly. It was suggested by a collegue that 'rsync' is  a useful utility for the task, and after googling around I determined that it was a commonly used method for simple linux backups, and appears to be a robust solution used by linux admins and the like. 

Interestingly, most of the examples I found for creating backups with rsync were derived from a seminal [blog post](http://www.mikerubel.org/computers/rsync_snapshots/) on the topic. In the post Mike Rubel describes a system for automating backups using 'rsync' and 'cron', and further extending this simple case to a rotating, snapshot-style backup.  

## Cron is great, and logs are useful 

I ended up using a combination of techniques that I found to best suit my needs. The backup technique is implemented as a cron job every night at 11pm using the following cron logic, where the standard error and standard out of the cron job are appended to the backup log for each backup:

```
0 23 * * *  bash path/to/backup.sh >> path/to/backup.log 2>&1
```

## Program flow

The script starts by defining source and destination paths. Then the disk usage of the backup partition is calculated as a percent. If the usage is greater than or equal to 98%, the backup will report an error and send me an email warning. If the usage check passes, rsync is executed reporting the progress and excluding hidden files and directories. The progress flag is nice because then a `tail -f` of the backup.log file allows you to see real time percent of each file transferred. 

I made the choice to exclude hidden files and directories because my purpose was backup of raw data. The raw data are mostly .fastq files, which are well organized and should contain no monkey business like .git/ or any other processing or version control artifact. Before setup of the cron job, I executed the script to do the full backup which takes a while. With the full backup in place, subsequent backups only need to transfer data with a newer time stamp in the source directory.

The script ends up looking something like this:

```
#!/bin/bash

### CONFIG ###
EMAIL=

SRC=
DST=

# extract percent usage (INT)
USAGE=$(df -h $DSTDIR | awk 'NR==2{print $5}' | grep -o '[0-9]\+')

# check failure of USAGE calculation
if [[ $? -ne 0 ]]; then
  echo "${cmd}: $DST Failed to calculate disk usage, aborting." 1>&2
  echo "${cmd}: $DST Failed to calculate disk usage, aborting." | mail -s "Backup Error: usage calculation" "$EMAIL"
  exit 1
fi

# Check capacity of $DSTDIR. Exit if >= 98% full
if [[ ${USAGE} -ge 98 ]]; then
  echo "${cmd}: $DST is at or above 98% capacity, aborting." 1>&2
  echo "${cmd}: $DST is at or above 98% capacity, aborting." | mail -s "Backup Error: destination usage > 98%" "$EMAIL"
  exit 1
fi
echo "Capacity is <98%, continuing to rsync."

# rsync src to dest
cmd="rsync -avhi --no-owner --no-group --delete --progress --exclude=".*" $SRC $DST"
echo $cmd
$cmd

rsync_err="$?"

# Check rsync exit status
if [[ ${rsync_err} -ne 0 ]]; then
  echo "Emailing Error"
  echo "$cmd: non zero exit (${rsync_err}) from rsync." | mail -s "Backup error: rsync error" "$EMAIL"
  exit 1
fi
echo "Finished. $(date -u +"%Y-%m-%d %H:%M:%S")"
``` 

The script finishes with an echo of the date and time to the log file so that I can later parse the log file more easily. 

## Situational specificity

This simple solution was designed with a few things in mind:

 - The backup partition was mounted to the network file system. 
 - I can maintain this script from the user crontab rather than the root crontab, and still get the desired backup.   
 - The solution is configurable and flexible to changes in backup need. 

## A robust cloud backup solution

During my search for a good solution, I found an [article](https://jarv.is/notes/how-to-backup-linux-server/) using a neat utility called [restic](https://restic.readthedocs.io/en/stable/index.html) to generate cloud backups from linux servers to your choice of cloud provider, with support for flexible snapshot specification: weekly, nightly, or any combination of custom frequencies. If I ever decide to create backups in the cloud, I will be sure to remember this article about [restic](https://restic.readthedocs.io/en/stable/index.html).

