---
title: Learning golang for bioinformatics
author: Jake VanCampen
date: '2018-09-04'
slug: learning-golang-for-bioinformatics
tags: [golang, bioinformatics]
comments: true
image: "https://source.unsplash.com/BZgB1mxgJ6k"
---

# What is Go? 

[Go](https://golang.org/), or "golang" is a compiled language that was developped at Google in 2009. Golang is an open source language designed for simplicity, and portability within modern computational infrastructures. Golang is statically typed. In practice this means defining the types of variables, and explicitly keeping track of how those types are passed into and out of functions.

Hello World in go looks like this: 

```python
package main

import "fmt"

func main() {
  fmt.Println("Hello, World!")
}
```

I decided to learn golang because it looks beautiful, and I wanted to learn a lower level language than Python or R. I started learning golang with some online tutorials, and then realized I needed more relevant applications to my work. I am currently re-writing command-line tools for processing next-generation sequencing data that I had written in Python. 

# Development Environment

When writing go, all code and binaries are stored in a structured location to provide a standard development workflow. When you download go, it is [recommended](https://golang.org/doc/install) that you download the base packages into `/usr/local`. You will then have a `/usr/local/go` directory that is your go workspace. After adding go to your path:

`export PATH=$PATH/usr/local/go/bin` 

your go code workspace can be a directory with any name and the following structure: 

```
→tree -L 1 golang
.
├── bin
├── pkg
└── src

3 directories, 0 files
```

My workspace is called golang, and contains a bin, pkg, and src directories. To configure this as your workspace, tell go this is where you want to work by adding the GOPATH and GOBIN environment variables in `~/.bash_profile` or `~/.bashrc`.

```
export GOPATH=~/Documents/golang/
export GOBIN=$(go env GOPATH)bin
```

If you execute `go env` on the command-line you will see the value of all go environment variables and see what else can be configured. 

To create a new program, make a directory inside `/src` with the name of the program you want to write. Use simple, descriptive names with only letters. 

There are multiple ways to run go code:

If hello.go is here:

`$GOPATH/src/hello/hello.go`

 - `go run $GOPATH/src/hello/hello.go` runs th program 
 - `go build $GOPATH/src/hello/hello.go` will build the binary `$GOPATH/src/hello/hello` 
 - `go install $GOPATH/src/hello/hello.go` compiles the binary into `$GOPATH/bin/hello` 

For more infomation: ["How to write go code"](https://golang.org/doc/code.html)

# Bioinformatics Tools

I have a some basic command line tools written in Python, specifically for investigating next-generation sequencing data: [nxgn-tools](https://github.com/jakevc/nxgn-tools). The golang version of these are being updated [here](https://github.com/jakevc/nxgnTools) as I finish them. I will talk about my experience writing the first one: `fasta2line`. 

Here is the finished command line tool `fasta2line` that "unwraps" multi-line fasta entries so that there are only two lins per entry: header, and sequence.

```python
package main

/*
This program converts all multiline fasta entries in a file to
single line fasta entries.
*/

import (
	"bufio"
	"bytes"
	"fmt"
	"os"
	"strings"
)

func check(e error) {
	// check if err and panic
	if e != nil {
		panic(e)
	}
}

func combineSeqLine(path string) {
	// read file by line
	inFile, err := os.Open(path)
	check(err)
	defer inFile.Close()
	scanner := bufio.NewScanner(inFile)
	scanner.Split(bufio.ScanLines)

	var entry bytes.Buffer
	var first bool = true

	// scan and parse lines
	for scanner.Scan() {
		line := scanner.Text()

		// firstline case
		if first {
			entry.WriteString(line + "\n")
			first = false
		}
		// write header
		if strings.HasPrefix(line, ">") {
			header := line
			entry.WriteString("\n" + header + "\n")
		}
		// write seq
		if !strings.HasPrefix(line, ">") {
			entry.WriteString(line)
		}
	}
	fmt.Println(entry.String())
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Provide path to multiline fasta file as command line argument")
		return
	}
	// read in the file
	combineSeqLine(os.Args[1])
}
```

There are a few things about this code that were new to me: 

  - lines written to a buffer
  - error handling
  - defer statement 
  
  
The buffio package allows you to scan the bytes of a file by line, then using the byes.buffer package we can write the processed information to the buffer and call the String method on it. If this program were writing to a file, we could gain efficiency by writing each entry at a time from the buffer to the file, instead of printing the whole buffer. 

Error handling in go is gorgeous because of the built-in error type. There are numerous ways to [handle errors in go](https://blog.golang.org/error-handling-and-go), but the basic structure of checking the error is very common because many functions, `os.Open` in this case return a value, and an error. 

```
inFile, err := os.Open(path)
if err != nil {
  panic(err)
}
```
  
Defer simply "defers the execution of a function until the surrounding function returns", this is useful for cleanup tasks like a file.Close(), and can be placed before the processing of the file so that the cleanup is more explicit.

# file.Close()

I have been enjoying learning about golang, and will be likely writing more about it as I learn how to harness go's concurrency to make programs more powerful. I think golang could be very useful for bioinformatics programming, and I am excited to try out some applications.
