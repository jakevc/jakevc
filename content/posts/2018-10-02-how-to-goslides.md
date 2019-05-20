---
title: How to make goslides 
author: Jake VanCampen
date: '2018-10-03'
slug: how-to-goslides
tags: [golang, present]
comments: true
---


# Creating Slides in Golang

I am about to give a journal club presentation on a recent epigenetics paper. I have also been learning [golang](https://golang.org/). Many learning materials, and golang presentations I run into are very clean html presentations with absolutely no bells and whistles, that appear to run in the browser. 

I soon found out these presentations are generated from the 'present' package, which is a built in golang tool at golang.org/x/tools. I appreciate the simplicity of these presentations because it allows me to focus on my public speaking skills simply and effieciently. I don't want to think about how to get presenter notes, or decide if my presentation is going to be cross-platform, or even think the thought of bringing a thumb drive to a talk...

It took a second for me to find out how to generate this type of presentation with the features I wanted, namely: 

- Few bells and whistles
- Host on github
- Create whole presentation in vim 

# Setup

Because this is a go package, you will need to install go, if you do not already have go installed you will need to do that. On MacOS you can simply [Downlaod](https://golang.org/dl/) and install the package by clicking on the download file. 

You then need to setup your environment for developing go code. 

Briefly,  

```
# setup workspace directory
$ mkdir -p $HOME

# hello world
$ mkdir -p $HOME/go/src/hello 
$ cd $HOME/go/src/hello

$ vim hello.go
package main

import "fmt"

func main() {
	fmt.Printf("hello, world\n")
}
# :wq 

# build hello world
$ go build

$ ./hello
hello, world
```

To learn more about setting up your go development workspace: [How to Write Go Code](https://golang.org/doc/code.html).

# Tell PATH about go

```
# edit your bash profile
$ vim ~/.bash_profile
...
..
.
# go setup
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
```
```
go get golang.org/x/tools/
go install golang.org/x/tools/cmd/present
```

# Get present

```
go get golang.org/x/tools/
go install golang.org/x/tools/cmd/present
```

Now the present binary should be in your `$GOPATH/bin`, and because of the above step should also be available in your `$PATH`. 


# Make some slides

To make slides in go, create a file with the extention ".slide" in any directory. 

Take a look at the [present package](https://godoc.org/golang.org/x/tools/present) for the syntax details, there are some fun things you can do that I won't get into in this post. 

```
$ cat sample.slide

Title of document
Subtitle of document
15:04 2 Jan 2006
Tags: foo, bar, baz

Author Name
Job title, Company
joe@example.com
http://url/
@twitter_name
Some Text

* Title of slide or section (must have asterisk)

Some Text
```

Run present in the same directory: 

```
$ present
2018/10/03 00:55:33 Open your web browser and visit http://127.0.0.1:3999
```

This will then send you to port 3999, on your localhost, so you ca view your slides in a browser.

# Host on github

Okay, so far what I have shown you still requires you to have your computer with your for a presentation. If you want to host your slides on github, you could work out your own server or something, but the solution is less complicated. 

It turns out that any file with the extension ".slides" (and the correct syntax) is built with `present` and hosted on (https://talks.godoc.org/). 

```
$ mkdir sample
$ mv sample.slide sample/sample.slide

# initialize new git repo
$ git init

# add and commit slides
$ git add sample.slide
$ git commit -m "added first slide" 

# create your github repo on github.com, then:
$ git remote add origin remote repository URL

# Sets the new remote
$ git push -u origin master
```

Now, if you navigate to:

https://talks.godoc.org/github.com/owner/project/sub/directory/sample.slide

You will find your slides rendered, ready for you to access from any browser. That means if you accidentally drop your computer in the bathtub the morning before you presentation, you will still be able to access your slides (as long as your pushed your changes upstream.)

This workflow is great if you don't want to leave the command line to make a quick presentation, or a long one. 

Present also has dynamic support for presenter notes in the browser by pressing 'N' when you are viewing the presentation. The colon ':' sets off presenter notes annotation in your slides file. Read more about that at [package present](https://godoc.org/golang.org/x/tools/present).














