# Slow server simulator

This repo contains a very simple simulator for exploring the behavior of a slow
server in a simple distributed system.  For more information, see the
accompanying blog post.

The configuration of the system is currently hardcoded.  It consists of:

- a time limit (how long a period to simulate)
- a total level of client concurrency
- an array of server classes, each of which includes a count and
  latency-per-request for that server.

The hardcoded configuration runs a 10-minute simulation with 10,000 clients, 1
"slow" server that takes 1s per request, and 99 "fast" servers that take 1ms per
request.  Results:
