---
title: Redirecting stderr to stdout 
author: Jake VanCampen
date: '2019-08-07'
tags: [bash, unix, bash script, logging, bioinformatics]
comments: true
image: "https://source.unsplash.com/AUfSloKnxUw"
---

When writing commands in a Unix shell, or bash scripts, I often want to log a specific process to check progress during runtime. If I am running a longer job in a `screen` session, I would always rather check a log file than scroll back in the screen sesson...  (possible but annoying). There are a few options, but the most portable option that I always look for (and endup [here](https://askubuntu.com/questions/625224/how-to-redirect-stderr-to-a-file/625230)) is the following:

```
command > out.log 2>&1 
```

This allows you to send the stdout and stderr from the process into out.log.

# Screenlog

Another easy way to log a single long process is by naming your screen log. The following command starts a `screen` session logging the whole session in `out.log`. If you do not specify a `-Logfile`, it will be named `screenlog.0`.

```
screen -L -Logfile out.log
```

Maybe now that I have these tricks written down, I won't have to look them up so often. 

# END
